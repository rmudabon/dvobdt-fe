import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { login, loginSchema, type UserLoginData } from "@/services/user";

export const Route = createFileRoute("/login")({
	component: LoginForm,
});

const defaultValues: UserLoginData = {
	username: "",
	password: "",
};

function LoginForm() {
	const qc = useQueryClient();
	const navigate = useNavigate();
	const loginMutation = useMutation({
		mutationFn: login,
		onSuccess(data) {
			console.log("Login successful", data);
			qc.setQueryData(["user"], { username: data.username });
			navigate({
				to: "/",
			});
		},
		onError(error) {
			console.error("Error logging in", error);
		},
	});

	const form = useForm({
		defaultValues,
		validators: {
			onSubmit: loginSchema,
		},
		onSubmit: async ({ formApi, value }) => {
			await loginMutation.mutateAsync({
				username: value.username,
				password: value.password,
			});
			formApi.reset();
		},
	});

	return (
		<div className="container mx-auto h-full flex flex-col items-center">
			<form
				onSubmit={(e) => {
					e.preventDefault();
					form.handleSubmit();
				}}
				className="space-y-8 w-full max-w-lg p-8"
			>
				<form.Field name="username">
					{(field) => (
						<div className="flex flex-col">
							<label
								htmlFor={field.name}
								className="text-lg font-semibold mb-2"
							>
								Username
							</label>
							<input
								id={field.name}
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
								className="border border-teal-700 rounded-md p-2"
							/>
							<p className="text-red-500">
								{field.state.meta.errors[0]?.message}
							</p>
						</div>
					)}
				</form.Field>
				<form.Field name="password">
					{(field) => (
						<div className="flex flex-col">
							<label
								htmlFor={field.name}
								className="text-lg font-semibold mb-2"
							>
								Password
							</label>
							<input
								id={field.name}
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
								className="border border-teal-700 rounded-md p-2"
								type="password"
							/>
							<p className="text-red-500">
								{field.state.meta.errors[0]?.message}
							</p>
						</div>
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
							size="lg"
							className="w-full"
							disabled={!canSubmit || isSubmitting || isPristine}
						>
							Log In
						</Button>
					)}
				/>
			</form>
		</div>
	);
}
