import type { LatLngBoundsLiteral, LatLngExpression } from "leaflet";
import L from "leaflet";

export const API_URL = `${import.meta.env.VITE_BASE_API_URL}/api`;

export const DAVAO_CITY_CENTER = [7.0667, 125.6];

export const DAVAO_CITY_COORDS: LatLngExpression = [7.0667, 125.6];
export const BOUNDS: LatLngBoundsLiteral = [
	[7.493196470122287, 125.89645385742189],
	[6.767579526961214, 125.07797241210939],
];

export const CUSTOM_MARKER_ICON = new L.Icon({
	iconUrl:
		"https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
	shadowUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41],
});

export const USER_LOCATION_ICON = new L.Icon({
	iconUrl:
		"https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
	shadowUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41],
});
