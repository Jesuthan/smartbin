
export interface Bin {
  id: string;
  name: string;
  garbageLevel: {
    value: number;
    unit: 'percentage' | 'cm';
  };
  temperature: number; // in Celsius
  pressure: number; // in hPa
  location: {
    latitude: number;
    longitude: number;
  };
  status: 'empty' | 'half' | 'full';
  lastUpdated: string; // ISO date string
  installationDate?: string; // ISO date string
  zone?: string;
  notes?: string;
}
