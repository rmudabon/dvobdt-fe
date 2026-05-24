import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { PinMap } from "@/components/map/PinMap";
import { QueryResolver } from "@/components/ui/query-resolver";
import { useLocations } from "@/hooks/useLocations";

export const Route = createFileRoute("/")({
	component: App,
});

function App() {
	const query = useLocations();
	return (
		<div className="px-8 pb-8 flex gap-8 flex-1 flex-col xl:flex-row bg-secondary">
			<div className="flex flex-col justify-center gap-4 xl:basis-xl">
				<div className="p-4 space-y-4">
					<h2 className="text-xl font-medium">Nearest Bidets</h2>
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
							</ul>
						)}
					</QueryResolver>
				</div>
			</div>
			<div className="flex-1">
				<PinMap />
			</div>
		</div>
	);
}
