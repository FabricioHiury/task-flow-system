import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationService, type Notification } from '@/lib/api'

// Query keys para organização
export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (filters: string) => [...notificationKeys.lists(), { filters }] as const,
  unread: () => [...notificationKeys.all, 'unread'] as const,
  count: () => [...notificationKeys.all, 'count'] as const,
}

// Hook para buscar todas as notificações
export function useNotifications() {
  return useQuery({
    queryKey: notificationKeys.lists(),
    queryFn: () => notificationService.getNotifications(),
    staleTime: 1000 * 60 * 2, // 2 minutos
  })
}

// Hook para buscar notificações não lidas
export function useUnreadNotifications() {
  return useQuery({
    queryKey: notificationKeys.unread(),
    queryFn: () => notificationService.getUnreadNotifications(),
    staleTime: 1000 * 30, // 30 segundos
    refetchInterval: 1000 * 60, // Refetch a cada minuto
  })
}

// Hook para buscar contagem de notificações não lidas
export function useUnreadNotificationsCount() {
  return useQuery({
    queryKey: notificationKeys.count(),
    queryFn: () => notificationService.getUnreadCount(),
    staleTime: 1000 * 30, // 30 segundos
    refetchInterval: 1000 * 60, // Refetch a cada minuto
  })
}

// Hook para marcar notificação como lida
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onMutate: async (id) => {
      // Cancelar queries em andamento
      await queryClient.cancelQueries({ queryKey: notificationKeys.lists() })
      await queryClient.cancelQueries({ queryKey: notificationKeys.unread() })
      await queryClient.cancelQueries({ queryKey: notificationKeys.count() })
      
      // Snapshot dos valores anteriores
      const previousNotifications = queryClient.getQueryData<Notification[]>(
        notificationKeys.lists()
      )
      const previousUnread = queryClient.getQueryData<Notification[]>(
        notificationKeys.unread()
      )
      const previousCount = queryClient.getQueryData<number>(
        notificationKeys.count()
      )
      
      // Atualização otimista - marcar como lida
      if (previousNotifications) {
        queryClient.setQueryData<Notification[]>(
          notificationKeys.lists(),
          previousNotifications.map(notification =>
            notification.id === id
              ? { ...notification, status: 'READ' as const }
              : notification
          )
        )
      }
      
      // Remover das não lidas
      if (previousUnread) {
        queryClient.setQueryData<Notification[]>(
          notificationKeys.unread(),
          previousUnread.filter(notification => notification.id !== id)
        )
      }
      
      // Decrementar contador
      if (typeof previousCount === 'number') {
        queryClient.setQueryData<number>(
          notificationKeys.count(),
          Math.max(0, previousCount - 1)
        )
      }
      
      return { previousNotifications, previousUnread, previousCount }
    },
    onError: (err, id, context) => {
      // Reverter em caso de erro
      if (context?.previousNotifications) {
        queryClient.setQueryData(notificationKeys.lists(), context.previousNotifications)
      }
      if (context?.previousUnread) {
        queryClient.setQueryData(notificationKeys.unread(), context.previousUnread)
      }
      if (context?.previousCount !== undefined) {
        queryClient.setQueryData(notificationKeys.count(), context.previousCount)
      }
    },
    onSettled: () => {
      // Sempre invalidar após a mutação
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

// Hook para marcar todas as notificações como lidas
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onMutate: async () => {
      // Cancelar queries em andamento
      await queryClient.cancelQueries({ queryKey: notificationKeys.all })
      
      // Snapshot dos valores anteriores
      const previousNotifications = queryClient.getQueryData<Notification[]>(
        notificationKeys.lists()
      )
      const previousUnread = queryClient.getQueryData<Notification[]>(
        notificationKeys.unread()
      )
      const previousCount = queryClient.getQueryData<number>(
        notificationKeys.count()
      )
      
      // Atualização otimista - marcar todas como lidas
      if (previousNotifications) {
        queryClient.setQueryData<Notification[]>(
          notificationKeys.lists(),
          previousNotifications.map(notification => ({
            ...notification,
            status: 'READ' as const
          }))
        )
      }
      
      // Limpar não lidas
      queryClient.setQueryData<Notification[]>(notificationKeys.unread(), [])
      
      // Zerar contador
      queryClient.setQueryData<number>(notificationKeys.count(), 0)
      
      return { previousNotifications, previousUnread, previousCount }
    },
    onError: (err, _, context) => {
      // Reverter em caso de erro
      if (context?.previousNotifications) {
        queryClient.setQueryData(notificationKeys.lists(), context.previousNotifications)
      }
      if (context?.previousUnread) {
        queryClient.setQueryData(notificationKeys.unread(), context.previousUnread)
      }
      if (context?.previousCount !== undefined) {
        queryClient.setQueryData(notificationKeys.count(), context.previousCount)
      }
    },
    onSettled: () => {
      // Sempre invalidar após a mutação
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

// Hook para deletar notificação
export function useDeleteNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => notificationService.deleteNotification(id),
    onSuccess: () => {
      // Invalidar todas as queries de notificações
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
    onError: (error: any) => {
      console.error('Erro ao deletar notificação:', error)
    },
  })
}