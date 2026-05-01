import { fetchLocations } from "@/services/locations"
import { useQuery } from "@tanstack/react-query"

export const useLocations = () => {
    const { data, error, isLoading } = useQuery({
        queryKey: ['locations'],
        queryFn: fetchLocations,
    })

    return { data, error, isLoading }
}