// hooks/useProjectEdit.ts
import { useState, useCallback } from 'react';
import { ProjectUpdateRequest, ApiResponse, Project } from '../types';
import { useAuth } from '../../../../../AuthContext';

interface Client {
  id: number;
  firstName: string;
  lastName: string;
  companyName?: string;
  isActive: boolean;
}

interface Topographe {
  id: number;
  firstName: string;
  lastName: string;
  licenseNumber: string;
  isActive: boolean;
}

interface UseProjectEditReturn {
  project: Project | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  clients: Client[];
  topographes: Topographe[];
  loadingClients: boolean;
  loadingTopographes: boolean;
  loadingProject: boolean;
  fetchProject: (id: number) => Promise<void>;
  updateProject: (id: number, data: ProjectUpdateRequest) => Promise<boolean>;
  fetchClients: () => Promise<void>;
  fetchTopographes: () => Promise<void>;
  resetForm: () => void;
}

export const useProjectEdit = (): UseProjectEditReturn => {
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingProject, setLoadingProject] = useState(false);
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
      // Récupérer seulement les clients actifs
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
      
      // Transformer les données pour n'avoir que ce dont on a besoin
      const transformedClients = result.data.content
        .filter((client: any) => client.isActive) // Filtrer seulement les clients actifs
        .map((client: any) => ({
          id: client.id,
          firstName: client.firstName,
          lastName: client.lastName,
          companyName: client.companyName,
          isActive: client.isActive
        }));
      
      setClients(transformedClients);
    } catch (err) {
      console.error('Erreur lors du chargement des clients:', err);
      setError('Impossible de charger les clients');
    } finally {
      setLoadingClients(false);
    }
  }, [user?.token]);

  const fetchTopographes = useCallback(async () => {
    if (!user?.token) return;

    try {
      setLoadingTopographes(true);
      // Récupérer seulement les topographes actifs
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
          firstName: topo.firstName,
          lastName: topo.lastName,
          licenseNumber: topo.licenseNumber,
          isActive: topo.isActive
        }));
      
      setTopographes(transformedTopographes);
    } catch (err) {
      console.error('Erreur lors du chargement des topographes:', err);
      setError('Impossible de charger les topographes');
    } finally {
      setLoadingTopographes(false);
    }
  }, [user?.token]);

  const fetchProject = useCallback(async (id: number) => {
    if (!user?.token) {
      setError('Token d\'authentification manquant');
      return;
    }

    try {
      setLoadingProject(true);
      setError(null);

      const response = await fetch(`http://localhost:8080/api/project/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Projet non trouvé');
        }
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const result: ApiResponse<Project> = await response.json();
      setProject(result.data);
    } catch (err) {
      console.error('Erreur lors du chargement du projet:', err);
      setError(err instanceof Error ? err.message : 'Impossible de charger le projet');
      setProject(null);
    } finally {
      setLoadingProject(false);
    }
  }, [user?.token]);

  const updateProject = useCallback(async (id: number, data: ProjectUpdateRequest): Promise<boolean> => {
    if (!user?.token) {
      setError('Token d\'authentification manquant');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const response = await fetch(`http://localhost:8080/api/project/${id}`, {
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

      const result: ApiResponse<Project> = await response.json();
      setProject(result.data);
      setSuccess(true);
      return true;
    } catch (err) {
      console.error('Erreur lors de la modification du projet:', err);
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
    project,
    loading,
    error,
    success,
    clients,
    topographes,
    loadingClients,
    loadingTopographes,
    loadingProject,
    fetchProject,
    updateProject,
    fetchClients,
    fetchTopographes,
    resetForm,
  };
};