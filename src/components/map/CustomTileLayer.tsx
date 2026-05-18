import { BOUNDS } from "@/utils/constants";
import { TileLayer } from "react-leaflet";

const CustomTileLayer = () => (
    <TileLayer
        bounds={BOUNDS}
        attribution='© OpenStreetMap contributors, © Stadia Maps'
        url="https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png"
    />
)

export { CustomTileLayer }