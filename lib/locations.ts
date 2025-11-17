// Location mapping from 19hz.info
// Based on https://19hz.info/

export interface LocationMapping {
  name: string;
}

export const LOCATIONS: Record<string, LocationMapping> = {
  'bay-area': {
    name: 'San Francisco Bay Area / Northern California',
  },
  'los-angeles': {
    name: 'Los Angeles / Southern California',
  },
  'seattle': {
    name: 'Seattle',
  },
  'atlanta': {
    name: 'Atlanta',
  },
  'miami': {
    name: 'Miami',
  },
  'dc': {
    name: 'Washington, DC / Maryland / Virginia',
  },
  'texas': {
    name: 'Texas',
  },
  'philadelphia': {
    name: 'Philadelphia',
  },
  'toronto': {
    name: 'Toronto',
  },
  'iowa-nebraska': {
    name: 'Iowa / Nebraska',
  },
  'denver': {
    name: 'Denver',
  },
  'chicago': {
    name: 'Chicago',
  },
  'detroit': {
    name: 'Detroit',
  },
  'massachusetts': {
    name: 'Massachusetts',
  },
  'las-vegas': {
    name: 'Las Vegas',
  },
  'phoenix': {
    name: 'Phoenix',
  },
  'portland': {
    name: 'Portland / Oregon',
  },
  'vancouver': {
    name: 'Vancouver / British Columbia',
  },
};

export function getLocationByName(name: string): LocationMapping | undefined {
  return Object.values(LOCATIONS).find(loc => loc.name === name);
}

export function getAllLocations(): LocationMapping[] {
  return Object.values(LOCATIONS);
}

