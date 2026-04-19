import { createFileRoute } from '@tanstack/react-router'
import { useLogout } from '../hooks/useAuth'

export const Route = createFileRoute('/logout')({
  component: Logout,
})

function Logout() {
  const logout = useLogout()

  async function handleLogout() {
    try {
      await logout.mutateAsync()
    } catch (e) {
      // ignore
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded shadow text-center">
        <h2 className="text-xl font-semibold mb-4">Logout</h2>
        <p className="mb-4">Click the button to sign out.</p>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded"
          disabled={logout.isPending}
        >
          {logout.isPending ? 'Signing out...' : 'Sign out'}
        </button>
      </div>
    </div>
  )
}
