import type { LatLngBoundsLiteral, LatLngExpression } from "leaflet";

export const API_URL = `http://${import.meta.env.VITE_BASE_API_URL}/api`

export const DAVAO_CITY_COORDS: LatLngExpression = [7.0667, 125.6]
export const BOUNDS: LatLngBoundsLiteral = [
  [7.493196470122287, 125.89645385742189],
  [6.767579526961214, 125.07797241210939],
];