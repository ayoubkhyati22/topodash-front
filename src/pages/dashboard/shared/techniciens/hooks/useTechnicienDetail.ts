// hooks/useTechnicienDetail.ts
import { useState, useCallback } from 'react';
import { Technicien, ApiResponse } from '../types';
import { useAuth } from '../../../../../AuthContext';

interface UseTechnicienDetailReturn {
  technicien: Technicien | null;
  loading: boolean;
  error: string | null;
  fetchTechnicien: (id: number) => Promise<void>;
  refreshTechnicien: () => void;
  resetState: () => void;
}

export const useTechnicienDetail = (): UseTechnicienDetailReturn => {
  const { user } = useAuth();
  const [technicien, setTechnicien] = useState<Technicien | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentId, setCurrentId] = useState<number | null>(null);

  const fetchTechnicien = useCallback(async (id: number) => {
    if (!user?.token) {
      setError('Token d\'authentification manquant');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setCurrentId(id);

      console.log(`Fetching technicien details for ID: ${id}`);

      const response = await fetch(`http://localhost:8080/api/technicien/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Technicien non trouvé');
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

      const result: ApiResponse<Technicien> = await response.json();
      
      if (!result || typeof result !== 'object') {
        throw new Error('Réponse invalide du serveur');
      }

      if (result.status !== 200) {
        throw new Error(result.message || 'Erreur lors du chargement des données');
      }

      if (!result.data) {
        throw new Error('Données du technicien manquantes');
      }

      console.log('Technicien details loaded:', result.data);
      setTechnicien(result.data);
      
    } catch (err) {
      console.error('Erreur lors du chargement du technicien:', err);
      
      let errorMessage = 'Une erreur est survenue lors du chargement';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      setError(errorMessage);
      setTechnicien(null);
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  const refreshTechnicien = useCallback(() => {
    if (currentId) {
      console.log('Refreshing technicien details');
      fetchTechnicien(currentId);
    }
  }, [currentId, fetchTechnicien]);

  const resetState = useCallback(() => {
    setTechnicien(null);
    setError(null);
    setCurrentId(null);
  }, []);

  return {
    technicien,
    loading,
    error,
    fetchTechnicien,
    refreshTechnicien,
    resetState,
  };
};