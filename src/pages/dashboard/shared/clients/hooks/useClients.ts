// hooks/useClients.ts - Version corrigée
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
        if (filters.clientType) {
          params.append('clientType', filters.clientType);
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
        if (filters.companyName?.trim()) {
          params.append('companyName', filters.companyName.trim());
        }
      }

      // Choisir l'endpoint selon la présence de filtres de recherche
      const endpoint = hasSearchFilters 
        ? `http://localhost:8080/api/client/search?${params.toString()}`
        : `http://localhost:8080/api/client?${params.toString()}`;

      console.log('Fetching clients from:', endpoint);
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

      const result: ApiResponse<PageResponse<Client>> = await response.json();
      
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
      
      setClients(result.data.content);
      setPagination({
        pageNumber: result.data.page,
        pageSize: result.data.size,
        totalElements: result.data.totalElements,
        totalPages: result.data.totalPages,
      });

      console.log(`Loaded ${result.data.content.length} clients (Total: ${result.data.totalElements})`);
      
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
    console.log('Changing to page:', page);
    fetchClients(page, pagination.pageSize, searchFilters);
  }, [fetchClients, pagination.pageSize, pagination.totalPages, searchFilters]);

  const handleSearch = useCallback((filters: SearchFilters) => {
    console.log('Searching with filters:', filters);
    
    // Valider les filtres avant de les envoyer
    const validatedFilters: SearchFilters = {};
    
    // Valider et nettoyer les filtres
    if (filters.clientType && ['INDIVIDUAL', 'COMPANY', 'GOVERNMENT'].includes(filters.clientType)) {
      validatedFilters.clientType = filters.clientType;
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
    
    if (filters.companyName && typeof filters.companyName === 'string' && filters.companyName.trim()) {
      validatedFilters.companyName = filters.companyName.trim();
    }
    
    console.log('Validated filters:', validatedFilters);
    setSearchFilters(validatedFilters);
    fetchClients(0, pagination.pageSize, validatedFilters);
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
    console.log('Retrying last request:', lastRequest);
    fetchClients(lastRequest.page, lastRequest.size, lastRequest.filters);
  }, [fetchClients, lastRequest]);

  // Chargement initial
  useEffect(() => {
    console.log('Initial load of clients for user role:', user?.role);
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