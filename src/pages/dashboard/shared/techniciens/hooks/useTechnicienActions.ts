// hooks/useTechnicienActions.ts
import { useState, useCallback } from 'react';
import { useAuth } from '../../../../../AuthContext';
import { ApiResponse } from '../types';

interface UseTechnicienActionsReturn {
  loading: boolean;
  error: string | null;
  success: boolean;
  activateTechnicien: (id: number) => Promise<boolean>;
  deactivateTechnicien: (id: number) => Promise<boolean>;
  deleteTechnicien: (id: number) => Promise<boolean>;
  resetState: () => void;
}

export const useTechnicienActions = (): UseTechnicienActionsReturn => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const activateTechnicien = useCallback(async (id: number): Promise<boolean> => {
    if (!user?.token) {
      setError('Token d\'authentification manquant');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      console.log(`Activating technicien ${id}`);

      const response = await fetch(`http://localhost:8080/api/technicien/${id}/activate`, {
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
      console.error('Erreur lors de l\'activation du technicien:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  const deactivateTechnicien = useCallback(async (id: number): Promise<boolean> => {
    if (!user?.token) {
      setError('Token d\'authentification manquant');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      console.log(`Deactivating technicien ${id}`);

      const response = await fetch(`http://localhost:8080/api/technicien/${id}/deactivate`, {
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
      console.error('Erreur lors de la désactivation du technicien:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  const deleteTechnicien = useCallback(async (id: number): Promise<boolean> => {
    if (!user?.token) {
      setError('Token d\'authentification manquant');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      console.log(`Deleting technicien ${id}`);

      const response = await fetch(`http://localhost:8080/api/technicien/${id}`, {
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
      console.error('Erreur lors de la suppression du technicien:', err);
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
    activateTechnicien,
    deactivateTechnicien,
    deleteTechnicien,
    resetState,
  };
};