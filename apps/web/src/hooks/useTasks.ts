import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { taskService, type Task, type CreateTaskRequest, type UpdateTaskRequest } from '@/lib/api'

// Query keys para organização
export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (filters: string) => [...taskKeys.lists(), { filters }] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
}

// Hook para buscar todas as tasks
export function useTasks() {
  return useQuery({
    queryKey: taskKeys.lists(),
    queryFn: () => taskService.getTasks(),
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}

// Hook para buscar uma task específica
export function useTask(id: string) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => taskService.getTask(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}

// Hook para criar uma nova task
export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTaskRequest) => taskService.createTask(data),
    onSuccess: (newTask) => {
      // Invalidar a lista de tasks
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
      
      // Adicionar a nova task ao cache otimisticamente
      queryClient.setQueryData(taskKeys.detail(newTask.id), newTask)
    },
    onError: (error: any) => {
      console.error('Erro ao criar task:', error)
    },
  })
}

// Hook para atualizar uma task
export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskRequest }) => 
      taskService.updateTask(id, data),
    onSuccess: (updatedTask, { id }) => {
      // Atualizar a task específica no cache
      queryClient.setQueryData(taskKeys.detail(id), updatedTask)
      
      // Invalidar a lista de tasks para refletir as mudanças
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar task:', error)
    },
  })
}

// Hook para deletar uma task
export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => taskService.deleteTask(id),
    onSuccess: (_, deletedId) => {
      // Remover a task do cache
      queryClient.removeQueries({ queryKey: taskKeys.detail(deletedId) })
      
      // Invalidar a lista de tasks
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
    },
    onError: (error: any) => {
      console.error('Erro ao deletar task:', error)
    },
  })
}

// Hook para atualização otimista de status
export function useUpdateTaskStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Task['status'] }) => 
      taskService.updateTask(id, { status }),
    onMutate: async ({ id, status }) => {
      // Cancelar queries em andamento
      await queryClient.cancelQueries({ queryKey: taskKeys.detail(id) })
      
      // Snapshot do valor anterior
      const previousTask = queryClient.getQueryData<Task>(taskKeys.detail(id))
      
      // Atualização otimista
      if (previousTask) {
        queryClient.setQueryData<Task>(taskKeys.detail(id), {
          ...previousTask,
          status,
          updatedAt: new Date().toISOString(),
        })
      }
      
      return { previousTask }
    },
    onError: (_, { id }, context) => {
      // Reverter em caso de erro
      if (context?.previousTask) {
        queryClient.setQueryData(taskKeys.detail(id), context.previousTask)
      }
    },
    onSettled: (_, __, { id }) => {
      // Sempre invalidar após a mutação
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
    },
  })
}