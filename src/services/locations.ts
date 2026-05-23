import z from "zod";
import { API_URL } from "@/utils/constants";
import { getCookie } from "./user";

export const stallOptionSchema = z.enum(["M", "F", "U"]);

export const locationSchema = z.object({
	id: z.number(),
	name: z.string().min(1, "Name is required"),
	address: z.string().min(1, "Address is required"),
	lat: z
		.number()
		.refine(
			(val) => val >= -90 && val <= 90,
			"Latitude must be between -90 and 90",
		),
	lng: z
		.number()
		.refine(
			(val) => val >= -180 && val <= 180,
			"Longitude must be between -180 and 180",
		),
	stall_type: stallOptionSchema,
	description: z.string().nullable(),
	image_url: z.string().nullable(),
	status: z.enum(["ACTIVE", "PENDING", "REJECTED"]),
	distance: z.number().nullable(),
});

export const locationFormSchema = z.object({
	name: z.string().min(1, "Name is required"),
	address: z.string().min(1, "Address is required"),
	latitude: z
		.number()
		.refine(
			(val) => val >= -90 && val <= 90,
			"Latitude must be between -90 and 90",
		),
	longitude: z
		.number()
		.refine(
			(val) => val >= -180 && val <= 180,
			"Longitude must be between -180 and 180",
		),
	stall: stallOptionSchema,
	description: z.string().optional(),
	image_url: z.string().optional(),
});

export const geolocationAutocompleteItemSchema = z.object({
	label: z.string(),
	street: z.string().nullable(),
	name: z.string(),
	longitude: z.number(),
	latitude: z.number(),
});

export const geolocationAutocompleteSchema = z.array(
	geolocationAutocompleteItemSchema,
);

export type LocationFormData = z.infer<typeof locationFormSchema>;
export type GeolocationAutocompleteItem = z.infer<
	typeof geolocationAutocompleteItemSchema
>;

export const fetchLocations = async (params?: Record<string, string>) => {
	const csrftoken = getCookie("csrftoken");
	const queryString = params
		? `?${new URLSearchParams(params).toString()}`
		: "";
	const res = await fetch(`${API_URL}/locations/${queryString}`, {
		credentials: "include",
		headers: {
			"X-CSRFToken": csrftoken ?? "",
		},
	});

	if (!res.ok) throw res;

	const data = await res.json();
	const parsedData = locationSchema.array().safeParse(data);

	if (!parsedData.success) {
		throw new Error("Failed to parse locations data");
	}

	return parsedData.data;
};

export const fetchLocationDetail = async (id: number) => {
	const csrftoken = getCookie("csrftoken");
	const res = await fetch(`${API_URL}/locations/${id}/`, {
		credentials: "include",
		headers: {
			"X-CSRFToken": csrftoken ?? "",
		},
	});

	if (!res.ok) throw res;

	const data = await res.json();
	const parsedData = locationSchema.safeParse(data);

	if (!parsedData.success) {
		throw new Error("Failed to parse location detail data");
	}

	return parsedData.data;
};

export const createLocation = async (data: LocationFormData) => {
	const csrftoken = getCookie("csrftoken");
	const payload = {
		...data,
		latitude: parseFloat(data.latitude.toFixed(6)),
		longitude: parseFloat(data.longitude.toFixed(6)),
	};
	return fetch(`${API_URL}/locations/`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"X-CSRFToken": csrftoken ?? "",
		},
		credentials: "include",
		body: JSON.stringify(payload),
	})
		.then((res) => {
			if (!res.ok) throw res;
			return res.json();
		})
		.catch((res) => {
			console.error("Failed to create location:", res);
			throw new Error(res.statusText || "Failed to create location");
		});
};

export const fetchGeolocationAutocomplete = async (query: string) => {
	if (!query.trim()) return [];

	const csrftoken = getCookie("csrftoken");
	const params = new URLSearchParams({ text: query });
	const response = await fetch(
		`${API_URL}/geolocation/autocomplete?${params.toString()}`,
		{
			credentials: "include",
			headers: {
				"X-CSRFToken": csrftoken ?? "",
			},
		},
	);

	if (!response.ok) throw response;

	const data = await response.json();
	const parsedData = geolocationAutocompleteSchema.safeParse(data);

	if (!parsedData.success) {
		throw new Error("Failed to parse geolocation autocomplete data");
	}

	return parsedData.data;
};

export const uploadLocationImage = async (file: File): Promise<string> => {
	const csrfToken = getCookie("csrftoken");
	const res = await fetch(`${API_URL}/upload/`, {
		method: "POST",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
			"X-CSRFToken": csrfToken ?? "",
		},
		body: JSON.stringify({ file_name: file.name, file_type: file.type }),
	});

	if (!res.ok) {
		const text = await res.text().catch(() => res.statusText);
		throw new Error(text || "Failed to get upload URL");
	}

	const { url } = (await res.json()) as { url: string };

	const uploadRes = await fetch(url, { method: "PUT", body: file });
	if (!uploadRes.ok) {
		const text = await uploadRes.text().catch(() => uploadRes.statusText);
		throw new Error(text || "File upload failed");
	}

	return url.split("?")[0];
};
