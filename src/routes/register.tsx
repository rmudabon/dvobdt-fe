import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { register, userSchema } from "@/services/user";
import z from "zod";

export const Route = createFileRoute('/register')({
    component: RegistrationForm,
})

const UserRegistrationSchema = userSchema.extend({
    confirmPassword: z.string().min(1, "Required")
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
})

type UserRegistrationFormData = z.infer<typeof UserRegistrationSchema>

const defaultValues: UserRegistrationFormData = {
    email: "",
    username: "",
    password: "",
    confirmPassword: ""
}

function RegistrationForm() {
    const qc = useQueryClient()
    const navigate = useNavigate()
    const registerMutation = useMutation({
        mutationFn: register,
        onSuccess(data) {
            console.log("User created successfully", data)
            qc.setQueryData(['user'], { username: data.username })
            navigate({
                to: '/login'
            })
        },
        onError(error) {
            console.error("Error creating location", error)
        }
    })

    const form = useForm({
        defaultValues,
        validators: {
            onSubmit: UserRegistrationSchema,
        },
        onSubmit: async ({ formApi, value }) => {
            await registerMutation.mutateAsync({
                email: value.email,
                username: value.username,
                password: value.password
            })
            formApi.reset()
        }
    })

    

    return (
        <div className="container mx-auto h-full flex flex-col items-center justify-center">
            <h1 className="text-2xl font-bold">Register</h1>
            <form 
                onSubmit={(e) => {
                    e.preventDefault()
                    form.handleSubmit()
                }}
                className="space-y-8 w-full max-w-lg p-8"
            >
                <form.Field
                    name="username"
                >
                    {(field) => (
                        <div className="flex flex-col">
                            <label htmlFor={field.name} className="text-xl font-semibold mb-2">Username</label>
                            <input
                                id={field.name}
                                value={field.state.value}
                                onChange={e => field.handleChange(e.target.value)}
                                className="border border-teal-700 rounded-md p-2"
                            />
                            <p className="text-red-500">{field.state.meta.errors[0]?.message}</p>
                        </div>
                    )}
                </form.Field>
                <form.Field
                    name="email"
                >
                    {(field) => (
                        <div className="flex flex-col">
                            <label htmlFor={field.name} className="text-xl font-semibold mb-2">Email</label>
                            <input
                                id={field.name}
                                value={field.state.value}
                                onChange={e => field.handleChange(e.target.value)}
                                className="border border-teal-700 rounded-md p-2"
                                type="email"
                            />
                            <p className="text-red-500">{field.state.meta.errors[0]?.message}</p>
                        </div>
                    )}
                </form.Field>
                <form.Field
                    name="password"
                >
                    {(field) => (
                        <div className="flex flex-col">
                            <label htmlFor={field.name} className="text-xl font-semibold mb-2">Password</label>
                            <input
                                id={field.name}
                                value={field.state.value}
                                onChange={e => field.handleChange(e.target.value)}
                                className="border border-teal-700 rounded-md p-2"
                                type="password"
                            />
                            <p className="text-red-500">{field.state.meta.errors[0]?.message}</p>
                        </div>
                    )}
                </form.Field>
                <form.Field
                    name="confirmPassword"
                >
                    {(field) => (
                        <div className="flex flex-col">
                            <label htmlFor={field.name} className="text-xl font-semibold mb-2">Confirm Password</label>
                            <input
                                id={field.name}
                                value={field.state.value}
                                onChange={e => field.handleChange(e.target.value)}
                                className="border border-teal-700 rounded-md p-2"
                                type="password"
                            />
                            <p className="text-red-500">{field.state.meta.errors[0]?.message}</p>
                        </div>
                    )}
                </form.Field>
                <form.Subscribe
                    selector={(state) => [state.canSubmit, state.isSubmitting, state.isPristine]}
                    children={([canSubmit, isSubmitting, isPristine]) => (
                        <button
                            type="submit"
                            role="button"
                            className="cursor-pointer bg-teal-700 text-white px-4 py-2 rounded-md hover:bg-teal-800 transition-colors"
                            disabled={!canSubmit || isSubmitting || isPristine}
                        >
                            Submit
                        </button>
                    )}
                />
            </form>
        </div>
    )
}