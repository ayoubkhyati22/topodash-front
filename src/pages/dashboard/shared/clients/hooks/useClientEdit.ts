// hooks/useClientEdit.ts
import { useState, useCallback } from 'react';
import { ClientUpdateRequest, ApiResponse, Client } from '../types';
import { useAuth } from '../../../../../AuthContext';
import { City } from 'pages/dashboard/types';

interface UseClientEditReturn {
  client: Client | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  cities: City[];
  loadingCities: boolean;
  loadingClient: boolean;
  fetchClient: (id: number) => Promise<void>;
  updateClient: (id: number, data: ClientUpdateRequest) => Promise<boolean>;
  fetchCities: () => Promise<void>;
  resetForm: () => void;
}

export const useClientEdit = (): UseClientEditReturn => {
  const { user } = useAuth();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingClient, setLoadingClient] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);

  const fetchCities = useCallback(async () => {
    if (!user?.token) return;

    try {
      setLoadingCities(true);
      const response = await fetch('http://localhost:8080/cities', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const result: ApiResponse<City[]> = await response.json();
      setCities(result.data);
    } catch (err) {
      console.error('Erreur lors du chargement des villes:', err);
      setError('Impossible de charger les villes');
    } finally {
      setLoadingCities(false);
    }
  }, [user?.token]);

  const fetchClient = useCallback(async (id: number) => {
    if (!user?.token) {
      setError('Token d\'authentification manquant');
      return;
    }

    try {
      setLoadingClient(true);
      setError(null);

      const response = await fetch(`http://localhost:8080/api/client/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Client non trouvé');
        }
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const result: ApiResponse<Client> = await response.json();
      setClient(result.data);
    } catch (err) {
      console.error('Erreur lors du chargement du client:', err);
      setError(err instanceof Error ? err.message : 'Impossible de charger le client');
      setClient(null);
    } finally {
      setLoadingClient(false);
    }
  }, [user?.token]);

  const updateClient = useCallback(async (id: number, data: ClientUpdateRequest): Promise<boolean> => {
    if (!user?.token) {
      setError('Token d\'authentification manquant');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const response = await fetch(`http://localhost:8080/api/client/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.message || `Erreur HTTP: ${response.status}`);
      }

      const result: ApiResponse<Client> = await response.json();
      setClient(result.data);
      setSuccess(true);
      return true;
    } catch (err) {
      console.error('Erreur lors de la modification du client:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  const resetForm = useCallback(() => {
    setError(null);
    setSuccess(false);
  }, []);

  return {
    client,
    loading,
    error,
    success,
    cities,
    loadingCities,
    loadingClient,
    fetchClient,
    updateClient,
    fetchCities,
    resetForm,
  };
};