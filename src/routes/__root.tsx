import { TanStackDevtools } from "@tanstack/react-devtools";
import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

function NotFoundPage() {
	return (
		<div className="flex flex-col items-center justify-center flex-1 gap-4 p-8 text-center">
			<p className="text-6xl font-bold text-primary">404</p>
			<h1 className="text-2xl font-semibold">Page not found</h1>
			<p className="text-muted-foreground max-w-sm">
				The page you're looking for doesn't exist or may have been moved.
			</p>
			<Button asChild>
				<Link to="/">Back to Home</Link>
			</Button>
		</div>
	);
}

export const Route = createRootRoute({
	notFoundComponent: NotFoundPage,
	component: () => (
		<div className="flex flex-col h-full overflow-auto">
			<Header />
			<Outlet />
			<Toaster />
			<TanStackDevtools
				config={{
					position: "bottom-right",
				}}
				plugins={[
					{
						name: "Tanstack Router",
						render: <TanStackRouterDevtoolsPanel />,
					},
				]}
			/>
		</div>
	),
});
