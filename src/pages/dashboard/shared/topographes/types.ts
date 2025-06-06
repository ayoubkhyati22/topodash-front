export interface Topographe {
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
    licenseNumber: string;
    specialization: string;
    createdAt: string;
    isActive: boolean;
    totalClients: number;
    totalTechniciens: number;
    totalProjects: number;
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
    specialization?: string;
    cityName?: string;
    isActive?: boolean;
  }

  export interface TopographeCreateRequest {
    username: string;
    email: string;
    password: string;
    phoneNumber: string;
    firstName: string;
    lastName: string;
    birthday: string; // Format: YYYY-MM-DD
    cin: string;
    cityId: number;
    licenseNumber: string;
    specialization: string;
  }
  
  export interface City {
    id: number;
    name: string;
    region?: {
      id: number;
      name: string;
    };
  }

  export interface TopographeUpdateRequest {
    email: string;
    phoneNumber: string;
    firstName: string;
    lastName: string;
    birthday: string; // Format: YYYY-MM-DD
    cityId: number;
    specialization: string;
  }