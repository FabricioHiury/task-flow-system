import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { authService, type LoginRequest, type RegisterRequest, type AuthResponse } from '@/lib/api'
import { socketService } from '@/lib/socket'

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: LoginRequest): Promise<AuthResponse> => {
      return await authService.login(data)
    },
    onSuccess: (response) => {
      // Armazenar dados no localStorage
      localStorage.setItem('token', response.access_token)
      localStorage.setItem('user', JSON.stringify(response.user))
      
      // Conectar ao WebSocket
      socketService.connect(response.access_token)
      
      // Invalidar queries relacionadas à autenticação para forçar re-render
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      
      // Forçar um reload da página para garantir que o AuthContext seja atualizado
      window.location.href = '/dashboard'
    },
    onError: (error: any) => {
      console.error('Erro no login:', error)
      throw error
    },
  })
}

export function useRegister() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: RegisterRequest): Promise<AuthResponse> => {
      return await authService.register(data)
    },
    onSuccess: (response) => {
      // Armazenar dados no localStorage
      localStorage.setItem('token', response.access_token)
      localStorage.setItem('user', JSON.stringify(response.user))
      
      socketService.connect(response.access_token)
      
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      
      window.location.href = '/dashboard'
    },
    onError: (error: any) => {
      console.error('Erro no registro:', error)
      throw error
    },
  })
}

export function useLogout() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      authService.logout()
      socketService.disconnect()
    },
    onSuccess: () => {
      // Limpar cache do React Query
      queryClient.clear()
      
      // Navegar para a página de login
      navigate({ to: '/login' })
    },
    onError: (error: any) => {
      console.error('Erro no logout:', error)
    },
  })
}