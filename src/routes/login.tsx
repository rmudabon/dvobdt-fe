import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useLogin } from '@/hooks/useAuth'
import { getCurrentUser } from '@/lib/auth'

export const Route = createFileRoute('/login')({
  component: Login,
})

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const login = useLogin()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await login.mutateAsync({ username, password })
      // simple redirect to home for demo
      
    } catch (err: any) {
        console.log(err)
      // noop - mutation exposes error
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <button onClick={() => getCurrentUser()} className="absolute top-4 left-4 text-cyan-600 hover:underline">Check Locations</button>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md p-6 bg-white rounded shadow"
      >
        <h2 className="text-xl font-semibold mb-4">Login</h2>

        <label className="block mb-2">
          <span className="text-sm">Username</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 block w-full border rounded p-2"
            placeholder="user"
          />
        </label>

        <label className="block mb-4">
          <span className="text-sm">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full border rounded p-2"
            placeholder="pass"
          />
        </label>

        <button
          type="submit"
          className="w-full bg-cyan-600 text-white p-2 rounded"
          disabled={login.isPending}
        >
          {login.isPending ? 'Signing in...' : 'Sign in'}
        </button>

        <p className="mt-3 text-sm text-gray-600">Demo: use username <strong>user</strong> and password <strong>pass</strong>.</p>
      </form>
    </div>
  )
}
