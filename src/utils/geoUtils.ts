import { SWISS_TOP_30_CITIES } from '../data/swissTop30Cities';

/**
 * Calculates the Haversine distance in kilometers between two geographic coordinates.
 */
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export interface CityCoords {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

/**
 * Resolves a location string (e.g. "Zürich", "Bern", "St. Gallen") to its city coordinate center.
 */
export function getCityCoordsForLocation(locationName: string): CityCoords | null {
  if (!locationName) return null;
  const clean = locationName
    .replace(/\s+und\s+Umgebung/i, '')
    .replace(/[\(\)]/g, '')
    .toLowerCase()
    .trim();

  const found = SWISS_TOP_30_CITIES.find(
    c =>
      c.name.toLowerCase() === clean ||
      c.cityName.toLowerCase() === clean ||
      c.id.toLowerCase() === clean ||
      c.name.toLowerCase().includes(clean) ||
      clean.includes(c.cityName.toLowerCase())
  );

  if (found) {
    return {
      id: found.id,
      name: found.name,
      lat: found.lat,
      lng: found.lng
    };
  }

  return null;
}
