import { API_URL } from "@/utils/constants"
import z from "zod"
import { getCookie } from "./user"

export const stallOptionSchema = z.enum(["M", "F", "U"])

export const locationSchema = z.object({
    name: z.string().min(1, "Name is required"),
    address: z.string().min(1, "Address is required"),
    lat: z.number().refine((val) => val >= -90 && val <= 90, "Latitude must be between -90 and 90"),
    lng: z.number().refine((val) => val >= -180 && val <= 180, "Longitude must be between -180 and 180"),
    stall_type: stallOptionSchema,
    description: z.string().nullable(),
    image_url: z.string().nullable()
})

export const locationFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    address: z.string().min(1, "Address is required"),
    latitude: z.number().refine((val) => val >= -90 && val <= 90, "Latitude must be between -90 and 90"),
    longitude: z.number().refine((val) => val >= -180 && val <= 180, "Longitude must be between -180 and 180"),
    stall: stallOptionSchema,
    description: z.string().optional(),
    imageUrl: z.string().optional()
})

export type LocationFormData = z.infer<typeof locationFormSchema>

export const fetchLocations = async () => {
    const csrftoken = getCookie('csrftoken');
    return fetch(`${API_URL}/locations/`, {
        credentials: 'include',
        headers: {
            "X-CSRFToken": csrftoken ?? '',
        },
    })
        .then(async res => {
            if (!res.ok) throw res
            const data = await res.json()
            console.log(data)
            const parsedData = locationSchema.array().safeParse(data)
            if (!parsedData.success) {
                console.error("Failed to parse locations data", parsedData.error)
                throw new Error("Failed to parse locations data")
            }
            return parsedData.data
        })
        .catch(res => console.error(res))
    }

export const createLocation = async (data: LocationFormData) => {
    const csrftoken = getCookie('csrftoken');
    return fetch(`${API_URL}/locations/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrftoken ?? '',
        },
        credentials: 'include',
        body: JSON.stringify(data),
    })
    .then(res => {
        if (!res.ok) throw res
        return res.json()
    })
    .catch(res => console.error(res))
}