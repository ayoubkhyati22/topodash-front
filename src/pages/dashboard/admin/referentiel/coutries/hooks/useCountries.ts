import { useState, useEffect, useCallback } from 'react';
import { useAuth } from 'AuthContext';

export interface Country {
  id: number;
  name: string;
  code: string;
}

export interface PaginationData {
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

interface UseCountriesResult {
  countries: Country[];
  pagination: PaginationData;
  loading: boolean;
  error: string | null;
  fetchCountries: (page?: number, size?: number) => Promise<void>;
  handlePageChange: (page: number) => void;
  handlePageSizeChange: (size: number) => void;
}

export const useCountries = (initialPageSize = 8): UseCountriesResult => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData>({
    pageNumber: 0,
    pageSize: initialPageSize,
    totalElements: 0,
    totalPages: 0
  });

  const { user } = useAuth();

  const fetchCountries = useCallback(async (page = 0, size = initialPageSize) => {
    if (!user?.token) {
      setError('No authentication token available');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `http://localhost:8080/countries/page/${page}/size/${size}`,
        {
          method: 'GET',
          headers: {
            'accept': '*/*',
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch countries: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === 200) {
        setCountries(result.data.content);
        setPagination({
          pageNumber: result.data.pageNumber,
          pageSize: result.data.pageSize,
          totalElements: result.data.totalElements,
          totalPages: result.data.totalPages
        });
      } else {
        throw new Error(result.message || 'Failed to fetch countries');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching countries:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.token, initialPageSize]);

  const handlePageChange = useCallback((page: number) => {
    if (page >= 0 && page < pagination.totalPages) {
      fetchCountries(page, pagination.pageSize);
    }
  }, [fetchCountries, pagination.totalPages, pagination.pageSize]);

  const handlePageSizeChange = useCallback((size: number) => {
    fetchCountries(0, size);
  }, [fetchCountries]);

  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  return {
    countries,
    pagination,
    loading,
    error,
    fetchCountries,
    handlePageChange,
    handlePageSizeChange
  };
};
