import { useState, useEffect, useCallback } from 'react';
import { Topographe, ApiResponse, PageResponse, SearchFilters } from '../types';
import { useAuth } from '../../../../../AuthContext';

interface UseTopographesReturn {
  users: Topographe[];
  pagination: {
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
  };
  loading: boolean;
  error: string | null;
  searchFilters: SearchFilters;
  fetchUsers: (page?: number, size?: number, filters?: SearchFilters) => Promise<void>;
  handlePageChange: (page: number) => void;
  handleSearch: (filters: SearchFilters) => void;
  clearSearch: () => void;
  refreshUsers: () => void;
  setPageSize: (size: number) => void;
  retryLastRequest: () => void;
}

export const useTopographes = (): UseTopographesReturn => {
  const { user } = useAuth();
  const [users, setUsers] = useState<Topographe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
  const [pagination, setPagination] = useState({
    pageNumber: 0,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0,
  });

  // État pour mémoriser la dernière requête en cas de retry
  const [lastRequest, setLastRequest] = useState<{
    page: number;
    size: number;
    filters: SearchFilters;
  }>({
    page: 0,
    size: 10,
    filters: {}
  });

  const fetchUsers = useCallback(async (
    page: number = 0, 
    size: number = 10, 
    filters: SearchFilters = {}
  ) => {
    if (!user?.token) {
      setError('Token d\'authentification manquant');
      setLoading(false);
      return;
    }

    // Mémoriser les paramètres de la requête
    setLastRequest({ page, size, filters });

    try {
      setLoading(true);
      setError(null);

      // Construire l'URL avec les paramètres
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sortBy: 'firstName',
        sortDir: 'asc'
      });

      // Ajouter les filtres de recherche si présents
      if (filters.specialization?.trim()) {
        params.append('specialization', filters.specialization.trim());
      }
      if (filters.cityName?.trim()) {
        params.append('cityName', filters.cityName.trim());
      }
      if (filters.isActive !== undefined) {
        params.append('isActive', filters.isActive.toString());
      }

      // Choisir l'endpoint selon la présence de filtres
      const hasFilters = Object.values(filters).some(value => 
        value !== undefined && value !== '' && value !== null
      );
      
      const endpoint = hasFilters 
        ? `http://localhost:8080/api/topographe/search?${params.toString()}`
        : `http://localhost:8080/api/topographe?${params.toString()}`;

      console.log('Fetching topographes:', endpoint);

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expirée, veuillez vous reconnecter');
        }
        if (response.status === 403) {
          throw new Error('Accès non autorisé à cette ressource');
        }
        if (response.status === 404) {
          throw new Error('Ressource non trouvée');
        }
        if (response.status >= 500) {
          throw new Error('Erreur serveur, veuillez réessayer plus tard');
        }
        
        // Essayer de récupérer le message d'erreur du serveur
        try {
          const errorData = await response.json();
          throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
        } catch {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
      }

      const result: ApiResponse<PageResponse<Topographe>> = await response.json();
      
      if (!result || typeof result !== 'object') {
        throw new Error('Réponse invalide du serveur');
      }

      if (result.status !== 200) {
        throw new Error(result.message || 'Erreur lors du chargement des données');
      }

      if (!result.data || !Array.isArray(result.data.content)) {
        throw new Error('Format de données invalide');
      }
      
      setUsers(result.data.content);
      setPagination({
        pageNumber: result.data.page,
        pageSize: result.data.size,
        totalElements: result.data.totalElements,
        totalPages: result.data.totalPages,
      });

      console.log(`Loaded ${result.data.content.length} topographes`);
      
    } catch (err) {
      console.error('Erreur lors du chargement des topographes:', err);
      
      let errorMessage = 'Une erreur est survenue lors du chargement';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      setError(errorMessage);
      setUsers([]);
      setPagination({
        pageNumber: 0,
        pageSize: size,
        totalElements: 0,
        totalPages: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  const handlePageChange = useCallback((page: number) => {
    if (page < 0 || (pagination.totalPages > 0 && page >= pagination.totalPages)) {
      console.warn('Page invalide:', page);
      return;
    }
    fetchUsers(page, pagination.pageSize, searchFilters);
  }, [fetchUsers, pagination.pageSize, pagination.totalPages, searchFilters]);

  const handleSearch = useCallback((filters: SearchFilters) => {
    console.log('Searching with filters:', filters);
    setSearchFilters(filters);
    fetchUsers(0, pagination.pageSize, filters);
  }, [fetchUsers, pagination.pageSize]);

  const clearSearch = useCallback(() => {
    console.log('Clearing search filters');
    setSearchFilters({});
    fetchUsers(0, pagination.pageSize, {});
  }, [fetchUsers, pagination.pageSize]);

  const refreshUsers = useCallback(() => {
    console.log('Refreshing users');
    fetchUsers(pagination.pageNumber, pagination.pageSize, searchFilters);
  }, [fetchUsers, pagination.pageNumber, pagination.pageSize, searchFilters]);

  const setPageSize = useCallback((size: number) => {
    if (size < 1 || size > 100) {
      console.warn('Taille de page invalide:', size);
      return;
    }
    console.log('Changing page size to:', size);
    fetchUsers(0, size, searchFilters);
  }, [fetchUsers, searchFilters]);

  const retryLastRequest = useCallback(() => {
    console.log('Retrying last request');
    fetchUsers(lastRequest.page, lastRequest.size, lastRequest.filters);
  }, [fetchUsers, lastRequest]);

  // Chargement initial
  useEffect(() => {
    console.log('Initial load of topographes');
    fetchUsers();
  }, []);

  // Debug: log des changements d'état
  useEffect(() => {
    console.log('Users state changed:', users.length, 'users loaded');
  }, [users]);

  useEffect(() => {
    console.log('Pagination state changed:', pagination);
  }, [pagination]);

  useEffect(() => {
    if (error) {
      console.error('Error state changed:', error);
    }
  }, [error]);

  return {
    users,
    pagination,
    loading,
    error,
    searchFilters,
    fetchUsers,
    handlePageChange,
    handleSearch,
    clearSearch,
    refreshUsers,
    setPageSize,
    retryLastRequest,
  };
};