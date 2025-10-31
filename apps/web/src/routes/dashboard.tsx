import { createFileRoute, Navigate, useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckSquare, Clock, AlertCircle, Plus, TrendingUp } from 'lucide-react'
import { useTasks } from '@/hooks/useTasks'
import { DashboardStatsSkeleton, DashboardRecentTasksSkeleton } from '@/components/skeletons/dashboard-skeleton'
import { Skeleton } from '@/components/ui/skeleton'

function DashboardPage() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const navigate = useNavigate()

  const { data: tasks, isLoading: tasksLoading } = useTasks()

  const handleCreateTask = () => {
    navigate({ to: '/tasks', search: { status: undefined } })
  }

  const handleViewAllTasks = () => {
    navigate({ to: '/tasks', search: { status: undefined } })
  }

  const handleViewInProgressTasks = () => {
    navigate({ to: '/tasks', search: { status: 'IN_PROGRESS' } })
  }

  const handleViewPendingTasks = () => {
    navigate({ to: '/tasks', search: { status: 'TODO' } })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        
        <DashboardStatsSkeleton />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <DashboardRecentTasksSkeleton />
          
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  const taskStats = tasks ? {
    total: tasks.length,
    completed: tasks.filter((task) => task.status === 'DONE').length,
    inProgress: tasks.filter((task) => task.status === 'IN_PROGRESS').length,
    pending: tasks.filter((task) => task.status === 'TODO').length,
  } : { total: 0, completed: 0, inProgress: 0, pending: 0 }

  const recentTasks = tasks?.slice(0, 5) || []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Bem-vindo, {user?.username || 'Usuário'}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Aqui está um resumo das suas tarefas e atividades recentes.
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Tarefas</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskStats.total}</div>
            <p className="text-xs text-muted-foreground">
              Todas as suas tarefas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{taskStats.completed}</div>
            <p className="text-xs text-muted-foreground">
              {taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Progresso</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{taskStats.inProgress}</div>
            <p className="text-xs text-muted-foreground">
              Tarefas ativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{taskStats.pending}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando início
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tarefas Recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Tarefas Recentes</CardTitle>
            <CardDescription>
              Suas últimas tarefas criadas ou atualizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tasksLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                ))}
              </div>
            ) : recentTasks.length > 0 ? (
              <div className="space-y-4">
                {recentTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{task.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {task.description?.substring(0, 60)}
                        {task.description && task.description.length > 60 ? '...' : ''}
                      </p>
                    </div>
                    <div className="ml-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        task.status === 'DONE' 
                          ? 'bg-green-100 text-green-800' 
                          : task.status === 'IN_PROGRESS'
                          ? 'bg-blue-100 text-blue-800'
                          : task.status === 'REVIEW'
                          ? 'bg-purple-100 text-purple-800'
                          : task.status === 'TODO'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status === 'DONE' ? 'Concluída' : 
                         task.status === 'IN_PROGRESS' ? 'Em Progresso' : 
                         task.status === 'REVIEW' ? 'Em Revisão' : 
                         task.status === 'TODO' ? 'Pendente' : 'Pendente'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhuma tarefa encontrada</p>
                <Button className="mt-4" size="sm" onClick={handleCreateTask}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar primeira tarefa
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ações Rápidas */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Acesse rapidamente as funcionalidades principais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={handleCreateTask}
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Nova Tarefa
              </Button>
              
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={handleViewAllTasks}
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                Ver Todas as Tarefas
              </Button>
              
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={handleViewInProgressTasks}
              >
                <Clock className="h-4 w-4 mr-2" />
                Tarefas em Progresso
              </Button>
              
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={handleViewPendingTasks}
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Tarefas Pendentes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
})