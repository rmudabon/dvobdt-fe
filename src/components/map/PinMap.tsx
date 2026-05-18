import { useLocations } from "@/hooks/useLocations";
import { BOUNDS, CUSTOM_MARKER_ICON, DAVAO_CITY_COORDS } from "@/utils/constants";
import { MapContainer, Marker, Popup } from "react-leaflet"
import { CustomTileLayer } from "./CustomTileLayer";

const PinMap = () => {
    const { data, isLoading, error } = useLocations()

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full">
                <svg className="animate-spin h-8 w-8 text-teal-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" />
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

    if(!data || data.length === 0) {
        return (
            <div className="flex justify-center items-center h-full rounded-md bg-neutral-200">
                <p>No bidets found. Be the first to add one!</p>
            </div>
        )
    }

    return (
        <MapContainer center={DAVAO_CITY_COORDS} zoom={14} maxBounds={BOUNDS}>
            <CustomTileLayer />
            {data.map(location => (
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
    )
}

export { PinMap }