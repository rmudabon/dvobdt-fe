import { useLocations } from "@/hooks/useLocations";
import type { LatLngBoundsLiteral, LatLngExpression } from "leaflet"
import L from "leaflet"
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet"

const DAVAO_CITY_COORDS: LatLngExpression = [7.0667, 125.6]
const BOUNDS: LatLngBoundsLiteral = [
  [7.493196470122287, 125.89645385742189],
  [6.767579526961214, 125.07797241210939],
];

const CUSTOM_MARKER_ICON = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
})

const PinMap = () => {
    const { isLoading, error } = useLocations()

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full">
                <svg className="animate-spin h-8 w-8 text-teal-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">

                </svg>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-full rounded-md bg-neutral-200">
                <p>An error occurred during fetching the bidets. Please try again.</p>
            </div>
        )
    }

    return (
        <MapContainer center={DAVAO_CITY_COORDS} zoom={14} maxBounds={BOUNDS}>
            <TileLayer
                bounds={BOUNDS}
                attribution='© OpenStreetMap contributors, © CartoDB'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
            />
            <Marker position={DAVAO_CITY_COORDS} icon={CUSTOM_MARKER_ICON}>
                <Popup>
                    Test Davao
                </Popup>
            </Marker>
        </MapContainer>
    )
}

export { PinMap }