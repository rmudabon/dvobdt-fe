import { useForm, useStore } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { createLocation, locationFormSchema, stallOptionSchema } from "@/services/locations";
import type { LocationFormData } from "@/services/locations";
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from "react-leaflet";
import { BOUNDS, DAVAO_CITY_COORDS } from "@/utils/constants";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Field, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LocateFixed } from "lucide-react";

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

    const getCurrentLocation = () => {
        if(!navigator.geolocation) {
            alert("Geolocation is not supported by your browser")
        }
        navigator.geolocation.getCurrentPosition((position) => {
            form.setFieldValue('latitude', position.coords.latitude)
            form.setFieldValue('longitude', position.coords.longitude)
        })
    }

    return (
        <div className="container mx-auto flex justify-center p-8">
            <form 
                onSubmit={(e) => {
                    e.preventDefault()
                    form.handleSubmit()
                }}
                className="space-y-4 w-full max-w-xl"
            >
                <FieldLegend className="font-bold">New Bidet</FieldLegend>
                <form.Field
                    name="name"
                >
                    {(field) => (
                        <Field className="flex flex-col">
                            <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                            <Input
                                id={field.name}
                                value={field.state.value}
                                onChange={e => field.handleChange(e.target.value)}
                                className="border border-teal-700 rounded-md p-2"
                            />
                            <p className="text-red-500">{field.state.meta.errors[0]?.message}</p>
                        </Field>
                    )}
                </form.Field>
                <form.Field
                    name="address"
                >
                    {(field) => (
                        <Field className="flex flex-col">
                            <FieldLabel htmlFor={field.name}>Address</FieldLabel>
                            <Input
                                id={field.name}
                                value={field.state.value}
                                onChange={e => field.handleChange(e.target.value)}
                                className="border border-teal-700 rounded-md p-2"
                            />
                            <p className="text-red-500">{field.state.meta.errors[0]?.message}</p>
                            <Button type='button' variant='outline' className="cursor-pointer" onClick={getCurrentLocation}>
                                <LocateFixed />
                                Use Current Location
                            </Button>
                        </Field>
                    )}
                </form.Field>
                <div className="h-80">
                <MapContainer center={DAVAO_CITY_COORDS} zoom={14} maxBounds={BOUNDS}>
                    <TileLayer
                        bounds={BOUNDS}
                        attribution='© OpenStreetMap contributors, © Stadia Maps'
                        url="https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png"
                    />
                    <LocationMarker form={form} />
                </MapContainer>
                </div>
                <form.Field
                    name='description'
                >
                    {(field) => (
                        <Field className="flex flex-col">
                            <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                            <Textarea
                                id={field.name}
                                value={field.state.value}
                                onChange={e => field.handleChange(e.target.value)}
                                className="border border-teal-700 rounded-md p-2"
                                placeholder="Add other information here..."
                                rows={4}
                            />
                            <p className="text-red-500">{field.state.meta.errors[0]?.message}</p>
                        </Field>
                    )}
                </form.Field>
                <form.Field
                    name='stall'
                >
                    {(field) => (
                        <FieldSet className="">
                            <FieldLegend variant="label">Stall Type</FieldLegend>
                            <RadioGroup 
                                onValueChange={(value) => {
                                    const parsed = stallOptionSchema.safeParse(value)
                                    if (parsed.success) {
                                        field.handleChange(parsed.data)
                                    }
                                }}
                                defaultValue={field.state.value}
                            >
                                <Field orientation="horizontal">
                                    <RadioGroupItem value="M" id="stall-m" />
                                    <FieldLabel htmlFor="stall-m">Male</FieldLabel>
                                </Field>
                                <Field orientation="horizontal">
                                    <RadioGroupItem value="F" id="stall-f" />
                                    <FieldLabel htmlFor="stall-f">Female</FieldLabel>
                                </Field>
                                <Field orientation="horizontal">
                                    <RadioGroupItem value="U" id="stall-u" />
                                    <FieldLabel htmlFor="stall-u">Unisex</FieldLabel>
                                </Field>
                            </RadioGroup>
                        </FieldSet>
                    )}
                </form.Field>
                <form.Subscribe
                    selector={(state) => [state.canSubmit, state.isSubmitting, state.isPristine]}
                    children={([canSubmit, isSubmitting, isPristine]) => (
                        <Button
                            type="submit"
                            role="button"
                            size='lg'
                            className="w-full"
                            disabled={!canSubmit || isSubmitting || isPristine}
                        >
                            Submit
                        </Button>
                    )}
                />
            </form>
        </div>
    )
}