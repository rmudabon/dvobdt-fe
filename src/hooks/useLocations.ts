import { useQuery } from "@tanstack/react-query";
import { fetchLocationDetail, fetchLocations } from "@/services/locations";

export const useLocations = () => {
	const query = useQuery({
		queryKey: ["locations"],
		queryFn: () => fetchLocations(),
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
