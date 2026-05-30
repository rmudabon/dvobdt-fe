import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { QueryResolver } from "@/components/ui/query-resolver";
import { useUser } from "@/hooks/useAuth";
import { useMyLocations } from "@/hooks/useLocations";

export const Route = createFileRoute("/profile")({
	component: ProfilePage,
});

const statusStyles: Record<string, string> = {
	ACTIVE: "bg-green-100 text-green-800",
	PENDING: "bg-yellow-100 text-yellow-800",
	REJECTED: "bg-red-100 text-red-800",
};

const statusLabel: Record<string, string> = {
	ACTIVE: "Active",
	PENDING: "Pending",
	REJECTED: "Rejected",
};

function ProfilePage() {
	const user = useUser();
	const locationsQuery = useMyLocations();

	return (
		<div className="px-8 pb-8 container mx-auto space-y-8">
			<div className="p-4 space-y-1">
				<h1 className="text-3xl font-semibold text-primary">My Profile</h1>
				{user.data ? (
					<p className="text-lg">{user.data.username}</p>
				) : (
					<p className="text-muted-foreground">Not signed in</p>
				)}
			</div>

			<div className="p-4 space-y-4">
				<h2 className="text-xl font-medium">My Submissions</h2>
				<QueryResolver query={locationsQuery}>
					{(locations) =>
						locations.length === 0 ? (
							<p className="text-muted-foreground">
								You haven't added any bidets yet.
							</p>
						) : (
							<ul className="space-y-3">
								{locations.map((location) => (
									<li
										key={location.id}
										className="flex items-center gap-2 text-lg"
									>
										<MapPin className="text-primary shrink-0" />
										<Link
											to="/bidets/$bidetId"
											params={{ bidetId: location.id.toString() }}
											className="hover:text-primary transition-colors flex-1"
										>
											{location.name}
										</Link>
										<span
											className={`text-sm font-medium px-2 py-0.5 rounded-full ${statusStyles[location.status]}`}
										>
											{statusLabel[location.status]}
										</span>
									</li>
								))}
							</ul>
						)
					}
				</QueryResolver>
			</div>
		</div>
	);
}
