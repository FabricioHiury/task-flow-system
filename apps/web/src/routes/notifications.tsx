import { createFileRoute, Navigate } from '@tanstack/react-router'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { 
  Bell, 
  BellOff, 
  Check, 
  CheckCheck, 
  Trash2,
  Filter,
  Calendar,
  AlertCircle,
  MessageSquare,
  Clock
} from 'lucide-react'
import { 
  useNotifications, 
  useMarkNotificationAsRead, 
  useMarkAllNotificationsAsRead, 
  useDeleteNotification 
} from '@/hooks/useNotifications'

function NotificationsPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')

  const { data: notifications, isLoading: notificationsLoading } = useNotifications()
  const markAsReadMutation = useMarkNotificationAsRead()
  const markAllAsReadMutation = useMarkAllNotificationsAsRead()
  const deleteNotificationMutation = useDeleteNotification()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  const filteredNotifications = notifications?.filter((notification) => {
    if (filter === 'unread') return notification.status === 'UNREAD'
    if (filter === 'read') return notification.status === 'READ'
    return true
  }) || []

  const unreadCount = notifications?.filter(n => n.status === 'UNREAD').length || 0

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'TASK_ASSIGNED':
        return <AlertCircle className="h-5 w-5 text-blue-600" />
      case 'TASK_UPDATED':
        return <Clock className="h-5 w-5 text-orange-600" />
      case 'COMMENT_ADDED':
        return <MessageSquare className="h-5 w-5 text-green-600" />
      case 'TASK_DUE_SOON':
        return <Calendar className="h-5 w-5 text-red-600" />
      default:
        return <Bell className="h-5 w-5 text-gray-600" />
    }
  }

  const getNotificationTypeText = (type: string) => {
    switch (type) {
      case 'TASK_ASSIGNED':
        return 'Tarefa Atribuída'
      case 'TASK_UPDATED':
        return 'Tarefa Atualizada'
      case 'COMMENT_ADDED':
        return 'Novo Comentário'
      case 'TASK_DUE_SOON':
        return 'Prazo Próximo'
      default:
        return 'Notificação'
    }
  }

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate(id)
  }

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate()
  }

  const handleDeleteNotification = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta notificação?')) {
      deleteNotificationMutation.mutate(id)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notificações</h1>
          <p className="text-muted-foreground mt-2">
            Acompanhe suas notificações e atualizações
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={handleMarkAllAsRead} disabled={markAllAsReadMutation.isPending}>
            <CheckCheck className="h-4 w-4 mr-2" />
            Marcar todas como lidas
          </Button>
        )}
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Todas as notificações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Não Lidas</CardTitle>
            <BellOff className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{unreadCount}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando leitura
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lidas</CardTitle>
            <Check className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {(notifications?.length || 0) - unreadCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Já visualizadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filtrar por:</span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
              >
                Todas
              </Button>
              <Button
                size="sm"
                variant={filter === 'unread' ? 'default' : 'outline'}
                onClick={() => setFilter('unread')}
              >
                Não Lidas ({unreadCount})
              </Button>
              <Button
                size="sm"
                variant={filter === 'read' ? 'default' : 'outline'}
                onClick={() => setFilter('read')}
              >
                Lidas
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Notificações */}
      {notificationsLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredNotifications.length > 0 ? (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`hover:shadow-md transition-shadow ${
                notification.status === 'UNREAD' ? 'border-l-4 border-l-primary bg-primary/5' : ''
              }`}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3 flex-1">
                    <div className="mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{notification.title}</h3>
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                          {getNotificationTypeText(notification.type)}
                        </span>
                        {notification.status === 'UNREAD' && (
                          <span className="w-2 h-2 bg-primary rounded-full"></span>
                        )}
                      </div>
                      
                      <p className="text-muted-foreground mb-3">{notification.message}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(notification.createdAt).toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    {notification.status === 'UNREAD' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkAsRead(notification.id)}
                        disabled={markAsReadMutation.isPending}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteNotification(notification.id)}
                      disabled={deleteNotificationMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {filter === 'unread' 
                  ? 'Nenhuma notificação não lida' 
                  : filter === 'read'
                  ? 'Nenhuma notificação lida'
                  : 'Nenhuma notificação encontrada'
                }
              </h3>
              <p className="text-muted-foreground">
                {filter === 'all' 
                  ? 'Você receberá notificações sobre atividades em suas tarefas.'
                  : 'Tente ajustar os filtros para ver outras notificações.'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export const Route = createFileRoute('/notifications')({
  component: NotificationsPage,
})