export interface GeocodeResult {
  name: string;
  address: string;
  lat: number;
  lng: number;
}

const NAVOJOA_REFERENCE_POINTS = [
  { name: 'Centro Histórico', address: 'Av. Morelos y Calle García Morales, Col. Centro, Navojoa, Son.', lat: 26.8045, lng: -109.4442 },
  { name: 'Calle No Reelección', address: 'Calle No Reelección, Col. Constitución, Navojoa, Son.', lat: 26.8092, lng: -109.4530 },
  { name: 'Blvd. Centenario', address: 'Blvd. Centenario esq. Pesqueira, Col. Juárez, Navojoa, Son.', lat: 26.7865, lng: -109.4310 },
  { name: 'Av. Lázaro Cárdenas', address: 'Av. Lázaro Cárdenas del Río, Col. Francisco Villa, Navojoa, Son.', lat: 26.7785, lng: -109.4215 },
  { name: 'Mercado Municipal', address: 'Calle Allende e Hidalgo, Col. Centro, Navojoa, Son.', lat: 26.8028, lng: -109.4465 },
  { name: 'Blvd. Cuauhtémoc', address: 'Blvd. Cuauhtémoc, Col. Deportiva, Navojoa, Son.', lat: 26.7955, lng: -109.4515 },
  { name: 'IMSS Hospital General 16', address: 'Calle Talamante y Toledo, Col. Constitución, Navojoa, Son.', lat: 26.8115, lng: -109.4580 },
  { name: 'Estadio Ciclón Echeverría', address: 'Blvd. Alfonso Reyes, Col. Juárez, Navojoa, Son.', lat: 26.7915, lng: -109.4585 },
  { name: 'Plaza Navarrete', address: 'Blvd. Sonora y Pesqueira, Col. Tierra Blanca, Navojoa, Son.', lat: 26.8150, lng: -109.4410 },
  { name: 'Carretera México 15', address: 'Carr. Internacional México 15, Salida Norte, Navojoa, Son.', lat: 26.8220, lng: -109.4320 },
  { name: 'Río Mayo / Pueblo Viejo', address: 'Pueblo Viejo, Ribera del Río Mayo, Navojoa, Son.', lat: 26.8180, lng: -109.4650 },
  { name: 'Zona Industrial Navojoa', address: 'Parque Industrial Navojoa, Carr. a Álamos, Navojoa, Son.', lat: 26.7900, lng: -109.4150 },
];

/**
 * Calculates distance between two points in km with urban routing factor
 */
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightKm = R * c;
  // Apply a 1.25 urban street grid factor
  const streetKm = +(Math.max(0.6, straightKm * 1.25)).toFixed(1);
  return streetKm;
}

/**
 * Reverse geocodes coordinates to a readable Navojoa street and colonia address
 */
export async function reverseGeocodeNavojoa(lat: number, lng: number): Promise<GeocodeResult> {
  // 1. Try real OpenStreetMap Nominatim reverse geocode with a fast 1800ms abort timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1800);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        signal: controller.signal,
        headers: {
          'Accept-Language': 'es-MX,es;q=0.9',
        },
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const road = addr.road || addr.pedestrian || addr.cycleway || addr.path;
      const suburb = addr.suburb || addr.neighbourhood || addr.quarter || addr.city_district;
      const city = addr.city || addr.town || addr.municipality || 'Navojoa';
      const houseNumber = addr.house_number ? ` #${addr.house_number}` : '';

      if (road) {
        const fullRoad = `${road}${houseNumber}`;
        const fullAddress = `${fullRoad}, ${suburb ? `Col. ${suburb}, ` : ''}${city}, Son.`;
        return {
          name: fullRoad,
          address: fullAddress,
          lat,
          lng,
        };
      } else if (suburb) {
        return {
          name: `Col. ${suburb}`,
          address: `Col. ${suburb}, ${city}, Son. (${lat.toFixed(4)}°N, ${Math.abs(lng).toFixed(4)}°W)`,
          lat,
          lng,
        };
      }
    }
  } catch {
    // Graceful fallback to nearest local Navojoa landmark
  }

  // 2. Intelligent local nearest landmark fallback
  let closest = NAVOJOA_REFERENCE_POINTS[0];
  let minDistance = Infinity;

  for (const ref of NAVOJOA_REFERENCE_POINTS) {
    const d = Math.hypot(lat - ref.lat, lng - ref.lng);
    if (d < minDistance) {
      minDistance = d;
      closest = ref;
    }
  }

  // Format a realistic street address in Navojoa
  const coordsLabel = `${lat.toFixed(4)}°N, ${Math.abs(lng).toFixed(4)}°W`;
  return {
    name: `Punto en ${closest.name}`,
    address: `Cerca de ${closest.name}, Navojoa, Son. (${coordsLabel})`,
    lat,
    lng,
  };
}
