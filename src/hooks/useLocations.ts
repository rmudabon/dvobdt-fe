import { API_URL } from "@/utils/constants"
import { useQuery } from "@tanstack/react-query"

const fetchLocations = () => 
    fetch(`${API_URL}/locations/`)
        .then(res => {
            if (!res.ok) throw res
            return res.json()
        })
        .catch(res => console.error(res))


export const useLocations = () => {
    const { data, error, isLoading } = useQuery({
        queryKey: ['locations'],
        queryFn: fetchLocations,
    })

    return { data, error, isLoading }
}