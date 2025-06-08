// src/pages/dashboard/shared/projets/hooks/useProjectActions.ts

import { useState, useCallback } from 'react';
import { useAuth } from '../../../../../AuthContext';
import { ApiResponse } from '../types';

interface UseProjectActionsReturn {
  loading: boolean;
  error: string | null;
  success: boolean;
  deleteProject: (id: number) => Promise<boolean>;
  updateProjectStatus: (id: number, status: string) => Promise<boolean>;
  startProject: (id: number) => Promise<boolean>;
  completeProject: (id: number) => Promise<boolean>;
  cancelProject: (id: number) => Promise<boolean>;
  putOnHold: (id: number) => Promise<boolean>;
  resetState: () => void;
}

export const useProjectActions = (): UseProjectActionsReturn => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const deleteProject = useCallback(async (id: number): Promise<boolean> => {
    if (!user?.token) {
      setError('Token d\'authentification manquant');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      console.log(`Deleting project ${id}`);

      const response = await fetch(`http://localhost:8080/api/project/${id}`, {
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
      console.error('Erreur lors de la suppression du projet:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  const updateProjectStatus = useCallback(async (id: number, status: string): Promise<boolean> => {
    if (!user?.token) {
      setError('Token d\'authentification manquant');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      console.log(`Updating project ${id} status to ${status}`);

      const response = await fetch(`http://localhost:8080/api/project/${id}/status?status=${status}`, {
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

      const result: ApiResponse<any> = await response.json();
      console.log('Status update response:', result);
      
      setSuccess(true);
      return true;
    } catch (err) {
      console.error('Erreur lors de la mise à jour du statut:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  const startProject = useCallback(async (id: number): Promise<boolean> => {
    if (!user?.token) {
      setError('Token d\'authentification manquant');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const response = await fetch(`http://localhost:8080/api/project/${id}/start`, {
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

      setSuccess(true);
      return true;
    } catch (err) {
      console.error('Erreur lors du démarrage du projet:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  const completeProject = useCallback(async (id: number): Promise<boolean> => {
    if (!user?.token) {
      setError('Token d\'authentification manquant');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const response = await fetch(`http://localhost:8080/api/project/${id}/complete`, {
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

      setSuccess(true);
      return true;
    } catch (err) {
      console.error('Erreur lors de la finalisation du projet:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  const cancelProject = useCallback(async (id: number): Promise<boolean> => {
    if (!user?.token) {
      setError('Token d\'authentification manquant');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const response = await fetch(`http://localhost:8080/api/project/${id}/cancel`, {
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

      setSuccess(true);
      return true;
    } catch (err) {
      console.error('Erreur lors de l\'annulation du projet:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  const putOnHold = useCallback(async (id: number): Promise<boolean> => {
    if (!user?.token) {
      setError('Token d\'authentification manquant');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const response = await fetch(`http://localhost:8080/api/project/${id}/hold`, {
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

      setSuccess(true);
      return true;
    } catch (err) {
      console.error('Erreur lors de la mise en attente du projet:', err);
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
    deleteProject,
    updateProjectStatus,
    startProject,
    completeProject,
    cancelProject,
    putOnHold,
    resetState,
  };
};