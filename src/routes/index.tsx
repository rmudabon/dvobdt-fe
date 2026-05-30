import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { PinMap } from "@/components/map/PinMap";
import { QueryResolver } from "@/components/ui/query-resolver";
import { useLocations, useUserCoords } from "@/hooks/useLocations";

export const Route = createFileRoute("/")({
	component: App,
});

function App() {
	const { coords, ready } = useUserCoords();
	const query = useLocations(coords, ready);
	return (
		<div className="px-8 pb-8 flex gap-8 flex-1 flex-col xl:flex-row bg-secondary">
			<div className="flex flex-col justify-center gap-4 xl:basis-xl">
				<div className="py-4 space-y-4">
					<h1 className="text-2xl font-medium">Bidets Near Me</h1>
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
					<p className="text-muted-foreground italic">
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
