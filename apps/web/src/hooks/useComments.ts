import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { commentService, type CreateCommentRequest } from '@/lib/api'

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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: commentKeys.list(variables.taskId) 
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
    mutationFn: ({ taskId, commentId }: { taskId: string; commentId: string }) => 
      commentService.deleteComment(taskId, commentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.list(variables.taskId) })
    },
    onError: (error: any) => {
      console.error('Erro ao deletar comentário:', error)
    },
  })
}