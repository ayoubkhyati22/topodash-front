export interface Technicien {
    id: number;
    username: string;
    email: string;
    phoneNumber: string;
    firstName: string;
    lastName: string;
    birthday: string;
    cin: string;
    cityName: string;
    role: string;
    skillLevel: 'JUNIOR' | 'SENIOR' | 'EXPERT';
    specialties: string;
    assignedToTopographeName: string;
    assignedToTopographeId: number;
    createdAt: string;
    isActive: boolean;
    totalTasks: number;
    activeTasks: number;
    completedTasks: number;
    todoTasks: number;
    reviewTasks: number;
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
    skillLevel?: 'JUNIOR' | 'SENIOR' | 'EXPERT';
    cityName?: string;
    isActive?: boolean;
    topographeId?: number;
    specialties?: string;
  }
  
  export interface TechnicienCreateRequest {
    username: string;
    email: string;
    password: string;
    phoneNumber: string;
    firstName: string;
    lastName: string;
    birthday: string;
    cin: string;
    cityId: number;
    skillLevel: 'JUNIOR' | 'SENIOR' | 'EXPERT';
    specialties: string;
    assignedToTopographeId: number;
  }
  
  export interface TechnicienUpdateRequest {
    email: string;
    phoneNumber: string;
    firstName: string;
    lastName: string;
    birthday: string;
    cityId: number;
    skillLevel: 'JUNIOR' | 'SENIOR' | 'EXPERT';
    specialties: string;
    assignedToTopographeId: number;
  }