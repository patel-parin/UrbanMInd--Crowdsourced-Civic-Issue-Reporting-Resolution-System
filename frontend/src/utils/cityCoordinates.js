// City coordinates for Gujarat cities (and major Indian cities)
// Used for centering maps on user's city
const CITY_COORDS = {
  // Gujarat Cities
  ahmedabad: { lat: 23.0225, lng: 72.5714, zoom: 12 },
  kapadwanj: { lat: 23.2407, lng: 73.0688, zoom: 14 },
  gandhinagar: { lat: 23.2156, lng: 72.6369, zoom: 13 },
  surat: { lat: 21.1702, lng: 72.8311, zoom: 12 },
  vadodara: { lat: 22.3072, lng: 73.1812, zoom: 12 },
  rajkot: { lat: 22.3039, lng: 70.8022, zoom: 12 },
  bhavnagar: { lat: 21.7645, lng: 72.1519, zoom: 13 },
  jamnagar: { lat: 22.4707, lng: 70.0577, zoom: 13 },
  junagadh: { lat: 21.5222, lng: 70.4579, zoom: 13 },
  anand: { lat: 22.5645, lng: 72.928, zoom: 13 },
  nadiad: { lat: 22.69, lng: 72.87, zoom: 14 },
  kheda: { lat: 22.7507, lng: 72.684, zoom: 14 },
  mehsana: { lat: 23.5880, lng: 72.3693, zoom: 13 },
  patan: { lat: 23.8493, lng: 72.1266, zoom: 13 },
  bharuch: { lat: 21.7051, lng: 72.9959, zoom: 13 },
  navsari: { lat: 20.9467, lng: 72.9520, zoom: 13 },
  valsad: { lat: 20.5992, lng: 72.9342, zoom: 13 },
  morbi: { lat: 22.8173, lng: 70.8370, zoom: 13 },
  surendranagar: { lat: 22.7282, lng: 71.6524, zoom: 13 },
  dahod: { lat: 22.8350, lng: 74.2525, zoom: 13 },
  godhra: { lat: 22.7788, lng: 73.6143, zoom: 14 },
  palanpur: { lat: 24.1725, lng: 72.4380, zoom: 13 },
  porbandar: { lat: 21.6417, lng: 69.6293, zoom: 13 },
  amreli: { lat: 21.6032, lng: 71.2225, zoom: 13 },
  // Major Indian Cities
  mumbai: { lat: 19.076, lng: 72.8777, zoom: 12 },
  delhi: { lat: 28.7041, lng: 77.1025, zoom: 11 },
  bangalore: { lat: 12.9716, lng: 77.5946, zoom: 12 },
  hyderabad: { lat: 17.385, lng: 78.4867, zoom: 12 },
  chennai: { lat: 13.0827, lng: 80.2707, zoom: 12 },
  kolkata: { lat: 22.5726, lng: 88.3639, zoom: 12 },
  pune: { lat: 18.5204, lng: 73.8567, zoom: 12 },
  jaipur: { lat: 26.9124, lng: 75.7873, zoom: 12 },
  lucknow: { lat: 26.8467, lng: 80.9462, zoom: 12 },
  bhopal: { lat: 23.2599, lng: 77.4126, zoom: 12 },
};

// Default fallback (center of Gujarat)
const DEFAULT_COORDS = { lat: 22.3090, lng: 71.7948, zoom: 7 };

/**
 * Get coordinates for a city name
 * @param {string} cityName - City name (case insensitive)
 * @returns {{ lat: number, lng: number, zoom: number }}
 */
export const getCityCoords = (cityName) => {
  if (!cityName) return DEFAULT_COORDS;
  const key = cityName.toLowerCase().trim().replace(/\s+/g, '');
  return CITY_COORDS[key] || DEFAULT_COORDS;
};

/**
 * Get map bounds for a city (approximate bounding box)
 * @param {string} cityName
 * @returns {{ southWest: [number, number], northEast: [number, number] } | null}
 */
export const getCityBounds = (cityName) => {
  const coords = getCityCoords(cityName);
  if (!coords || coords === DEFAULT_COORDS) return null;
  
  // Create a ~15km bounding box around the city center
  const offset = coords.zoom >= 14 ? 0.08 : coords.zoom >= 13 ? 0.15 : 0.25;
  return {
    southWest: [coords.lat - offset, coords.lng - offset],
    northEast: [coords.lat + offset, coords.lng + offset],
  };
};

export default CITY_COORDS;
