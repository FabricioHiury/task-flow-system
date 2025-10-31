import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userService, type CreateUserRequest } from '@/lib/api'

// Query keys para organização
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: () => [...userKeys.lists()] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
}

// Hook para buscar todos os usuários
export function useUsers() {
  return useQuery({
    queryKey: userKeys.list(),
    queryFn: () => userService.getUsers(),
    staleTime: 1000 * 60 * 5, // 5 min
  })
}

// Hook para buscar um usuário específico
export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userService.getUser(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 min
  })
}

// Hook para criar um novo usuário
export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateUserRequest) => userService.createUser(data),
    onSuccess: () => {
      // Invalidar a lista de usuários
      queryClient.invalidateQueries({ queryKey: userKeys.list() })
    },
    onError: (error: any) => {
      console.error('Erro ao criar usuário:', error)
    },
  })
}
