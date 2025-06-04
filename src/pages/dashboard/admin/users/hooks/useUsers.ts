// hooks/useUsers.ts
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from 'AuthContext';

interface User {
  id: number;
  username: string;
  email: string;
  phoneNumber: string;
  role: string;
}

interface PaginationData {
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

interface UseUsersResult {
  users: User[];
  pagination: PaginationData;
  loading: boolean;
  error: string | null;
  fetchUsers: (page?: number, size?: number) => Promise<void>;
  handlePageChange: (page: number) => void;
}

const API_BASE_URL = 'http://localhost:8080';

export const useUsers = (initialPageSize = 6): UseUsersResult => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData>({
    pageNumber: 0,
    pageSize: initialPageSize,
    totalElements: 0,
    totalPages: 0
  });

  const { user } = useAuth();

  const fetchUsers = useCallback(async (page = 0, size = initialPageSize) => {
    if (!user?.token) {
      setError('No authentication token available');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${API_BASE_URL}/users/page/${page}/size/${size}`,
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
        throw new Error(`Failed to fetch users: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.status === 200) {
        setUsers(result.data.content);
        setPagination({
          pageNumber: result.data.pageNumber,
          pageSize: result.data.pageSize,
          totalElements: result.data.totalElements,
          totalPages: result.data.totalPages
        });
      } else {
        throw new Error(result.message || 'Failed to fetch users');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.token, initialPageSize]);

  const handlePageChange = useCallback((page: number) => {
    if (page >= 0 && page < pagination.totalPages) {
      fetchUsers(page, pagination.pageSize);
    }
  }, [fetchUsers, pagination.totalPages, pagination.pageSize]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    pagination,
    loading,
    error,
    fetchUsers,
    handlePageChange
  };
};