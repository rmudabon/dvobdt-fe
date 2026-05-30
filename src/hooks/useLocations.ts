import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchLocationDetail, fetchLocations } from "@/services/locations";

export const useUserCoords = () => {
	const [coords, setCoords] = useState<{ lat: number; lng: number } | undefined>();
	const [ready, setReady] = useState(false);

	useEffect(() => {
		navigator.geolocation.getCurrentPosition(
			(pos) => {
				setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
				setReady(true);
			},
			() => setReady(true),
			{ timeout: 5000 },
		);
	}, []);

	return { coords, ready };
};

export const useLocations = (
	coords?: { lat: number; lng: number },
	enabled = true,
) => {
	const params: Record<string, string> = {};
	if (coords) {
		params.lat = coords.lat.toString();
		params.lng = coords.lng.toString();
	}

	const query = useQuery({
		queryKey: ["locations", coords ?? null],
		queryFn: () =>
			fetchLocations(Object.keys(params).length ? params : undefined),
		enabled,
	});

	return query;
};

export const useMyLocations = () => {
	const query = useQuery({
		queryKey: ["locations", "mine"],
		queryFn: () => fetchLocations({ mine: "true" }),
	});

	return query;
};

export const useLocation = (id: number) => {
	const query = useQuery({
		queryKey: ["locations", id],
		queryFn: () => fetchLocationDetail(id),
	});

	return query;
};
