// src/pages/dashboard/shared/clients/types.ts

export interface Client {
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
  clientType: 'INDIVIDUAL' | 'COMPANY' | 'GOVERNMENT';
  companyName: string;
  createdByTopographeName: string;
  createdByTopographeId: number;
  createdAt: string;
  isActive: boolean;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
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
  clientType?: 'INDIVIDUAL' | 'COMPANY' | 'GOVERNMENT';
  cityName?: string;
  isActive?: boolean;
  topographeId?: number;
  companyName?: string;
}

export interface ClientCreateRequest {
  username: string;
  email: string;
  password: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  birthday: string;
  cin: string;
  cityId: number;
  clientType: 'INDIVIDUAL' | 'COMPANY' | 'GOVERNMENT';
  companyName?: string;
  createdByTopographeId: number;
}

export interface ClientUpdateRequest {
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  birthday: string;
  cityId: number;
  clientType: 'INDIVIDUAL' | 'COMPANY' | 'GOVERNMENT';
  companyName?: string;
}