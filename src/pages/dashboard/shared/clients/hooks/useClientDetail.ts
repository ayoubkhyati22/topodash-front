// hooks/useClientDetail.ts
import { useState, useCallback } from 'react';
import { Client, ApiResponse } from '../types';
import { useAuth } from '../../../../../AuthContext';

interface UseClientDetailReturn {
  client: Client | null;
  loading: boolean;
  error: string | null;
  fetchClient: (id: number) => Promise<void>;
  refreshClient: () => void;
  resetState: () => void;
}

export const useClientDetail = (): UseClientDetailReturn => {
  const { user } = useAuth();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentId, setCurrentId] = useState<number | null>(null);

  const fetchClient = useCallback(async (id: number) => {
    if (!user?.token) {
      setError('Token d\'authentification manquant');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setCurrentId(id);

      console.log(`Fetching client details for ID: ${id}`);

      const response = await fetch(`http://localhost:8080/api/client/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Client non trouvé');
        }
        if (response.status === 401) {
          throw new Error('Session expirée, veuillez vous reconnecter');
        }
        if (response.status === 403) {
          throw new Error('Accès non autorisé à cette ressource');
        }
        if (response.status >= 500) {
          throw new Error('Erreur serveur, veuillez réessayer plus tard');
        }

        // Essayer de récupérer le message d'erreur du serveur
        try {
          const errorData = await response.json();
          throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
        } catch {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
      }

      const result: ApiResponse<Client> = await response.json();
      
      if (!result || typeof result !== 'object') {
        throw new Error('Réponse invalide du serveur');
      }

      if (result.status !== 200) {
        throw new Error(result.message || 'Erreur lors du chargement des données');
      }

      if (!result.data) {
        throw new Error('Données du client manquantes');
      }

      console.log('Client details loaded:', result.data);
      setClient(result.data);
      
    } catch (err) {
      console.error('Erreur lors du chargement du client:', err);
      
      let errorMessage = 'Une erreur est survenue lors du chargement';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      setError(errorMessage);
      setClient(null);
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  const refreshClient = useCallback(() => {
    if (currentId) {
      console.log('Refreshing client details');
      fetchClient(currentId);
    }
  }, [currentId, fetchClient]);

  const resetState = useCallback(() => {
    setClient(null);
    setError(null);
    setCurrentId(null);
  }, []);

  return {
    client,
    loading,
    error,
    fetchClient,
    refreshClient,
    resetState,
  };
};