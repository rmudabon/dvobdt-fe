import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as auth from '../lib/auth'

export function useUser() {
  // Fetch current user from the backend `/me` endpoint (uses stored token)
  return useQuery({
    queryKey: ['user'],
    queryFn: auth.getCurrentUser
  })
}

export function useLogin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: auth.loginApi,
    onSuccess: (data) => {
      qc.setQueryData(['user'], data.user)
    },
  })
}

export function useLogout() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: auth.logoutApi,
    onSuccess: () => {
      qc.setQueryData(['user'], null)
    },
  })
}
