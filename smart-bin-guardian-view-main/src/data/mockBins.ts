
import { Bin } from "@/types/bin";

// Mock data for bins
export const mockBins: Bin[] = [
  {
    id: "bin001",
    name: "City Center Bin 1",
    garbageLevel: {
      value: 25,
      unit: "percentage"
    },
    temperature: 22.5,
    pressure: 1013.2,
    location: {
      latitude: 40.7128,
      longitude: -74.0060
    },
    status: "empty",
    lastUpdated: new Date().toISOString(),
    installationDate: "2023-01-15T00:00:00.000Z",
    zone: "Downtown",
    notes: "Located near the main entrance of City Hall."
  },
  {
    id: "bin002",
    name: "Park Area Bin 2",
    garbageLevel: {
      value: 75,
      unit: "percentage"
    },
    temperature: 24.1,
    pressure: 1012.8,
    location: {
      latitude: 40.7228,
      longitude: -74.0160
    },
    status: "half",
    lastUpdated: new Date().toISOString(),
    installationDate: "2023-02-22T00:00:00.000Z",
    zone: "Central Park",
    notes: "High traffic area, may need more frequent collection."
  },
  {
    id: "bin003",
    name: "Shopping Mall Bin 3",
    garbageLevel: {
      value: 95,
      unit: "percentage"
    },
    temperature: 26.3,
    pressure: 1011.5,
    location: {
      latitude: 40.7328,
      longitude: -74.0260
    },
    status: "full",
    lastUpdated: new Date().toISOString(),
    installationDate: "2023-03-10T00:00:00.000Z",
    zone: "Retail District",
    notes: "Located near food court, mostly food waste."
  },
  {
    id: "bin004",
    name: "Residential Block 4",
    garbageLevel: {
      value: 12,
      unit: "cm"
    },
    temperature: 21.8,
    pressure: 1013.9,
    location: {
      latitude: 40.7428,
      longitude: -74.0360
    },
    status: "empty",
    lastUpdated: new Date().toISOString(),
    installationDate: "2023-04-05T00:00:00.000Z",
    zone: "Residential Area",
    notes: "Mixed waste collection point."
  },
  {
    id: "bin005",
    name: "School Zone Bin 5",
    garbageLevel: {
      value: 5,
      unit: "cm"
    },
    temperature: 23.4,
    pressure: 1012.1,
    location: {
      latitude: 40.7528,
      longitude: -74.0460
    },
    status: "half",
    lastUpdated: new Date().toISOString(),
    installationDate: "2023-05-20T00:00:00.000Z",
    zone: "Education District",
    notes: "Recycling bin for paper and plastic."
  }
];

// Function to get bin status based on garbage level
export const getBinStatus = (bin: Bin): 'empty' | 'half' | 'full' => {
  if (bin.garbageLevel.unit === 'percentage') {
    if (bin.garbageLevel.value < 30) return 'empty';
    if (bin.garbageLevel.value < 80) return 'half';
    return 'full';
  } else {
    // For cm, lower number means more empty space
    if (bin.garbageLevel.value > 10) return 'empty';
    if (bin.garbageLevel.value > 5) return 'half';
    return 'full';
  }
};

// Helper function to get color for bin status
export const getBinStatusColor = (status: Bin['status']): string => {
  switch (status) {
    case 'empty':
      return 'bg-green-500';
    case 'half':
      return 'bg-yellow-500';
    case 'full':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};
