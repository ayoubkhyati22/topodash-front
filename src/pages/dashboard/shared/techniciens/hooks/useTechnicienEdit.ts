// hooks/useTechnicienEdit.ts
import { useState, useCallback } from 'react';
import { TechnicienUpdateRequest, ApiResponse, Technicien } from '../types';
import { useAuth } from '../../../../../AuthContext';
import { City } from 'pages/dashboard/types';

interface UseTechnicienEditReturn {
  technicien: Technicien | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  cities: City[];
  loadingCities: boolean;
  loadingTechnicien: boolean;
  topographes: Array<{ id: number; name: string; licenseNumber: string }>;
  loadingTopographes: boolean;
  currentUserRole: string | null;
  fetchTechnicien: (id: number) => Promise<void>;
  updateTechnicien: (id: number, data: TechnicienUpdateRequest) => Promise<boolean>;
  fetchCities: () => Promise<void>;
  fetchTopographes: () => Promise<void>;
  resetForm: () => void;
}

export const useTechnicienEdit = (): UseTechnicienEditReturn => {
  const { user } = useAuth();
  const [technicien, setTechnicien] = useState<Technicien | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingTechnicien, setLoadingTechnicien] = useState(false);
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
      
      const transformedTopographes = result.data.content
        .filter((topo: any) => topo.isActive)
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

  const fetchTechnicien = useCallback(async (id: number) => {
    if (!user?.token) {
      setError('Token d\'authentification manquant');
      return;
    }

    try {
      setLoadingTechnicien(true);
      setError(null);

      const response = await fetch(`http://localhost:8080/api/technicien/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Technicien non trouvé');
        }
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const result: ApiResponse<Technicien> = await response.json();
      setTechnicien(result.data);
    } catch (err) {
      console.error('Erreur lors du chargement du technicien:', err);
      setError(err instanceof Error ? err.message : 'Impossible de charger le technicien');
      setTechnicien(null);
    } finally {
      setLoadingTechnicien(false);
    }
  }, [user?.token]);

  const updateTechnicien = useCallback(async (id: number, data: TechnicienUpdateRequest): Promise<boolean> => {
    if (!user?.token) {
      setError('Token d\'authentification manquant');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const response = await fetch(`http://localhost:8080/api/technicien/${id}`, {
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

      const result: ApiResponse<Technicien> = await response.json();
      setTechnicien(result.data);
      setSuccess(true);
      return true;
    } catch (err) {
      console.error('Erreur lors de la modification du technicien:', err);
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
    technicien,
    loading,
    error,
    success,
    cities,
    loadingCities,
    loadingTechnicien,
    topographes,
    loadingTopographes,
    currentUserRole: user?.role || null,
    fetchTechnicien,
    updateTechnicien,
    fetchCities,
    fetchTopographes,
    resetForm,
  };
};