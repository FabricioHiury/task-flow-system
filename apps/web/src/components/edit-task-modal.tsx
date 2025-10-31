import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { useUpdateTask } from '@/hooks/useTasks'
import { useUsers } from '@/hooks/useUsers'
import { useToast } from '@/hooks/use-toast'
import type { Task } from '@/lib/api'

const editTaskSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  deadline: z.string().optional(),
  assignedUserIds: z.array(z.string()).optional(),
})

type EditTaskFormData = z.infer<typeof editTaskSchema>

interface EditTaskModalProps {
  task: Task | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditTaskModal({ task, open, onOpenChange }: EditTaskModalProps) {
  const { toast } = useToast()
  const { data: users = [], isLoading: usersLoading } = useUsers()
  const updateTaskMutation = useUpdateTask()

  const form = useForm<EditTaskFormData>({
    resolver: zodResolver(editTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'TODO',
      priority: 'LOW',
      deadline: '',
      assignedUserIds: [],
    },
  })

  useEffect(() => {
    if (task) {
      form.reset({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '',
        assignedUserIds: task.assignedTo || [],
      })
    }
  }, [task, form])

  const onSubmit = async (data: EditTaskFormData) => {
    if (!task) return

    try {
      await updateTaskMutation.mutateAsync({
        id: task.id,
        data: {
          title: data.title,
          description: data.description,
          status: data.status,
          priority: data.priority,
          deadline: data.deadline || undefined,
          assignedUserIds: data.assignedUserIds,
        },
      })

      toast({
        title: 'Sucesso',
        description: 'Tarefa atualizada com sucesso!',
      })

      onOpenChange(false)
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar tarefa. Tente novamente.',
        variant: 'destructive',
      })
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset()
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Tarefa</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o título da tarefa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Digite a descrição da tarefa (opcional)"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="TODO">Pendente</SelectItem>
                      <SelectItem value="IN_PROGRESS">Em Progresso</SelectItem>
                      <SelectItem value="REVIEW">Em Revisão</SelectItem>
                      <SelectItem value="DONE">Concluída</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prioridade</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a prioridade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="LOW">Baixa</SelectItem>
                      <SelectItem value="MEDIUM">Média</SelectItem>
                      <SelectItem value="HIGH">Alta</SelectItem>
                      <SelectItem value="URGENT">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Vencimento</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assignedUserIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Atribuir a Usuários</FormLabel>
                  <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-2">
                    {usersLoading ? (
                      <p className="text-sm text-muted-foreground">Carregando usuários...</p>
                    ) : users.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Nenhum usuário encontrado</p>
                    ) : (
                      users.map((user) => (
                        <div key={user.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={user.id}
                            checked={field.value?.includes(user.id) || false}
                            onCheckedChange={(checked) => {
                              const currentValue = field.value || []
                              if (checked) {
                                field.onChange([...currentValue, user.id])
                              } else {
                                field.onChange(currentValue.filter((id) => id !== user.id))
                              }
                            }}
                          />
                          <label
                            htmlFor={user.id}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {user.fullName} ({user.username})
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={updateTaskMutation.isPending}
              >
                {updateTaskMutation.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}