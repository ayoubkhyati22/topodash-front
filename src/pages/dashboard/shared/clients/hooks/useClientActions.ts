// hooks/useClientActions.ts
import { useState, useCallback } from 'react';
import { useAuth } from '../../../../../AuthContext';
import { ApiResponse } from '../types';

interface UseClientActionsReturn {
  loading: boolean;
  error: string | null;
  success: boolean;
  activateClient: (id: number) => Promise<boolean>;
  deactivateClient: (id: number) => Promise<boolean>;
  deleteClient: (id: number) => Promise<boolean>;
  resetState: () => void;
}

export const useClientActions = (): UseClientActionsReturn => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const activateClient = useCallback(async (id: number): Promise<boolean> => {
    if (!user?.token) {
      setError('Token d\'authentification manquant');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      console.log(`Activating client ${id}`);

      const response = await fetch(`http://localhost:8080/api/client/${id}/activate`, {
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
      console.error('Erreur lors de l\'activation du client:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  const deactivateClient = useCallback(async (id: number): Promise<boolean> => {
    if (!user?.token) {
      setError('Token d\'authentification manquant');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      console.log(`Deactivating client ${id}`);

      const response = await fetch(`http://localhost:8080/api/client/${id}/deactivate`, {
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
      console.error('Erreur lors de la désactivation du client:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  const deleteClient = useCallback(async (id: number): Promise<boolean> => {
    if (!user?.token) {
      setError('Token d\'authentification manquant');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      console.log(`Deleting client ${id}`);

      const response = await fetch(`http://localhost:8080/api/client/${id}`, {
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
      console.error('Erreur lors de la suppression du client:', err);
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
    activateClient,
    deactivateClient,
    deleteClient,
    resetState,
  };
};