// src/pages/dashboard/shared/projets/hooks/useProjectForm.ts

import { useState, useCallback } from 'react';
import { ProjectCreateRequest, Client, Topographe } from '../types';
import { useAuth } from '../../../../../AuthContext';

interface UseProjectFormReturn {
  loading: boolean;
  error: string | null;
  success: boolean;
  clients: Client[];
  topographes: Topographe[];
  loadingClients: boolean;
  loadingTopographes: boolean;
  currentUserRole: string | null;
  createProject: (data: ProjectCreateRequest) => Promise<boolean>;
  fetchClients: () => Promise<void>;
  fetchTopographes: () => Promise<void>;
  resetForm: () => void;
}

export const useProjectForm = (): UseProjectFormReturn => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [topographes, setTopographes] = useState<Topographe[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [loadingTopographes, setLoadingTopographes] = useState(false);

  const fetchClients = useCallback(async () => {
    if (!user?.token) return;

    try {
      setLoadingClients(true);
      
      // Récupérer tous les clients actifs
      const response = await fetch('http://localhost:8080/api/client?page=0&size=1000&sortBy=firstName&sortDir=asc', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const result = await response.json();
      
      // Filtrer seulement les clients actifs et transformer les données
      const activeClients = result.data.content
        .filter((client: any) => client.isActive)
        .map((client: any) => ({
          id: client.id,
          firstName: client.firstName,
          lastName: client.lastName,
          email: client.email,
          companyName: client.companyName,
          isActive: client.isActive
        }));
      
      setClients(activeClients);
      
    } catch (err) {
      console.error('Erreur lors du chargement des clients:', err);
      setError('Impossible de charger la liste des clients');
    } finally {
      setLoadingClients(false);
    }
  }, [user?.token]);

  const fetchTopographes = useCallback(async () => {
    if (!user?.token) return;

    try {
      setLoadingTopographes(true);
      
      // Récupérer tous les topographes actifs
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
      
      // Filtrer seulement les topographes actifs et transformer les données
      const activeTopographes = result.data.content
        .filter((topo: any) => topo.isActive)
        .map((topo: any) => ({
          id: topo.id,
          firstName: topo.firstName,
          lastName: topo.lastName,
          email: topo.email,
          licenseNumber: topo.licenseNumber,
          isActive: topo.isActive
        }));
      
      setTopographes(activeTopographes);
      
    } catch (err) {
      console.error('Erreur lors du chargement des topographes:', err);
      setError('Impossible de charger la liste des topographes');
    } finally {
      setLoadingTopographes(false);
    }
  }, [user?.token]);

  const createProject = useCallback(async (data: ProjectCreateRequest): Promise<boolean> => {
    if (!user?.token) {
      setError('Token d\'authentification manquant');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const response = await fetch('http://localhost:8080/api/project', {
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
      console.error('Erreur lors de la création du projet:', err);
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
    clients,
    topographes,
    loadingClients,
    loadingTopographes,
    currentUserRole: user?.role || null,
    createProject,
    fetchClients,
    fetchTopographes,
    resetForm,
  };
};