import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useLogout } from "../hooks/useAuth";

export const Route = createFileRoute("/logout")({
	component: Logout,
});

function Logout() {
	const logout = useLogout();
	const navigate = useNavigate();

	useEffect(() => {
		logout.mutate(undefined, {
			onSettled: () => navigate({ to: "/" }),
		});
	}, [logout.mutate, navigate]);

	return null;
}
