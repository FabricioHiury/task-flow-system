import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { commentService, type Comment, type CreateCommentRequest } from '@/lib/api'

// Query keys para organização
export const commentKeys = {
  all: ['comments'] as const,
  lists: () => [...commentKeys.all, 'list'] as const,
  list: (taskId: string) => [...commentKeys.lists(), { taskId }] as const,
}

// Hook para buscar comentários de uma task
export function useComments(taskId: string) {
  return useQuery({
    queryKey: commentKeys.list(taskId),
    queryFn: () => commentService.getComments(taskId),
    enabled: !!taskId,
    staleTime: 1000 * 60 * 2, // 2 minutos
  })
}

// Hook para criar um novo comentário
export function useCreateComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCommentRequest) => commentService.createComment(data),
    onSuccess: (newComment) => {
      // Invalidar a lista de comentários da task
      queryClient.invalidateQueries({ 
        queryKey: commentKeys.list(newComment.taskId) 
      })
    },
    onError: (error: any) => {
      console.error('Erro ao criar comentário:', error)
    },
  })
}

// Hook para deletar um comentário
export function useDeleteComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => commentService.deleteComment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentKeys.lists() })
    },
    onError: (error: any) => {
      console.error('Erro ao deletar comentário:', error)
    },
  })
}

// Hook para criar comentário com atualização otimista
export function useCreateCommentOptimistic() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCommentRequest) => commentService.createComment(data),
    onMutate: async (newComment) => {
      // Cancelar queries em andamento
      await queryClient.cancelQueries({ 
        queryKey: commentKeys.list(newComment.taskId) 
      })
      
      // Snapshot do valor anterior
      const previousComments = queryClient.getQueryData<Comment[]>(
        commentKeys.list(newComment.taskId)
      )
      
      // Criar comentário temporário para atualização otimista
      const tempComment: Comment = {
        id: `temp-${Date.now()}`,
        content: newComment.content,
        taskId: newComment.taskId,
        authorId: 'current-user', // Seria obtido do contexto de auth
        author: {
          id: 'current-user',
          name: 'Você',
          email: 'user@example.com',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      
      // Atualização otimista
      queryClient.setQueryData<Comment[]>(
        commentKeys.list(newComment.taskId),
        (old) => old ? [...old, tempComment] : [tempComment]
      )
      
      return { previousComments, tempComment }
    },
    onError: (_, newComment, context) => {
      // Reverter em caso de erro
      if (context?.previousComments) {
        queryClient.setQueryData(
          commentKeys.list(newComment.taskId),
          context.previousComments
        )
      }
    },
    onSettled: (_, __, newComment) => {
      // Sempre invalidar após a mutação
      queryClient.invalidateQueries({ 
        queryKey: commentKeys.list(newComment.taskId) 
      })
    },
  })
}