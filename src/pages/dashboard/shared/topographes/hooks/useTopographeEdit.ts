import { useState, useCallback } from 'react';
import { TopographeUpdateRequest, ApiResponse, Topographe } from '../types';
import { useAuth } from '../../../../../AuthContext';
import { City } from 'pages/dashboard/types';

interface UseTopographeEditReturn {
  topographe: Topographe | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  cities: City[];
  loadingCities: boolean;
  loadingTopographe: boolean;
  fetchTopographe: (id: number) => Promise<void>;
  updateTopographe: (id: number, data: TopographeUpdateRequest) => Promise<boolean>;
  fetchCities: () => Promise<void>;
  resetForm: () => void;
}

export const useTopographeEdit = (): UseTopographeEditReturn => {
  const { user } = useAuth();
  const [topographe, setTopographe] = useState<Topographe | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingTopographe, setLoadingTopographe] = useState(false);
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

  const fetchTopographe = useCallback(async (id: number) => {
    if (!user?.token) {
      setError('Token d\'authentification manquant');
      return;
    }

    try {
      setLoadingTopographe(true);
      setError(null);

      const response = await fetch(`http://localhost:8080/api/topographe/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Topographe non trouvé');
        }
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const result: ApiResponse<Topographe> = await response.json();
      setTopographe(result.data);
    } catch (err) {
      console.error('Erreur lors du chargement du topographe:', err);
      setError(err instanceof Error ? err.message : 'Impossible de charger le topographe');
      setTopographe(null);
    } finally {
      setLoadingTopographe(false);
    }
  }, [user?.token]);

  const updateTopographe = useCallback(async (id: number, data: TopographeUpdateRequest): Promise<boolean> => {
    if (!user?.token) {
      setError('Token d\'authentification manquant');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const response = await fetch(`http://localhost:8080/api/topographe/${id}`, {
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

      const result: ApiResponse<Topographe> = await response.json();
      setTopographe(result.data);
      setSuccess(true);
      return true;
    } catch (err) {
      console.error('Erreur lors de la modification du topographe:', err);
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
    topographe,
    loading,
    error,
    success,
    cities,
    loadingCities,
    loadingTopographe,
    fetchTopographe,
    updateTopographe,
    fetchCities,
    resetForm,
  };
};