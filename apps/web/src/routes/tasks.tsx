import { createFileRoute, Navigate, Link } from '@tanstack/react-router'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  CheckSquare, 
  Clock, 
  AlertCircle, 
  Plus, 
  Search,
  Filter,
  Edit,
  Trash2,
  Calendar
} from 'lucide-react'
import { useTasks, useCreateTask, useDeleteTask } from '@/hooks/useTasks'

const createTaskSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
  dueDate: z.string().optional(),
})

type CreateTaskForm = z.infer<typeof createTaskSchema>

function TasksPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [showCreateForm, setShowCreateForm] = useState(false)

  const { data: tasks, isLoading: tasksLoading } = useTasks()
  const createTaskMutation = useCreateTask()
  const deleteTaskMutation = useDeleteTask()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTaskForm>({
    resolver: zodResolver(createTaskSchema),
  })

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

  const filteredTasks = tasks?.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesPriority
  }) || []

  const onSubmit = (data: CreateTaskForm) => {
    createTaskMutation.mutate(data, {
      onSuccess: () => {
        setShowCreateForm(false)
        reset()
      }
    })
  }

  const handleDeleteTask = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
      deleteTaskMutation.mutate(id)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DONE':
        return 'bg-green-100 text-green-800'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-orange-100 text-orange-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'DONE':
        return 'Concluída'
      case 'IN_PROGRESS':
        return 'Em Progresso'
      default:
        return 'Pendente'
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'Alta'
      case 'MEDIUM':
        return 'Média'
      default:
        return 'Baixa'
    }
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
                  <Select onValueChange={(value) => register('priority').onChange({ target: { value } })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Baixa</SelectItem>
                      <SelectItem value="MEDIUM">Média</SelectItem>
                      <SelectItem value="HIGH">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select onValueChange={(value) => register('status').onChange({ target: { value } })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TODO">Pendente</SelectItem>
                      <SelectItem value="IN_PROGRESS">Em Progresso</SelectItem>
                      <SelectItem value="DONE">Concluída</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Data de Vencimento</Label>
                <Input
                  id="dueDate"
                  type="date"
                  {...register('dueDate')}
                />
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
                      <Badge variant={task.status === 'DONE' ? 'default' : task.status === 'IN_PROGRESS' ? 'secondary' : 'outline'}>
                        {getStatusText(task.status)}
                      </Badge>
                      <Badge variant={task.priority === 'HIGH' ? 'destructive' : task.priority === 'MEDIUM' ? 'default' : 'secondary'}>
                        {getPriorityText(task.priority)}
                      </Badge>
                    </div>
                    
                    {task.description && (
                      <p className="text-muted-foreground mb-3">{task.description}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Criada em {new Date(task.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                      {task.dueDate && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Vence em {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button size="sm" variant="outline">
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
    </div>
  )
}

export const Route = createFileRoute('/tasks')({
  component: TasksPage,
})