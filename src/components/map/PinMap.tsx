import type { LatLngExpression } from "leaflet";
import { useEffect } from "react";
import { MapContainer, Marker, Popup, useMap } from "react-leaflet";
import type { BidetLocation } from "@/services/locations";
import {
	BOUNDS,
	CUSTOM_MARKER_ICON,
	DAVAO_CITY_COORDS,
	USER_LOCATION_ICON,
} from "@/utils/constants";
import { CustomTileLayer } from "./CustomTileLayer";

const MapCenter = ({ center }: { center: LatLngExpression }) => {
	const map = useMap();
	useEffect(() => {
		map.setView(center);
	}, [map, center]);
	return null;
};

const PinMap = ({
	data,
	center,
}: {
	data: BidetLocation[];
	center?: { lat: number; lng: number };
}) => {
	const initialCenter: LatLngExpression = center
		? [center.lat, center.lng]
		: DAVAO_CITY_COORDS;

	return (
		<MapContainer center={initialCenter} zoom={18} maxBounds={BOUNDS}>
			<CustomTileLayer />
			{center && <MapCenter center={[center.lat, center.lng]} />}
			{center && (
				<Marker position={[center.lat, center.lng]} icon={USER_LOCATION_ICON}>
					<Popup>Your location</Popup>
				</Marker>
			)}
			{data.map((location) => (
				<Marker
					key={location.name}
					position={[location.lat, location.lng]}
					icon={CUSTOM_MARKER_ICON}
				>
					<Popup>
						<h3 className="text-lg font-semibold">{location.name}</h3>
						<p>{location.address}</p>
						<p>Stall Type: {location.stall_type}</p>
						<p>{location.description}</p>
					</Popup>
				</Marker>
			))}
		</MapContainer>
	);
};

export { PinMap };
