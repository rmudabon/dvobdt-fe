import { TileLayer } from "react-leaflet";
import { BOUNDS } from "@/utils/constants";

const CustomTileLayer = () => (
	<TileLayer
		bounds={BOUNDS}
		attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>'
		url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
	/>
);

export { CustomTileLayer };
