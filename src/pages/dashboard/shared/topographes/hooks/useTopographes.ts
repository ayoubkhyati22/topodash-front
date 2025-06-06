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
}

export const useTopographes = (): UseTopographesReturn => {
  const { user } = useAuth();
  const [users, setUsers] = useState<Topographe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
  const [pagination, setPagination] = useState({
    pageNumber: 0,
    pageSize: 5,
    totalElements: 0,
    totalPages: 0,
  });

  const fetchUsers = useCallback(async (
    page: number = 0, 
    size: number = 5, 
    filters: SearchFilters = {}
  ) => {
    if (!user?.token) {
      setError('Token d\'authentification manquant');
      setLoading(false);
      return;
    }

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
      if (filters.specialization) {
        params.append('specialization', filters.specialization);
      }
      if (filters.cityName) {
        params.append('cityName', filters.cityName);
      }
      if (filters.isActive !== undefined) {
        params.append('isActive', filters.isActive.toString());
      }

      // Choisir l'endpoint selon la présence de filtres
      const hasFilters = Object.keys(filters).length > 0;
      const endpoint = hasFilters 
        ? `http://localhost:8080/api/topographe/search?${params.toString()}`
        : `http://localhost:8080/api/topographe?${params.toString()}`;

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const result: ApiResponse<PageResponse<Topographe>> = await response.json();
      
      setUsers(result.data.content);
      setPagination({
        pageNumber: result.data.page,
        pageSize: result.data.size,
        totalElements: result.data.totalElements,
        totalPages: result.data.totalPages,
      });
    } catch (err) {
      console.error('Erreur lors du chargement des topographes:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  const handlePageChange = useCallback((page: number) => {
    fetchUsers(page, pagination.pageSize, searchFilters);
  }, [fetchUsers, pagination.pageSize, searchFilters]);

  const handleSearch = useCallback((filters: SearchFilters) => {
    setSearchFilters(filters);
    fetchUsers(0, pagination.pageSize, filters);
  }, [fetchUsers, pagination.pageSize]);

  const clearSearch = useCallback(() => {
    setSearchFilters({});
    fetchUsers(0, pagination.pageSize, {});
  }, [fetchUsers, pagination.pageSize]);

  // Chargement initial
  useEffect(() => {
    fetchUsers();
  }, []);

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
  };
};