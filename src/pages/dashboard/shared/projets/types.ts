// src/pages/dashboard/shared/projets/types.ts

export interface Project {
    id: number;
    name: string;
    description: string;
    status: 'PLANNING' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
    startDate: string;
    endDate: string;
    createdAt: string;
    
    // Informations du client
    clientId: number;
    clientName: string;
    clientEmail: string;
    clientType: string;
    clientCompanyName: string;
    
    // Informations du topographe
    topographeId: number;
    topographeName: string;
    topographeEmail: string;
    topographeLicenseNumber: string;
    
    // Statistiques des tâches
    totalTasks: number;
    todoTasks: number;
    inProgressTasks: number;
    reviewTasks: number;
    completedTasks: number;
    
    // Informations de progression
    progressPercentage: number;
    weightedProgressPercentage: number;
    daysRemaining: number;
    isOverdue: boolean;
    isCompleted: boolean;
    
    // Techniciens assignés
    assignedTechniciensCount: number;
    assignedTechniciensNames: string;
    
    // Indicateurs de santé du projet
    healthStatus: 'GOOD' | 'WARNING' | 'CRITICAL';
    healthMessage: string;
    
    // Statistiques temporelles
    totalDuration: number;
    elapsedDuration: number;
    timeProgressPercentage: number;
  }
  
  export interface ApiResponse<T> {
    message: string;
    data: T;
    status: number;
  }
  
  export interface PageResponse<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
    hasNext: boolean;
    hasPrevious: boolean;
  }
  
  export interface SearchFilters {
    status?: 'PLANNING' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
    clientId?: number;
    topographeId?: number;
    startDate?: string;
    endDate?: string;
    name?: string;
  }
  
  export interface ProjectCreateRequest {
    name: string;
    description: string;
    clientId: number;
    topographeId: number;
    startDate: string;
    endDate: string;
    status?: 'PLANNING' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
  }
  
  export interface ProjectUpdateRequest {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    status: 'PLANNING' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
  }
  
  export interface Client {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    companyName?: string;
    isActive: boolean;
  }
  
  export interface Topographe {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    licenseNumber: string;
    isActive: boolean;
  }