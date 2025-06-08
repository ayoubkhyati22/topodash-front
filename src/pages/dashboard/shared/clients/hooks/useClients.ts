// hooks/useClients.ts
import { useState, useEffect, useCallback } from 'react';
import { Client, ApiResponse, PageResponse, SearchFilters } from '../types';
import { useAuth } from '../../../../../AuthContext';

interface UseClientsReturn {
  clients: Client[];
  pagination: {
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
  };
  loading: boolean;
  error: string | null;
  searchFilters: SearchFilters;
  currentUserRole: string | null;
  fetchClients: (page?: number, size?: number, filters?: SearchFilters) => Promise<void>;
  handlePageChange: (page: number) => void;
  handleSearch: (filters: SearchFilters) => void;
  clearSearch: () => void;
  refreshClients: () => void;
  setPageSize: (size: number) => void;
  retryLastRequest: () => void;
}

export const useClients = (): UseClientsReturn => {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
  const [pagination, setPagination] = useState({
    pageNumber: 0,
    pageSize: 5,
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
    size: 5,
    filters: {}
  });

  const fetchClients = useCallback(async (
    page: number = 0, 
    size: number = 5, 
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
      if (filters.clientType) {
        params.append('clientType', filters.clientType);
      }
      if (filters.cityName?.trim()) {
        params.append('cityName', filters.cityName.trim());
      }
      if (filters.isActive !== undefined) {
        params.append('isActive', filters.isActive.toString());
      }
      
      // Pour les admins, permettre la recherche par topographe
      // Pour les topographes, le filtrage se fait automatiquement côté backend
      if (filters.topographeId && user.role === 'ADMIN') {
        params.append('topographeId', filters.topographeId.toString());
      }
      
      if (filters.companyName?.trim()) {
        params.append('companyName', filters.companyName.trim());
      }

      // Choisir l'endpoint selon la présence de filtres
      const hasFilters = Object.values(filters).some(value => 
        value !== undefined && value !== '' && value !== null
      );
      
      const endpoint = hasFilters 
        ? `http://localhost:8080/api/client/search?${params.toString()}`
        : `http://localhost:8080/api/client?${params.toString()}`;

      console.log('Fetching clients:', endpoint);

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

      const result: ApiResponse<PageResponse<Client>> = await response.json();
      
      if (!result || typeof result !== 'object') {
        throw new Error('Réponse invalide du serveur');
      }

      if (result.status !== 200) {
        throw new Error(result.message || 'Erreur lors du chargement des données');
      }

      if (!result.data || !Array.isArray(result.data.content)) {
        throw new Error('Format de données invalide');
      }
      
      setClients(result.data.content);
      setPagination({
        pageNumber: result.data.page,
        pageSize: result.data.size,
        totalElements: result.data.totalElements,
        totalPages: result.data.totalPages,
      });

      console.log(`Loaded ${result.data.content.length} clients`);
      
    } catch (err) {
      console.error('Erreur lors du chargement des clients:', err);
      
      let errorMessage = 'Une erreur est survenue lors du chargement';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      setError(errorMessage);
      setClients([]);
      setPagination({
        pageNumber: 0,
        pageSize: size,
        totalElements: 0,
        totalPages: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [user?.token, user?.role]);

  const handlePageChange = useCallback((page: number) => {
    if (page < 0 || (pagination.totalPages > 0 && page >= pagination.totalPages)) {
      console.warn('Page invalide:', page);
      return;
    }
    fetchClients(page, pagination.pageSize, searchFilters);
  }, [fetchClients, pagination.pageSize, pagination.totalPages, searchFilters]);

  const handleSearch = useCallback((filters: SearchFilters) => {
    console.log('Searching with filters:', filters);
    
    // Si l'utilisateur est un topographe, ne pas permettre la recherche par topographe
    // car il ne peut voir que ses propres clients
    const finalFilters = { ...filters };
    if (user?.role === 'TOPOGRAPHE') {
      delete finalFilters.topographeId;
    }
    
    setSearchFilters(finalFilters);
    fetchClients(0, pagination.pageSize, finalFilters);
  }, [fetchClients, pagination.pageSize, user?.role]);

  const clearSearch = useCallback(() => {
    console.log('Clearing search filters');
    setSearchFilters({});
    fetchClients(0, pagination.pageSize, {});
  }, [fetchClients, pagination.pageSize]);

  const refreshClients = useCallback(() => {
    console.log('Refreshing clients');
    fetchClients(pagination.pageNumber, pagination.pageSize, searchFilters);
  }, [fetchClients, pagination.pageNumber, pagination.pageSize, searchFilters]);

  const setPageSize = useCallback((size: number) => {
    if (size < 1 || size > 100) {
      console.warn('Taille de page invalide:', size);
      return;
    }
    console.log('Changing page size to:', size);
    fetchClients(0, size, searchFilters);
  }, [fetchClients, searchFilters]);

  const retryLastRequest = useCallback(() => {
    console.log('Retrying last request');
    fetchClients(lastRequest.page, lastRequest.size, lastRequest.filters);
  }, [fetchClients, lastRequest]);

  // Chargement initial
  useEffect(() => {
    console.log('Initial load of clients');
    fetchClients();
  }, []);

  // Debug: log des changements d'état
  useEffect(() => {
    console.log('Clients state changed:', clients.length, 'clients loaded');
  }, [clients]);

  useEffect(() => {
    console.log('Pagination state changed:', pagination);
  }, [pagination]);

  useEffect(() => {
    if (error) {
      console.error('Error state changed:', error);
    }
  }, [error]);

  return {
    clients,
    pagination,
    loading,
    error,
    searchFilters,
    currentUserRole: user?.role || null,
    fetchClients,
    handlePageChange,
    handleSearch,
    clearSearch,
    refreshClients,
    setPageSize,
    retryLastRequest,
  };
};