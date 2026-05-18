import { fetchLocations } from "@/services/locations"
import { useQuery } from "@tanstack/react-query"

export const useLocations = () => {
    const query = useQuery({
        queryKey: ['locations'],
        queryFn: fetchLocations,
    })

    return query
}