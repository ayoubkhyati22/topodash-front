export interface City {
    id: number;
    name: string;
    region?: {
      id: number;
      name: string;
    };
  }