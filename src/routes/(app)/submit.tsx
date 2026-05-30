import { useForm, useStore } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LocateFixed, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { MapContainer, Marker, Popup, useMapEvents } from "react-leaflet";
import { toast } from "sonner";
import { CustomTileLayer } from "@/components/map/CustomTileLayer";
import { Button } from "@/components/ui/button";
import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
} from "@/components/ui/combobox";
import {
	Field,
	FieldLabel,
	FieldLegend,
	FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { QueryResolver } from "@/components/ui/query-resolver";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/hooks/useAuth";
import { debounce } from "@/lib/utils";
import type {
	GeolocationAutocompleteItem,
	LocationFormData,
} from "@/services/locations";
import {
	createLocation,
	fetchGeolocationAutocomplete,
	locationFormSchema,
	stallOptionSchema,
	uploadLocationImage,
} from "@/services/locations";
import {
	BOUNDS,
	CUSTOM_MARKER_ICON,
	DAVAO_CITY_CENTER,
	DAVAO_CITY_COORDS,
} from "@/utils/constants";

export const Route = createFileRoute("/(app)/submit")({
	component: LocationForm,
});

const defaultValues: LocationFormData = {
	name: "",
	address: "",
	latitude: DAVAO_CITY_CENTER[0],
	longitude: DAVAO_CITY_CENTER[1],
	stall: "U",
	description: "",
	image_url: "",
};

const useLocationForm = () => {
	const navigate = useNavigate();
	const form = useForm({
		defaultValues,
		validators: {
			onSubmit: locationFormSchema,
		},
		onSubmit: async ({ formApi, value }) => {
			await submitLocation.mutateAsync(value);
			formApi.reset();
		},
	});

	const submitLocation = useMutation({
		mutationFn: createLocation,
		onSuccess(data) {
			toast.success("Bidet application submitted successfully!");
			navigate({
				to: "/bidets/$bidetId",
				params: { bidetId: data.id.toString() },
			});
		},
	});
	return form;
};

function LocationMarker({
	form,
}: {
	form: ReturnType<typeof useLocationForm>;
}) {
	const longitude = useStore(form.store, (state) => state.values.longitude);
	const latitude = useStore(form.store, (state) => state.values.latitude);
	const map = useMapEvents({
		click(event) {
			map.flyTo(event.latlng, map.getZoom());
			form.setFieldValue("latitude", event.latlng.lat);
			form.setFieldValue("longitude", event.latlng.lng);
		},
	});

	useEffect(() => {
		if (!latitude || !longitude) return;
		map.flyTo([latitude, longitude], map.getZoom());
	}, [latitude, longitude, map]);

	if (!latitude || !longitude) return null;
	return (
		<Marker position={[latitude, longitude]} icon={CUSTOM_MARKER_ICON}>
			<Popup>
				Selected Location: {latitude.toFixed(5)}, {longitude.toFixed(5)}
			</Popup>
		</Marker>
	);
}

type UploadStatus = "idle" | "loading" | "success" | "error";

function ImageUploadField({
	form,
}: {
	form: ReturnType<typeof useLocationForm>;
}) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [preview, setPreview] = useState<string | null>(null);
	const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	async function handleFile(file: File) {
		if (!file.type.startsWith("image/")) return;

		setPreview(URL.createObjectURL(file));
		setUploadStatus("loading");
		setErrorMessage(null);

		try {
			const image_url = await uploadLocationImage(file);
			form.setFieldValue("image_url", image_url);
			setUploadStatus("success");
		} catch (err: unknown) {
			setUploadStatus("error");
			setErrorMessage(err instanceof Error ? err.message : "Upload failed");
			setPreview(null);
		}
	}

	function handleClear() {
		setPreview(null);
		setUploadStatus("idle");
		setErrorMessage(null);
		form.setFieldValue("image_url", "");
		if (inputRef.current) inputRef.current.value = "";
	}

	return (
		<Field className="flex flex-col gap-2">
			<FieldLabel>Image</FieldLabel>
			<p className="text-sm text-muted-foreground">
				Adding a photo helps your submission get approved faster.
			</p>
			<div
				onDrop={(e) => {
					e.preventDefault();
					const file = e.dataTransfer.files?.[0];
					if (file) handleFile(file);
				}}
				onDragOver={(e) => e.preventDefault()}
				onClick={() => uploadStatus !== "loading" && inputRef.current?.click()}
				className={`relative border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-colors border-gray-300 ${
					uploadStatus === "loading"
						? "opacity-50 cursor-not-allowed"
						: "cursor-pointer hover:border-teal-700"
				}`}
			>
				{preview ? (
					<img
						src={preview}
						alt="Preview"
						className="max-h-48 max-w-full object-contain rounded"
					/>
				) : (
					<p className="text-muted-foreground text-sm text-center">
						Drag &amp; drop an image here, or click to select
					</p>
				)}
				<input
					ref={inputRef}
					type="file"
					accept="image/*"
					className="hidden"
					onChange={(e) => {
						const file = e.target.files?.[0];
						if (file) handleFile(file);
					}}
				/>
			</div>
			{uploadStatus === "loading" && (
				<p className="text-sm text-muted-foreground">Uploading...</p>
			)}
			{uploadStatus === "error" && (
				<p className="text-sm text-red-500">{errorMessage}</p>
			)}
			{uploadStatus === "success" && (
				<Button
					type="button"
					variant="outline"
					size="sm"
					className="w-fit"
					onClick={handleClear}
				>
					<X size={14} /> Remove image
				</Button>
			)}
		</Field>
	);
}

function LocationForm() {
	const userQuery = useUser();
	const form = useLocationForm();
	const hasRequestedLocation = useRef(false);
	const [addressSuggestions, setAddressSuggestions] = useState<
		GeolocationAutocompleteItem[]
	>([]);
	const [isAddressLoading, setIsAddressLoading] = useState(false);
	const debouncedFetchSuggestionsRef = useRef(
		debounce(async (text: string) => {
			try {
				setIsAddressLoading(true);
				const suggestions = await fetchGeolocationAutocomplete(text);
				setAddressSuggestions(suggestions);
			} catch (error) {
				console.error(error);
				setAddressSuggestions([]);
			} finally {
				setIsAddressLoading(false);
			}
		}, 350),
	);

	const getCurrentLocation = useCallback(() => {
		if (!navigator.geolocation) {
			toast.error("Geolocation is not supported by your browser");
			return;
		}
		navigator.geolocation.getCurrentPosition((position) => {
			form.setFieldValue("latitude", position.coords.latitude);
			form.setFieldValue("longitude", position.coords.longitude);
		});
	}, [form]);

	const handleAddressInputChange = (value: string) => {
		form.setFieldValue("address", value);

		const text = value.trim();
		if (text.length < 3) {
			debouncedFetchSuggestionsRef.current.cancel();
			setAddressSuggestions([]);
			setIsAddressLoading(false);
			return;
		}

		debouncedFetchSuggestionsRef.current(text);
	};

	useEffect(() => {
		if (hasRequestedLocation.current) return;
		hasRequestedLocation.current = true;
		getCurrentLocation();

		return () => {
			debouncedFetchSuggestionsRef.current.cancel();
		};
	}, [getCurrentLocation]);

	return (
		<QueryResolver query={userQuery}>
			{(user) =>
				!user ? (
					<div className="flex flex-col items-center justify-center flex-1 gap-4 p-8 text-center">
						<h1 className="text-2xl font-semibold">Sign in required</h1>
						<p className="text-muted-foreground max-w-md">
							You need to be signed in to submit a new bidet location.
						</p>
						<Button asChild>
							<Link to="/login">Sign in</Link>
						</Button>
					</div>
				) : (
					<div className="container mx-auto flex justify-center p-8">
						<form
							onSubmit={(e) => {
								e.preventDefault();
								form.handleSubmit();
							}}
							className="space-y-4 w-full max-w-xl"
						>
							<FieldLegend className="font-bold text-2xl!">
								New Bidet
							</FieldLegend>
							<form.Field name="name">
								{(field) => (
									<Field className="flex flex-col">
										<FieldLabel htmlFor={field.name}>
											Name{" "}
											<span className="text-red-500" aria-hidden="true">
												*
											</span>
										</FieldLabel>
										<Input
											id={field.name}
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											className="border border-teal-700 rounded-md p-2"
										/>
										<p className="text-red-500">
											{field.state.meta.errors[0]?.message}
										</p>
									</Field>
								)}
							</form.Field>
							<form.Field name="address">
								{(field) => (
									<Field className="flex flex-col">
										<FieldLabel htmlFor={field.name}>
											Address{" "}
											<span className="text-red-500" aria-hidden="true">
												*
											</span>
										</FieldLabel>
										<Combobox
											value={field.state.value}
											inputValue={field.state.value}
											onInputValueChange={handleAddressInputChange}
											onValueChange={(value) => {
												field.handleChange(value ?? "");
												if (!value) return;
												const selectedSuggestion = addressSuggestions.find(
													(suggestion) => suggestion.label === value,
												);
												if (!selectedSuggestion) return;

												form.setFieldValue(
													"latitude",
													selectedSuggestion.latitude,
												);
												form.setFieldValue(
													"longitude",
													selectedSuggestion.longitude,
												);
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
													{isAddressLoading
														? "Loading suggestions..."
														: "No suggestions found. Start typing to search for an address."}
												</ComboboxEmpty>
												<ComboboxList>
													{(suggestion) => {
														console.log(suggestion);
														return (
															<ComboboxItem
																key={`${suggestion.latitude}-${suggestion.longitude}-${suggestion.label}`}
																value={suggestion.label}
															>
																<div className="flex flex-col">
																	<span>{suggestion.label}</span>
																	<span className="text-xs text-muted-foreground">
																		{suggestion.street}
																	</span>
																</div>
															</ComboboxItem>
														);
													}}
												</ComboboxList>
											</ComboboxContent>
										</Combobox>
										<p className="text-red-500">
											{field.state.meta.errors[0]?.message}
										</p>
										<Button
											type="button"
											variant="outline"
											className="cursor-pointer"
											onClick={getCurrentLocation}
										>
											<LocateFixed />
											Use Current Location
										</Button>
									</Field>
								)}
							</form.Field>
							<div className="h-80 relative z-0">
								<MapContainer
									center={DAVAO_CITY_COORDS}
									zoom={17}
									maxBounds={BOUNDS}
								>
									<CustomTileLayer />
									<LocationMarker form={form} />
								</MapContainer>
							</div>
							<form.Field name="description">
								{(field) => (
									<Field className="flex flex-col">
										<FieldLabel htmlFor={field.name}>Description</FieldLabel>
										<Textarea
											id={field.name}
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											className="border border-teal-700 rounded-md p-2"
											placeholder="e.g., 2nd floor near the elevator, beside the food court entrance, accessible from the main hallway..."
											rows={4}
										/>
										<p className="text-sm text-muted-foreground">
											Include details like the floor, nearby landmarks, or any
											directions that help others find it.
										</p>
										<p className="text-red-500">
											{field.state.meta.errors[0]?.message}
										</p>
									</Field>
								)}
							</form.Field>
							<ImageUploadField form={form} />
							<form.Field name="stall">
								{(field) => (
									<FieldSet className="">
										<FieldLegend variant="label">
											Stall Type{" "}
											<span className="text-red-500" aria-hidden="true">
												*
											</span>
										</FieldLegend>
										<RadioGroup
											onValueChange={(value) => {
												const parsed = stallOptionSchema.safeParse(value);
												if (parsed.success) {
													field.handleChange(parsed.data);
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
								selector={(state) => [
									state.canSubmit,
									state.isSubmitting,
									state.isPristine,
								]}
								children={([canSubmit, isSubmitting, isPristine]) => (
									<Button
										type="submit"
										role="button"
										size="lg"
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
		</QueryResolver>
	);
}
