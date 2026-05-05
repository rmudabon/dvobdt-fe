import { useForm, useStore } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { createLocation, locationFormSchema, stallOptionSchema } from "@/services/locations";
import type { LocationFormData } from "@/services/locations";
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from "react-leaflet";
import { BOUNDS, DAVAO_CITY_COORDS } from "@/utils/constants";

export const Route = createFileRoute('/(app)/submit')({
    component: LocationForm,
})

const defaultValues: LocationFormData = {
    name: "",
    address: "",
    latitude: 7.091217,
    longitude: 125.61138,
    stall: "U",
    description: "",
    imageUrl: ""
}

const useLocationForm = () => {
    const form = useForm({
        defaultValues,
        validators: {
            onSubmit: locationFormSchema,
        },
        onSubmit: async ({ formApi, value }) => {
            await submitLocation.mutateAsync(value)
            formApi.reset()
        }
    })

    const submitLocation = useMutation({
        mutationFn: createLocation,
        onSuccess(data) {
            console.log("Location created successfully", data)
            form.reset()
        },
        onError(error) {
            console.error("Error creating location", error)
        }
    })
    return form
}

function LocationMarker({ form }: { form: ReturnType<typeof useLocationForm> }) {
    const longitude = useStore(form.store, (state) => state.values.longitude)
    const latitude = useStore(form.store, (state) => state.values.latitude)
    const map = useMapEvents({
        click(event) {
            map.flyTo(event.latlng, map.getZoom())
            form.setFieldValue('latitude', event.latlng.lat)
            form.setFieldValue('longitude', event.latlng.lng)
        }
    })

    if (!latitude || !longitude) return null
    return (
        <Marker position={[latitude, longitude]}>
            <Popup>
                Selected Location: {latitude.toFixed(5)}, {longitude.toFixed(5)}
            </Popup>
        </Marker>
    )
}

function LocationForm() {
    const form = useLocationForm()
    return (
        <div className="container mx-auto h-full flex flex-col items-center justify-center">
            <h1 className="text-2xl font-bold">Add New Bidet</h1>
            <form 
                onSubmit={(e) => {
                    e.preventDefault()
                    form.handleSubmit()
                }}
                className="space-y-8 w-full max-w-lg p-8"
            >
                <form.Field
                    name="name"
                >
                    {(field) => (
                        <div className="flex flex-col">
                            <label htmlFor={field.name} className="text-xl font-semibold mb-2">Name</label>
                            <input
                                id={field.name}
                                value={field.state.value}
                                onChange={e => field.handleChange(e.target.value)}
                                className="border border-teal-700 rounded-md p-2"
                            />
                            <p className="text-red-500">{field.state.meta.errors[0]?.message}</p>
                        </div>
                    )}
                </form.Field>
                <form.Field
                    name="address"
                >
                    {(field) => (
                        <div className="flex flex-col">
                            <label htmlFor={field.name} className="text-xl font-semibold mb-2">Address</label>
                            <input
                                id={field.name}
                                value={field.state.value}
                                onChange={e => field.handleChange(e.target.value)}
                                className="border border-teal-700 rounded-md p-2"
                            />
                            <p className="text-red-500">{field.state.meta.errors[0]?.message}</p>
                        </div>
                    )}
                </form.Field>
                <MapContainer center={DAVAO_CITY_COORDS} zoom={14} maxBounds={BOUNDS}>
                    <TileLayer
                        bounds={BOUNDS}
                        attribution='© OpenStreetMap contributors, © CartoDB'
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
                    />
                    <LocationMarker form={form} />
                </MapContainer>
                <form.Field
                    name='description'
                >
                    {(field) => (
                        <div className="flex flex-col">
                            <label htmlFor={field.name} className="text-xl font-semibold mb-2">Description</label>
                            <textarea
                                id={field.name}
                                value={field.state.value}
                                onChange={e => field.handleChange(e.target.value)}
                                className="border border-teal-700 rounded-md p-2"
                                placeholder="Add other information here..."
                                rows={4}
                            />
                            <p className="text-red-500">{field.state.meta.errors[0]?.message}</p>
                        </div>
                    )}
                </form.Field>
                <form.Field
                    name='stall'
                >
                    {(field) => (
                        <div className="flex flex-col">
                            <label htmlFor={field.name} className="text-xl font-semibold mb-2">Stall Type</label>
                            <select
                                id={field.name}
                                value={field.state.value}
                                onChange={e => {
                                    const value = e.target.value;
                                    const parsedValue = stallOptionSchema.parse(value);
                                    field.handleChange(parsedValue)
                                }}
                                className="border border-teal-700 rounded-md p-2"
                            >
                                <option value="M">Male</option>
                                <option value="F">Female</option> 
                                <option value="U">Unisex</option>
                            </select>
                            <p className="text-red-500">{field.state.meta.errors.join(', ')}</p>
                        </div>
                    )}
                </form.Field>
                <form.Subscribe
                    selector={(state) => [state.canSubmit, state.isSubmitting, state.isPristine]}
                    children={([canSubmit, isSubmitting, isPristine]) => (
                        <button
                            type="submit"
                            role="button"
                            className="cursor-pointer bg-teal-700 text-white px-4 py-2 rounded-md hover:bg-teal-800 transition-colors"
                            disabled={!canSubmit || isSubmitting || isPristine}
                        >
                            Submit
                        </button>
                    )}
                />
            </form>
        </div>
    )
}