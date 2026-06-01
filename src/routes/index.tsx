import { createFileRoute, Link } from "@tanstack/react-router";
import { LocateFixed, MapPin } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { PinMap } from "@/components/map/PinMap";
import { Button } from "@/components/ui/button";
import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
} from "@/components/ui/combobox";
import { QueryResolver } from "@/components/ui/query-resolver";
import { useLocations, useUserCoords } from "@/hooks/useLocations";
import { debounce } from "@/lib/utils";
import {
	fetchGeolocationAutocomplete,
	type GeolocationAutocompleteItem,
} from "@/services/locations";

export const Route = createFileRoute("/")({
	component: App,
});

function App() {
	const { coords, setCoords, ready } = useUserCoords();
	const [addressInput, setAddressInput] = useState("Current Location");
	const query = useLocations(coords, ready);
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

	const handleAddressInputChange = (value: string) => {
		setAddressInput(value);

		const text = value.trim();
		if (text.length < 3) {
			debouncedFetchSuggestionsRef.current.cancel();
			setAddressSuggestions([]);
			setIsAddressLoading(false);
			return;
		}

		debouncedFetchSuggestionsRef.current(text);
	};

	const getCurrentLocation = () => {
		if (!navigator.geolocation) {
			toast.error("Geolocation is not supported by your browser.");
			return;
		}

		navigator.geolocation.getCurrentPosition(
			(position) => {
				const { latitude, longitude } = position.coords;
				setCoords({ lat: latitude, lng: longitude });
				setAddressInput("Current Location");
				setAddressSuggestions([]);
			},
			(error) => {
				console.log(error);
				toast.error(
					"Unable to retrieve your location. Please allow location access and try again.",
				);
			},
			{ timeout: 10000 },
		);
	};

	return (
		<div className="px-8 pb-8 flex gap-8 flex-1 flex-col xl:flex-row bg-secondary">
			<div className="flex flex-col justify-center gap-4 xl:basis-xl">
				<div className="space-y-4">
					<div className="space-y-4 border-b pb-4">
						<h1 className="text-xl font-medium">Bidets Nearby</h1>
						<Combobox
							value={addressInput}
							inputValue={addressInput}
							onInputValueChange={handleAddressInputChange}
							onValueChange={(value) => {
								setAddressInput(value ?? "");
								if (!value) return;
								const selectedSuggestion = addressSuggestions.find(
									(suggestion) => suggestion.label === value,
								);
								if (!selectedSuggestion) return;

								setCoords({
									lat: selectedSuggestion.latitude,
									lng: selectedSuggestion.longitude,
								});
							}}
							items={addressSuggestions}
						>
							<ComboboxInput
								className="w-full bg-white h-auto py-1"
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
						<Button
							type="button"
							variant="outline"
							className="cursor-pointer w-full"
							onClick={getCurrentLocation}
						>
							<LocateFixed />
							Use Current Location
						</Button>
					</div>
					<QueryResolver query={query}>
						{(locations) => (
							<ul className="text-lg space-y-2">
								{locations.map((location) => (
									<li key={location.id} className="flex items-center gap-2">
										<MapPin className="text-primary" />
										<Link
											to="/bidets/$bidetId"
											params={{
												bidetId: location.id.toString(),
											}}
											className="hover:text-primary transition-colors"
										>
											{location.name}
										</Link>
									</li>
								))}
								{locations.length === 0 && (
									<li className="text-muted-foreground">
										No bidets found nearby. Be the first to add one!
									</li>
								)}
							</ul>
						)}
					</QueryResolver>
					<p className="text-muted-foreground italic text-sm">
						Know where a bidet is?{" "}
						<Link
							to="/register"
							className="text-primary hover:underline transition-colors"
						>
							Sign up and add one now!
						</Link>
					</p>
				</div>
			</div>
			<div className="flex-1">
				<QueryResolver query={query}>
					{(locations) => <PinMap data={locations} center={coords} />}
				</QueryResolver>
			</div>
		</div>
	);
}
