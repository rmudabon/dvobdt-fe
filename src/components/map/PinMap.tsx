import type { LatLngBoundsLiteral, LatLngExpression } from "leaflet"
import { MapContainer, TileLayer } from "react-leaflet"

const DAVAO_CITY_COORDS: LatLngExpression = [7.0667, 125.6]
const BOUNDS: LatLngBoundsLiteral = [
  [7.493196470122287, 125.89645385742189],
  [6.767579526961214, 125.07797241210939],
];

const PinMap = () => {
    return (
        <MapContainer center={DAVAO_CITY_COORDS} zoom={14} maxBounds={BOUNDS}>
            <TileLayer
                bounds={BOUNDS}
                attribution='© OpenStreetMap contributors, © CartoDB'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
            />
        </MapContainer>
    )
}

export { PinMap }