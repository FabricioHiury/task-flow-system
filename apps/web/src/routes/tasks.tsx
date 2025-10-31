import { useState, useEffect } from 'react'
import { createFileRoute, Navigate, Link, useSearch } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/contexts/auth-context'
import { useTasks, useCreateTask, useDeleteTask } from '@/hooks/useTasks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Search, Trash2, Edit, CheckSquare, Clock, Calendar } from 'lucide-react'
import { TaskListSkeleton } from '@/components/skeletons/task-skeleton'
import { EditTaskModal } from '@/components/edit-task-modal'
import type { Task } from '@/lib/api'
import { useUsers } from '@/hooks/useUsers'

const createTaskSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']).optional(),
  deadline: z.string().optional(),
  assignedUserIds: z.array(z.string()).optional(),
})

type CreateTaskForm = z.infer<typeof createTaskSchema>

function TasksPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const searchParams = useSearch({ from: '/tasks' })
  const { data: users = [], isLoading: usersLoading } = useUsers()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  // Aplicar filtros dos search params
  useEffect(() => {
    if (searchParams?.status) {
      setStatusFilter(searchParams.status)
    }
  }, [searchParams])

  const { data: tasks, isLoading: tasksLoading } = useTasks()
  const createTaskMutation = useCreateTask()
  const deleteTaskMutation = useDeleteTask()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateTaskForm>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      status: 'TODO',
      priority: 'MEDIUM',
      assignedUserIds: []
    }
  })

  const selectedUsers = watch('assignedUserIds') || []

  const handleUserToggle = (userId: string) => {
    const currentUsers = selectedUsers || []
    if (currentUsers.includes(userId)) {
      setValue('assignedUserIds', currentUsers.filter(id => id !== userId))
    } else {
      setValue('assignedUserIds', [...currentUsers, userId])
    }
  }

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

  if (tasksLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Tarefas</h1>
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            Nova Tarefa
          </Button>
        </div>
        
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar tarefas..."
                disabled
                className="w-full"
              />
            </div>
            <Select disabled>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
            </Select>
            <Select disabled>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
            </Select>
          </div>
        </div>

        <TaskListSkeleton />
      </div>
    )
  }

  const filteredTasks = tasks?.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesPriority
  }) || []

  const onSubmit = (data: CreateTaskForm) => {
    const taskData = {
      ...data,
      status: data.status || 'TODO',
      priority: data.priority || 'MEDIUM'
    }
    createTaskMutation.mutate(taskData, {
      onSuccess: () => {
        setShowCreateForm(false)
        reset({
          title: '',
          description: '',
          status: 'TODO',
          priority: 'MEDIUM',
          deadline: '',
          assignedUserIds: []
        })
      }
    })
  }

  const handleDeleteTask = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
      deleteTaskMutation.mutate(id)
    }
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setShowEditModal(true)
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'DONE':
        return 'Concluída'
      case 'IN_PROGRESS':
        return 'Em Progresso'
      case 'REVIEW':
        return 'Em Revisão'
      case 'TODO':
        return 'Pendente'
      default:
        return status
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'Alta'
      case 'MEDIUM':
        return 'Média'
      case 'URGENT':
        return 'Urgente'
      case 'LOW':
        return 'Baixa'
      default:
        return priority
    }
  }

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'DONE':
        return 'default'
      case 'IN_PROGRESS':
        return 'secondary'
      case 'REVIEW':
        return 'outline'
      case 'TODO':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const getPriorityVariant = (priority: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (priority) {
      case 'URGENT':
        return 'destructive'
      case 'HIGH':
        return 'default'
      case 'MEDIUM':
        return 'secondary'
      case 'LOW':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const getAssignedUserNames = (assignedUserIds: string[] = []): string[] => {
    return assignedUserIds.map(userId => {
      const user = users.find(u => u.id === userId)
      return user ? user.fullName : 'Usuário não encontrado'
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tarefas</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie suas tarefas e acompanhe o progresso
          </p>
        </div>
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Tarefa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Tarefa</DialogTitle>
              <DialogDescription>
                Preencha os detalhes da nova tarefa abaixo.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  placeholder="Digite o título da tarefa"
                  {...register('title')}
                  className={errors.title ? 'border-destructive' : ''}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  placeholder="Descrição opcional"
                  {...register('description')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prioridade</Label>
                  <Select onValueChange={(value) => setValue('priority', value as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT')} defaultValue="MEDIUM">
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Baixa</SelectItem>
                      <SelectItem value="MEDIUM">Média</SelectItem>
                      <SelectItem value="HIGH">Alta</SelectItem>
                      <SelectItem value="URGENT">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select onValueChange={(value) => setValue('status', value as 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE')} defaultValue="TODO">
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TODO">Pendente</SelectItem>
                      <SelectItem value="IN_PROGRESS">Em Progresso</SelectItem>
                      <SelectItem value="REVIEW">Em Revisão</SelectItem>
                      <SelectItem value="DONE">Concluída</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">Data de Vencimento</Label>
                <Input
                  id="deadline"
                  type="date"
                  {...register('deadline')}
                />
              </div>

              <div className="space-y-2">
                <Label>Atribuir a Usuários</Label>
                <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-2">
                  {usersLoading ? (
                    <p className="text-sm text-muted-foreground">Carregando usuários...</p>
                  ) : users.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum usuário encontrado</p>
                  ) : (
                    users.map((user) => (
                      <div key={user.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`create-${user.id}`}
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleUserToggle(user.id)}
                          className="h-4 w-4 rounded border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        />
                        <label
                          htmlFor={`create-${user.id}`}
                          className="text-sm font-medium leading-none cursor-pointer"
                        >
                          {user.fullName} ({user.username})
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createTaskMutation.isPending}>
                  {createTaskMutation.isPending ? 'Criando...' : 'Criar Tarefa'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar tarefas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Todos os Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="TODO">Pendente</SelectItem>
                  <SelectItem value="IN_PROGRESS">Em Progresso</SelectItem>
                  <SelectItem value="REVIEW">Em Revisão</SelectItem>
                  <SelectItem value="DONE">Concluída</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Todas as Prioridades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Prioridades</SelectItem>
                  <SelectItem value="LOW">Baixa</SelectItem>
                  <SelectItem value="MEDIUM">Média</SelectItem>
                  <SelectItem value="HIGH">Alta</SelectItem>
                  <SelectItem value="URGENT">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>



      {/* Lista de Tarefas */}
      {tasksLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredTasks.length > 0 ? (
        <div className="grid gap-4">
          {filteredTasks.map((task) => (
            <Card key={task.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Link 
                        to="/task/$taskId" 
                        params={{ taskId: task.id }}
                        className="hover:underline"
                      >
                        <h3 className="font-semibold text-lg">{task.title}</h3>
                      </Link>
                      <Badge variant={getStatusVariant(task.status)}>
                        {getStatusText(task.status)}
                      </Badge>
                      <Badge variant={getPriorityVariant(task.priority)}>
                        {getPriorityText(task.priority)}
                      </Badge>
                    </div>
                    
                    {task.description && (
                      <p className="text-muted-foreground mb-3">{task.description}</p>
                    )}
                    
                    {task.assignedTo && task.assignedTo.length > 0 && (
                      <div className="mb-3">
                        <span className="text-sm font-medium text-muted-foreground">Atribuído a: </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {getAssignedUserNames(task.assignedTo).map((userName, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {userName}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Criada em {new Date(task.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                      {task.deadline && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Vence em {new Date(task.deadline).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEditTask(task)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteTask(task.id)}
                      disabled={deleteTaskMutation.isPending}
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
              <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma tarefa encontrada</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                  ? 'Tente ajustar os filtros para encontrar suas tarefas.'
                  : 'Comece criando sua primeira tarefa.'}
              </p>
              {!searchTerm && statusFilter === 'all' && priorityFilter === 'all' && (
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar primeira tarefa
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <EditTaskModal
        task={editingTask}
        open={showEditModal}
        onOpenChange={setShowEditModal}
      />
    </div>
  )
}

export const Route = createFileRoute('/tasks')({
  component: TasksPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      status: (search.status as string) || undefined,
    }
  },
})