// src/pages/dashboard/shared/projets/hooks/useProjects.ts

import { useState, useEffect, useCallback } from 'react';
import { Project, ApiResponse, PageResponse, SearchFilters } from '../types';
import { useAuth } from '../../../../../AuthContext';

interface UseProjectsReturn {
  projects: Project[];
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
  fetchProjects: (page?: number, size?: number, filters?: SearchFilters) => Promise<void>;
  handlePageChange: (page: number) => void;
  handleSearch: (filters: SearchFilters) => void;
  clearSearch: () => void;
  refreshProjects: () => void;
  setPageSize: (size: number) => void;
  retryLastRequest: () => void;
}

export const useProjects = (): UseProjectsReturn => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
  const [pagination, setPagination] = useState({
    pageNumber: 0,
    pageSize: 5,
    totalElements: 0,
    totalPages: 0,
  });

  const [lastRequest, setLastRequest] = useState<{
    page: number;
    size: number;
    filters: SearchFilters;
  }>({
    page: 0,
    size: 5,
    filters: {}
  });

  const fetchProjects = useCallback(async (
    page: number = 0, 
    size: number = 5, 
    filters: SearchFilters = {}
  ) => {
    if (!user?.token) {
      setError('Token d\'authentification manquant');
      setLoading(false);
      return;
    }

    setLastRequest({ page, size, filters });

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sortBy: 'id',
        sortDir: 'desc'
      });

      const hasSearchFilters = Object.values(filters).some(value => 
        value !== undefined && value !== '' && value !== null
      );

      if (hasSearchFilters) {
        if (filters.status) {
          params.append('status', filters.status);
        }
        if (filters.clientId) {
          params.append('clientId', filters.clientId.toString());
        }
        if (filters.topographeId && user.role === 'ADMIN') {
          params.append('topographeId', filters.topographeId.toString());
        }
        if (filters.startDate) {
          params.append('startDate', filters.startDate);
        }
        if (filters.endDate) {
          params.append('endDate', filters.endDate);
        }
        if (filters.name?.trim()) {
          params.append('name', filters.name.trim());
        }
      }

      const endpoint = hasSearchFilters 
        ? `http://localhost:8080/api/project/search?${params.toString()}`
        : `http://localhost:8080/api/project?${params.toString()}`;

      console.log('Fetching projects from:', endpoint);

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) {
        let errorMessage = `Erreur HTTP: ${response.status}`;
        
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (parseError) {
          console.warn('Impossible de parser la réponse d\'erreur:', parseError);
        }

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
          case 500:
            errorMessage = 'Erreur serveur, veuillez réessayer plus tard';
            break;
        }
        
        throw new Error(errorMessage);
      }

      const result: ApiResponse<PageResponse<Project>> = await response.json();

      if (!result || !result.data) {
        throw new Error('Données manquantes dans la réponse');
      }

      if (!result.data.content || !Array.isArray(result.data.content)) {
        throw new Error('Format de données invalide');
      }
      
      setProjects(result.data.content);
      setPagination({
        pageNumber: result.data.page,
        pageSize: result.data.size,
        totalElements: result.data.totalElements,
        totalPages: result.data.totalPages,
      });

      console.log(`Loaded ${result.data.content.length} projects (Total: ${result.data.totalElements})`);
      
    } catch (err) {
      console.error('Erreur lors du chargement des projets:', err);
      
      let errorMessage = 'Une erreur est survenue lors du chargement';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setProjects([]);
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
    fetchProjects(page, pagination.pageSize, searchFilters);
  }, [fetchProjects, pagination.pageSize, pagination.totalPages, searchFilters]);

  const handleSearch = useCallback((filters: SearchFilters) => {
    console.log('Searching with filters:', filters);
    
    const validatedFilters: SearchFilters = {};
    
    if (filters.status && ['PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED'].includes(filters.status)) {
      validatedFilters.status = filters.status;
    }
    
    if (filters.clientId && typeof filters.clientId === 'number') {
      validatedFilters.clientId = filters.clientId;
    }
    
    if (filters.topographeId && typeof filters.topographeId === 'number' && user?.role === 'ADMIN') {
      validatedFilters.topographeId = filters.topographeId;
    }
    
    if (filters.startDate && typeof filters.startDate === 'string') {
      validatedFilters.startDate = filters.startDate;
    }
    
    if (filters.endDate && typeof filters.endDate === 'string') {
      validatedFilters.endDate = filters.endDate;
    }
    
    if (filters.name && typeof filters.name === 'string' && filters.name.trim()) {
      validatedFilters.name = filters.name.trim();
    }
    
    setSearchFilters(validatedFilters);
    fetchProjects(0, pagination.pageSize, validatedFilters);
  }, [fetchProjects, pagination.pageSize, user?.role]);

  const clearSearch = useCallback(() => {
    console.log('Clearing search filters');
    setSearchFilters({});
    fetchProjects(0, pagination.pageSize, {});
  }, [fetchProjects, pagination.pageSize]);

  const refreshProjects = useCallback(() => {
    console.log('Refreshing projects');
    fetchProjects(pagination.pageNumber, pagination.pageSize, searchFilters);
  }, [fetchProjects, pagination.pageNumber, pagination.pageSize, searchFilters]);

  const setPageSize = useCallback((size: number) => {
    if (size < 1 || size > 100) {
      console.warn('Taille de page invalide:', size);
      return;
    }
    fetchProjects(0, size, searchFilters);
  }, [fetchProjects, searchFilters]);

  const retryLastRequest = useCallback(() => {
    console.log('Retrying last request:', lastRequest);
    fetchProjects(lastRequest.page, lastRequest.size, lastRequest.filters);
  }, [fetchProjects, lastRequest]);

  useEffect(() => {
    console.log('Initial load of projects for user role:', user?.role);
    fetchProjects();
  }, []);

  return {
    projects,
    pagination,
    loading,
    error,
    searchFilters,
    currentUserRole: user?.role || null,
    fetchProjects,
    handlePageChange,
    handleSearch,
    clearSearch,
    refreshProjects,
    setPageSize,
    retryLastRequest,
  };
};