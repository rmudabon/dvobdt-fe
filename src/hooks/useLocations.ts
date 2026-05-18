import { fetchLocationDetail, fetchLocations } from "@/services/locations"
import { useQuery } from "@tanstack/react-query"

export const useLocations = () => {
    const query = useQuery({
        queryKey: ['locations'],
        queryFn: fetchLocations,
    })

    return query
}

export const useLocation = (id: number) => {
    const query = useQuery({
        queryKey: ['locations', id],
        queryFn: () => fetchLocationDetail(id),
    })

    return query
}