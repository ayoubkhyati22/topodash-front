// hooks/useTechniciens.ts
import { useState, useEffect, useCallback } from 'react';
import { Technicien, ApiResponse, PageResponse, SearchFilters } from '../types';
import { useAuth } from '../../../../../AuthContext';

interface UseTechniciensReturn {
  techniciens: Technicien[];
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
  fetchTechniciens: (page?: number, size?: number, filters?: SearchFilters) => Promise<void>;
  handlePageChange: (page: number) => void;
  handleSearch: (filters: SearchFilters) => void;
  clearSearch: () => void;
  refreshTechniciens: () => void;
  setPageSize: (size: number) => void;
  retryLastRequest: () => void;
}

export const useTechniciens = (): UseTechniciensReturn => {
  const { user } = useAuth();
  const [techniciens, setTechniciens] = useState<Technicien[]>([]);
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

  const fetchTechniciens = useCallback(async (
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

      // Construire l'URL avec les paramètres de base
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sortBy: 'firstName',
        sortDir: 'asc'
      });

      // Déterminer si on a des filtres de recherche
      const hasSearchFilters = Object.values(filters).some(value => 
        value !== undefined && value !== '' && value !== null
      );

      // Ajouter les filtres de recherche seulement s'ils existent
      if (hasSearchFilters) {
        if (filters.skillLevel) {
          params.append('skillLevel', filters.skillLevel);
        }
        if (filters.cityName?.trim()) {
          params.append('cityName', filters.cityName.trim());
        }
        if (filters.isActive !== undefined) {
          params.append('isActive', filters.isActive.toString());
        }
        if (filters.topographeId && user.role === 'ADMIN') {
          params.append('topographeId', filters.topographeId.toString());
        }
        if (filters.specialties?.trim()) {
          params.append('specialties', filters.specialties.trim());
        }
      }

      // Choisir l'endpoint selon la présence de filtres de recherche
      const endpoint = hasSearchFilters 
        ? `http://localhost:8080/api/technicien/search?${params.toString()}`
        : `http://localhost:8080/api/technicien?${params.toString()}`;

      console.log('Fetching techniciens from:', endpoint);
      console.log('Search filters:', filters);

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) {
        let errorMessage = `Erreur HTTP: ${response.status}`;
        
        // Essayer de récupérer le message d'erreur détaillé du serveur
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.data && typeof errorData.data === 'string') {
            errorMessage = errorData.data;
          }
        } catch (parseError) {
          console.warn('Impossible de parser la réponse d\'erreur:', parseError);
        }

        // Messages d'erreur spécifiques selon le code de statut
        switch (response.status) {
          case 401:
            errorMessage = 'Session expirée, veuillez vous reconnecter';
            break;
          case 403:
            errorMessage = 'Accès non autorisé à cette ressource';
            break;
          case 404:
            errorMessage = 'Ressource non trouvée';
            break;
          case 400:
            errorMessage = 'Paramètres de recherche invalides';
            break;
          case 500:
            errorMessage = 'Erreur serveur, veuillez réessayer plus tard';
            break;
        }
        
        throw new Error(errorMessage);
      }

      const result: ApiResponse<PageResponse<Technicien>> = await response.json();
      
      console.log('API Response:', result);

      if (!result || typeof result !== 'object') {
        throw new Error('Réponse invalide du serveur');
      }

      if (result.status && result.status !== 200) {
        throw new Error(result.message || 'Erreur lors du chargement des données');
      }

      if (!result.data) {
        throw new Error('Données manquantes dans la réponse');
      }

      // Vérifier la structure des données
      if (!result.data.content || !Array.isArray(result.data.content)) {
        console.error('Structure de données inattendue:', result.data);
        throw new Error('Format de données invalide');
      }
      
      setTechniciens(result.data.content);
      setPagination({
        pageNumber: result.data.page,
        pageSize: result.data.size,
        totalElements: result.data.totalElements,
        totalPages: result.data.totalPages,
      });

      console.log(`Loaded ${result.data.content.length} techniciens (Total: ${result.data.totalElements})`);
      
    } catch (err) {
      console.error('Erreur lors du chargement des techniciens:', err);
      
      let errorMessage = 'Une erreur est survenue lors du chargement';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      setError(errorMessage);
      setTechniciens([]);
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
    console.log('Changing to page:', page);
    fetchTechniciens(page, pagination.pageSize, searchFilters);
  }, [fetchTechniciens, pagination.pageSize, pagination.totalPages, searchFilters]);

  const handleSearch = useCallback((filters: SearchFilters) => {
    console.log('Searching with filters:', filters);
    
    // Valider les filtres avant de les envoyer
    const validatedFilters: SearchFilters = {};
    
    // Valider et nettoyer les filtres
    if (filters.skillLevel && ['JUNIOR', 'SENIOR', 'EXPERT'].includes(filters.skillLevel)) {
      validatedFilters.skillLevel = filters.skillLevel;
    }
    
    if (filters.cityName && typeof filters.cityName === 'string' && filters.cityName.trim()) {
      validatedFilters.cityName = filters.cityName.trim();
    }
    
    if (filters.isActive !== undefined && typeof filters.isActive === 'boolean') {
      validatedFilters.isActive = filters.isActive;
    }
    
    if (filters.topographeId && typeof filters.topographeId === 'number' && user?.role === 'ADMIN') {
      validatedFilters.topographeId = filters.topographeId;
    }
    
    if (filters.specialties && typeof filters.specialties === 'string' && filters.specialties.trim()) {
      validatedFilters.specialties = filters.specialties.trim();
    }
    
    console.log('Validated filters:', validatedFilters);
    setSearchFilters(validatedFilters);
    fetchTechniciens(0, pagination.pageSize, validatedFilters);
  }, [fetchTechniciens, pagination.pageSize, user?.role]);

  const clearSearch = useCallback(() => {
    console.log('Clearing search filters');
    setSearchFilters({});
    fetchTechniciens(0, pagination.pageSize, {});
  }, [fetchTechniciens, pagination.pageSize]);

  const refreshTechniciens = useCallback(() => {
    console.log('Refreshing techniciens');
    fetchTechniciens(pagination.pageNumber, pagination.pageSize, searchFilters);
  }, [fetchTechniciens, pagination.pageNumber, pagination.pageSize, searchFilters]);

  const setPageSize = useCallback((size: number) => {
    if (size < 1 || size > 100) {
      console.warn('Taille de page invalide:', size);
      return;
    }
    console.log('Changing page size to:', size);
    fetchTechniciens(0, size, searchFilters);
  }, [fetchTechniciens, searchFilters]);

  const retryLastRequest = useCallback(() => {
    console.log('Retrying last request:', lastRequest);
    fetchTechniciens(lastRequest.page, lastRequest.size, lastRequest.filters);
  }, [fetchTechniciens, lastRequest]);

  // Chargement initial
  useEffect(() => {
    console.log('Initial load of techniciens for user role:', user?.role);
    fetchTechniciens();
  }, []);

  // Debug: log des changements d'état
  useEffect(() => {
    console.log('Techniciens state changed:', techniciens.length, 'techniciens loaded');
  }, [techniciens]);

  useEffect(() => {
    console.log('Pagination state changed:', pagination);
  }, [pagination]);

  useEffect(() => {
    if (error) {
      console.error('Error state changed:', error);
    }
  }, [error]);

  return {
    techniciens,
    pagination,
    loading,
    error,
    searchFilters,
    currentUserRole: user?.role || null,
    fetchTechniciens,
    handlePageChange,
    handleSearch,
    clearSearch,
    refreshTechniciens,
    setPageSize,
    retryLastRequest,
  };
};