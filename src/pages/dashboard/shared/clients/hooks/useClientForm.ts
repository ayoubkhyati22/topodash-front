// hooks/useClientForm.ts
import { useState, useCallback } from 'react';
import { ClientCreateRequest, ApiResponse } from '../types';
import { useAuth } from '../../../../../AuthContext';
import { City } from 'pages/dashboard/types';

interface UseClientFormReturn {
  loading: boolean;
  error: string | null;
  success: boolean;
  cities: City[];
  loadingCities: boolean;
  topographes: Array<{ id: number; name: string; licenseNumber: string }>;
  loadingTopographes: boolean;
  createClient: (data: ClientCreateRequest) => Promise<boolean>;
  fetchCities: () => Promise<void>;
  fetchTopographes: () => Promise<void>;
  resetForm: () => void;
}

export const useClientForm = (): UseClientFormReturn => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [topographes, setTopographes] = useState<Array<{ id: number; name: string; licenseNumber: string }>>([]);
  const [loadingTopographes, setLoadingTopographes] = useState(false);

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

  const fetchTopographes = useCallback(async () => {
    if (!user?.token) return;

    try {
      setLoadingTopographes(true);
      // Récupérer seulement les topographes actifs - on utilisera une page assez grande pour tous les récupérer
      const response = await fetch('http://localhost:8080/api/topographe?page=0&size=1000&sortBy=firstName&sortDir=asc', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const result = await response.json();
      
      // Transformer les données pour n'avoir que ce dont on a besoin
      const transformedTopographes = result.data.content
        .filter((topo: any) => topo.isActive) // Filtrer seulement les topographes actifs
        .map((topo: any) => ({
          id: topo.id,
          name: `${topo.firstName} ${topo.lastName}`,
          licenseNumber: topo.licenseNumber
        }));
      
      setTopographes(transformedTopographes);
    } catch (err) {
      console.error('Erreur lors du chargement des topographes:', err);
      setError('Impossible de charger les topographes');
    } finally {
      setLoadingTopographes(false);
    }
  }, [user?.token]);

  const createClient = useCallback(async (data: ClientCreateRequest): Promise<boolean> => {
    if (!user?.token) {
      setError('Token d\'authentification manquant');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const response = await fetch('http://localhost:8080/api/client', {
        method: 'POST',
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

      setSuccess(true);
      return true;
    } catch (err) {
      console.error('Erreur lors de la création du client:', err);
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
    loading,
    error,
    success,
    cities,
    loadingCities,
    topographes,
    loadingTopographes,
    createClient,
    fetchCities,
    fetchTopographes,
    resetForm,
  };
};