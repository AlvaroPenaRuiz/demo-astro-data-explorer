// Astronomical object from SIMBAD database
export interface AstronomicalObject {
  name: string;
  type: string | null;
  ra_deg: number | null;
  dec_deg: number | null;
  mag_v: number | null;
}

// Center coordinates for the search
export interface SearchCenter {
  ra: number;
  dec: number;
  radius: number;
}

// Full API response from /search/ endpoint
export interface SearchResponse {
  center: SearchCenter;
  count: number;
  results: AstronomicalObject[];
}
