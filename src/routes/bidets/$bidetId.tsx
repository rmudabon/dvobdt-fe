import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/bidets/$bidetId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/bidets/$bidetId"!</div>
}
