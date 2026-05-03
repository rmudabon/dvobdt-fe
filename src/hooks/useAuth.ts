import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { login, logout, getCurrentUser } from '@/services/user'

export function useUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: getCurrentUser,
  })
}

export function useLogin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      qc.setQueryData(['user'], data.user)
    },
  })
}

export function useLogout() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      qc.setQueryData(['user'], null)
    },
  })
}
