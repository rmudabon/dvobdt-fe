import { TanStackDevtools } from "@tanstack/react-devtools";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import Header from "@/components/Header";
import { Toaster } from "@/components/ui/sonner";

export const Route = createRootRoute({
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
