import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  Calendar,
  MessageSquare,
  Plus,
  Edit,
  X,
} from "lucide-react";
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
} from "@/hooks/useNotifications";
import { NotificationListSkeleton } from "@/components/skeletons/notification-skeleton";
import type { Notification } from "@/lib/api";

function NotificationsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  const { data: notifications, isLoading: notificationsLoading } =
    useNotifications();
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const deleteNotificationMutation = useDeleteNotification();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const unreadCount = notifications?.filter(
    (notification: Notification) => !notification.isRead
  ).length || 0;

  const readCount = notifications?.filter(
    (notification: Notification) => notification.isRead
  ).length || 0;

  const filteredNotifications = notifications?.filter(
    (notification: Notification) => {
      if (filter === "unread") return !notification.isRead;
      if (filter === "read") return notification.isRead;
      return true;
    }
  );

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "task_created":
        return <Plus className="h-5 w-5 text-blue-600" />;
      case "task_updated":
        return <Edit className="h-5 w-5 text-orange-600" />;
      case "task_deleted":
        return <X className="h-5 w-5 text-red-600" />;
      case "comment_created":
        return <MessageSquare className="h-5 w-5 text-green-600" />;
      case "comment_deleted":
        return <MessageSquare className="h-5 w-5 text-gray-600" />;
      case "system":
        return <Bell className="h-5 w-5 text-gray-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationTypeText = (type: string) => {
    switch (type) {
      case "task_created":
        return "Tarefa Criada";
      case "task_updated":
        return "Tarefa Atualizada";
      case "task_deleted":
        return "Tarefa Deletada";
      case "comment_created":
        return "Novo Comentário";
      case "comment_deleted":
        return "Comentário Removido";
      case "system":
        return "Sistema";
      default:
        return "Notificação";
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "HIGH":
        return "text-red-600";
      case "MEDIUM":
        return "text-orange-600";
      case "LOW":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const getPriorityText = (priority?: string) => {
    switch (priority) {
      case "HIGH":
        return "Alta";
      case "MEDIUM":
        return "Média";
      case "LOW":
        return "Baixa";
      default:
        return "Não definida";
    }
  };

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleDeleteNotification = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta notificação?")) {
      deleteNotificationMutation.mutate(id);
    }
  };

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
          <Button
            onClick={handleMarkAllAsRead}
            disabled={markAllAsReadMutation.isPending}
          >
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
            <div className="text-2xl font-bold text-orange-600">
              {unreadCount}
            </div>
            <p className="text-xs text-muted-foreground">Aguardando leitura</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lidas</CardTitle>
            <Check className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{readCount}</div>
            <p className="text-xs text-muted-foreground">Já visualizadas</p>
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
                variant={filter === "all" ? "default" : "outline"}
                onClick={() => setFilter("all")}
              >
                Todas
              </Button>
              <Button
                size="sm"
                variant={filter === "unread" ? "default" : "outline"}
                onClick={() => setFilter("unread")}
              >
                Não Lidas ({unreadCount})
              </Button>
              <Button
                size="sm"
                variant={filter === "read" ? "default" : "outline"}
                onClick={() => setFilter("read")}
              >
                Lidas
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Notificações */}
      {notificationsLoading ? (
        <NotificationListSkeleton />
      ) : filteredNotifications && filteredNotifications.length > 0 ? (
        <div className="space-y-4">
          {filteredNotifications.map((notification: Notification) => (
            <Card
              key={notification.id}
              className={`hover:shadow-md transition-shadow ${
                !notification.isRead
                  ? "border-l-4 border-l-primary bg-primary/5"
                  : ""
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
                        <h3 className="font-semibold">{notification.metadata.title}</h3>
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                          {getNotificationTypeText(notification.type)}
                        </span>
                        {!notification.isRead && (
                          <span className="w-2 h-2 bg-primary rounded-full"></span>
                        )}
                      </div>

                      <p className="text-muted-foreground mb-3">{notification.metadata.message}</p>

                      {/* Informações adicionais */}
                      {notification.metadata?.taskTitle && (
                        <div className="text-sm text-muted-foreground mb-2">
                          <span className="font-medium">Tarefa:</span>{" "}
                          {notification.metadata.taskTitle}
                        </div>
                      )}

                      {notification.metadata?.priority && (
                        <div className="text-sm text-muted-foreground mb-2">
                          <span className="font-medium">Prioridade:</span>{" "}
                          <span
                            className={getPriorityColor(
                              notification.metadata.priority
                            )}
                          >
                            {getPriorityText(notification.metadata.priority)}
                          </span>
                        </div>
                      )}

                      {notification.metadata?.changes &&
                        Object.keys(notification.metadata.changes).length >
                          0 && (
                          <div className="text-sm text-muted-foreground mb-2">
                            <span className="font-medium">Alterações:</span>
                            <ul className="list-disc list-inside ml-2 mt-1">
                              {Object.entries(
                                notification.metadata.changes
                              ).map(([key, value]: [string, any]) => (
                                <li key={key} className="text-xs">
                                  <span className="capitalize">
                                    {key === "status" ? "Status" : key}
                                  </span>
                                  :{" "}
                                  <span className="line-through text-gray-400">
                                    {value.from}
                                  </span>
                                  {" → "}
                                  <span className="font-medium">
                                    {value.to}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(notification.createdAt).toLocaleString(
                            "pt-BR",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    {!notification.isRead && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkAsRead(notification.id)}
                        disabled={markAsReadMutation.isPending}
                        title="Marcar como lida"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteNotification(notification.id)}
                      disabled={deleteNotificationMutation.isPending}
                      title="Excluir notificação"
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
                {filter === "unread"
                  ? "Nenhuma notificação não lida"
                  : filter === "read"
                    ? "Nenhuma notificação lida"
                    : "Nenhuma notificação encontrada"}
              </h3>
              <p className="text-muted-foreground">
                {filter === "all"
                  ? "Você receberá notificações sobre atividades em suas tarefas."
                  : "Tente ajustar os filtros para ver outras notificações."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export const Route = createFileRoute("/notifications")({
  component: NotificationsPage,
});
