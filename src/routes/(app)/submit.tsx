import { useEffect, useRef, useState } from "react";
import { useForm, useStore } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { createLocation, fetchGeolocationAutocomplete, locationFormSchema, stallOptionSchema } from "@/services/locations";
import { toast } from "sonner";
import type { GeolocationAutocompleteItem, LocationFormData } from "@/services/locations";
import { MapContainer, Marker, Popup, useMapEvents } from "react-leaflet";
import { BOUNDS, CUSTOM_MARKER_ICON, DAVAO_CITY_CENTER, DAVAO_CITY_COORDS } from "@/utils/constants";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Field, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LocateFixed } from "lucide-react";
import { debounce } from "@/lib/utils";
import { CustomTileLayer } from "@/components/map/CustomTileLayer";

export const Route = createFileRoute('/(app)/submit')({
    component: LocationForm,
})

const defaultValues: LocationFormData = {
    name: "",
    address: "",
    latitude: DAVAO_CITY_CENTER[0],
    longitude: DAVAO_CITY_CENTER[1],
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
        onSuccess() {
            toast.success("Bidet application submitted successfully!")
            form.reset()
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

    useEffect(() => {
        if (!latitude || !longitude) return
        map.flyTo([latitude, longitude], map.getZoom())
    }, [latitude, longitude, map])

    if (!latitude || !longitude) return null
    return (
        <Marker position={[latitude, longitude]} icon={CUSTOM_MARKER_ICON}>
            <Popup>
                Selected Location: {latitude.toFixed(5)}, {longitude.toFixed(5)}
            </Popup>
        </Marker>
    )
}

function LocationForm() {
    const form = useLocationForm()
    const hasRequestedLocation = useRef(false)
    const [addressSuggestions, setAddressSuggestions] = useState<GeolocationAutocompleteItem[]>([])
    const [isAddressLoading, setIsAddressLoading] = useState(false)
    const debouncedFetchSuggestionsRef = useRef(
        debounce(async (text: string) => {
            try {
                setIsAddressLoading(true)
                const suggestions = await fetchGeolocationAutocomplete(text)
                setAddressSuggestions(suggestions)
            } catch (error) {
                console.error(error)
                setAddressSuggestions([])
            } finally {
                setIsAddressLoading(false)
            }
        }, 350)
    )

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser")
            return
        }
        navigator.geolocation.getCurrentPosition((position) => {
            form.setFieldValue('latitude', position.coords.latitude)
            form.setFieldValue('longitude', position.coords.longitude)
        })
    }

    const handleAddressInputChange = (value: string) => {
        form.setFieldValue("address", value)

        const text = value.trim()
        if (text.length < 3) {
            debouncedFetchSuggestionsRef.current.cancel()
            setAddressSuggestions([])
            setIsAddressLoading(false)
            return
        }

        debouncedFetchSuggestionsRef.current(text)
    }

    useEffect(() => {
        if (hasRequestedLocation.current) return
        hasRequestedLocation.current = true
        getCurrentLocation()

        return () => {
            debouncedFetchSuggestionsRef.current.cancel()
        }
    }, [])

    return (
        <div className="container mx-auto flex justify-center p-8">
            <form 
                onSubmit={(e) => {
                    e.preventDefault()
                    form.handleSubmit()
                }}
                className="space-y-4 w-full max-w-xl"
            >
                <FieldLegend className="font-bold text-2xl!">New Bidet</FieldLegend>
                <form.Field
                    name="name"
                >
                    {(field) => (
                        <Field className="flex flex-col">
                            <FieldLabel htmlFor={field.name}>
                                Name <span className="text-red-500" aria-hidden="true">*</span>
                            </FieldLabel>
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
                            <FieldLabel htmlFor={field.name}>
                                Address <span className="text-red-500" aria-hidden="true">*</span>
                            </FieldLabel>
                            <Combobox
                                value={field.state.value}
                                inputValue={field.state.value}
                                onInputValueChange={handleAddressInputChange}
                                onValueChange={(value) => {
                                    field.handleChange(value ?? "")
                                    if (!value) return
                                    const selectedSuggestion = addressSuggestions.find(
                                        (suggestion) => suggestion.label === value
                                    )
                                    if (!selectedSuggestion) return

                                    form.setFieldValue("latitude", selectedSuggestion.latitude)
                                    form.setFieldValue("longitude", selectedSuggestion.longitude)
                                }}
                                items={addressSuggestions}
                            >
                                <ComboboxInput
                                    id={field.name}
                                    className="w-full"
                                    placeholder="Start typing an address..."
                                    showClear
                                />
                                <ComboboxContent>
                                    <ComboboxEmpty>
                                        {isAddressLoading ? "Loading suggestions..." : "No suggestions found. Start typing to search for an address."}
                                    </ComboboxEmpty>
                                    <ComboboxList>
                                        {(suggestion) => {
                                            console.log(suggestion)
                                            return (
                                                <ComboboxItem key={`${suggestion.latitude}-${suggestion.longitude}-${suggestion.label}`} value={suggestion.label}>
                                                    <div className="flex flex-col">
                                                        <span>{suggestion.label}</span>
                                                        <span className="text-xs text-muted-foreground">{suggestion.street}</span>
                                                    </div>
                                                </ComboboxItem>
                                            )
                                        }}
                                    </ComboboxList>
                                </ComboboxContent>
                            </Combobox>
                            <p className="text-red-500">{field.state.meta.errors[0]?.message}</p>
                            <Button type='button' variant='outline' className="cursor-pointer" onClick={getCurrentLocation}>
                                <LocateFixed />
                                Use Current Location
                            </Button>
                        </Field>
                    )}
                </form.Field>
                <div className="h-80 relative z-0">
                <MapContainer center={DAVAO_CITY_COORDS} zoom={17} maxBounds={BOUNDS}>
                    <CustomTileLayer />
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
                            <FieldLegend variant="label">
                                Stall Type <span className="text-red-500" aria-hidden="true">*</span>
                            </FieldLegend>
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