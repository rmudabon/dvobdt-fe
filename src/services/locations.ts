import { API_URL } from "@/utils/constants"
import z from "zod"

export const stallOptionSchema = z.enum(["M", "F", "U"])

export const locationSchema = z.object({
    name: z.string().min(1, "Name is required"),
    address: z.string().min(1, "Address is required"),
    latitude: z.number().refine((val) => val >= -90 && val <= 90, "Latitude must be between -90 and 90"),
    longitude: z.number().refine((val) => val >= -180 && val <= 180, "Longitude must be between -180 and 180"),
    stall: stallOptionSchema,
    description: z.string().optional(),
    imageUrl: z.string().optional()
})

export type LocationFormData = z.infer<typeof locationSchema>

export const fetchLocations = () => 
    fetch(`${API_URL}/locations/`)
        .then(res => {
            if (!res.ok) throw res
            return res.json()
        })
        .catch(res => console.error(res))

export const createLocation = (data: LocationFormData) =>
    fetch(`${API_URL}/locations/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(res => {
        if (!res.ok) throw res
        return res.json()
    })
    .catch(res => console.error(res))