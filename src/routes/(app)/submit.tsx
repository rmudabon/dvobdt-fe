import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import z from "zod";

export const Route = createFileRoute('/(app)/submit')({
    component: LocationForm,
})

const stallOptionSchema = z.enum(["M", "F", "U"])

const locationSchema = z.object({
    name: z.string().min(1, "Name is required"),
    address: z.string().min(1, "Address is required"),
    latitude: z.number().refine((val) => val >= -90 && val <= 90, "Latitude must be between -90 and 90"),
    longitude: z.number().refine((val) => val >= -180 && val <= 180, "Longitude must be between -180 and 180"),
    stall: z.enum(["M", "F", "U"], { message: "Stall must be 'Male', 'Female', or 'Unisex'" }),
    description: z.string().optional(),
    imageUrl: z.string().optional()
})

type LocationFormData = z.infer<typeof locationSchema>
const defaultValues: LocationFormData = {
    name: "",
    address: "",
    latitude: 0,
    longitude: 0,
    stall: "U",
    description: "",
    imageUrl: ""
}

function LocationForm() {
    const form = useForm({
        defaultValues,
        validators: {
            onChange: locationSchema,
            onBlur: locationSchema
        },
        onSubmit: (values) => {
            console.log(values)
        },
        onSubmitInvalid(props) {
            console.log("Form is invalid", props.formApi.getAllErrors())
        },
    })

    return (
        <div className="container mx-auto h-full flex flex-col items-center justify-center">
            <h1 className="text-2xl font-bold">Add New Bidet</h1>
            <form 
                onSubmit={(e) => {
                    e.preventDefault()
                    form.handleSubmit()
                }}
                className="space-y-8 w-full max-w-lg p-8"
            >
                <form.Field
                    name="name"
                >
                    {(field) => (
                        <div className="flex flex-col">
                            <label htmlFor={field.name} className="text-xl font-semibold mb-2">Name</label>
                            <input
                                id={field.name}
                                value={field.state.value}
                                onChange={e => field.handleChange(e.target.value)}
                                className="border border-teal-700 rounded-md p-2"
                            />
                            {!field.state.meta.isValid && <p className="text-red-500">{field.state.meta.errors[0]?.message}</p>}
                        </div>
                    )}
                </form.Field>
                <form.Field
                    name="address"
                >
                    {(field) => (
                        <div className="flex flex-col">
                            <label htmlFor={field.name} className="text-xl font-semibold mb-2">Address</label>
                            <input
                                id={field.name}
                                value={field.state.value}
                                onChange={e => field.handleChange(e.target.value)}
                                className="border border-teal-700 rounded-md p-2"
                            />
                            {!field.state.meta.isValid && <p className="text-red-500">{field.state.meta.errors[0]?.message}</p>}
                        </div>
                    )}
                </form.Field>
                <form.Field
                    name='description'
                >
                    {(field) => (
                        <div className="flex flex-col">
                            <label htmlFor={field.name} className="text-xl font-semibold mb-2">Description</label>
                            <textarea
                                id={field.name}
                                value={field.state.value}
                                onChange={e => field.handleChange(e.target.value)}
                                className="border border-teal-700 rounded-md p-2"
                                placeholder="Add other information here..."
                                rows={4}
                            />
                            {!field.state.meta.isValid && <p className="text-red-500">{field.state.meta.errors[0]?.message}</p>}
                        </div>
                    )}
                </form.Field>
                <form.Field
                    name='stall'
                >
                    {(field) => (
                        <div className="flex flex-col">
                            <label htmlFor={field.name} className="text-xl font-semibold mb-2">Stall Type</label>
                            <select
                                id={field.name}
                                value={field.state.value}
                                onChange={e => {
                                    const value = e.target.value;
                                    const parsedValue = stallOptionSchema.parse(value);
                                    field.handleChange(parsedValue)
                                }}
                                className="border border-teal-700 rounded-md p-2"
                            >
                                <option value="M">Male</option>
                                <option value="F">Female</option> 
                                <option value="U">Unisex</option>
                            </select>
                            {!field.state.meta.isValid && <p className="text-red-500">{field.state.meta.errors.join(', ')}</p>}
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