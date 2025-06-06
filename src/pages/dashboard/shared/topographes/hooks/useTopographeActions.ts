import { useState, useCallback } from 'react';
import { useAuth } from '../../../../../AuthContext';
import { ApiResponse } from '../types';

interface UseTopographeActionsReturn {
  loading: boolean;
  error: string | null;
  success: boolean;
  activateTopographe: (id: number) => Promise<boolean>;
  deactivateTopographe: (id: number) => Promise<boolean>;
  deleteTopographe: (id: number) => Promise<boolean>;
  resetState: () => void;
}

export const useTopographeActions = (): UseTopographeActionsReturn => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const activateTopographe = useCallback(async (id: number): Promise<boolean> => {
    if (!user?.token) {
      setError('Token d\'authentification manquant');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      console.log(`Activating topographe ${id}`);

      const response = await fetch(`http://localhost:8080/api/topographe/${id}/activate`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) {
        const errorResult = await response.json().catch(() => ({}));
        throw new Error(errorResult.message || `Erreur HTTP: ${response.status}`);
      }

      const result: ApiResponse<string> = await response.json();
      console.log('Activation response:', result);
      
      setSuccess(true);
      return true;
    } catch (err) {
      console.error('Erreur lors de l\'activation du topographe:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  const deactivateTopographe = useCallback(async (id: number): Promise<boolean> => {
    if (!user?.token) {
      setError('Token d\'authentification manquant');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      console.log(`Deactivating topographe ${id}`);

      const response = await fetch(`http://localhost:8080/api/topographe/${id}/deactivate`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) {
        const errorResult = await response.json().catch(() => ({}));
        throw new Error(errorResult.message || `Erreur HTTP: ${response.status}`);
      }

      const result: ApiResponse<string> = await response.json();
      console.log('Deactivation response:', result);
      
      setSuccess(true);
      return true;
    } catch (err) {
      console.error('Erreur lors de la désactivation du topographe:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  const deleteTopographe = useCallback(async (id: number): Promise<boolean> => {
    if (!user?.token) {
      setError('Token d\'authentification manquant');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      console.log(`Deleting topographe ${id}`);

      const response = await fetch(`http://localhost:8080/api/topographe/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) {
        const errorResult = await response.json().catch(() => ({}));
        throw new Error(errorResult.message || `Erreur HTTP: ${response.status}`);
      }

      const result: ApiResponse<string> = await response.json();
      console.log('Delete response:', result);
      
      setSuccess(true);
      return true;
    } catch (err) {
      console.error('Erreur lors de la suppression du topographe:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  const resetState = useCallback(() => {
    setError(null);
    setSuccess(false);
  }, []);

  return {
    loading,
    error,
    success,
    activateTopographe,
    deactivateTopographe,
    deleteTopographe,
    resetState,
  };
};