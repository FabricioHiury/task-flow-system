import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Calendar, Clock, Flag, MessageCircle, Send, Trash2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useTask } from '@/hooks/useTasks'
import { useComments, useCreateComment, useDeleteComment } from '@/hooks/useComments'
import { useAuth } from '@/contexts/auth-context'
import { toast } from '@/hooks/use-toast'
import { TaskSkeleton } from '@/components/skeletons/task-skeleton'
import { CommentListSkeleton } from '@/components/skeletons/comment-skeleton'

const commentSchema = z.object({
  content: z.string().min(1, 'Comentário não pode estar vazio').max(500, 'Comentário muito longo'),
})

type CommentForm = z.infer<typeof commentSchema>

export const Route = createFileRoute('/task/$taskId')({
  component: TaskDetailPage,
})

function TaskDetailPage() {
  const params = useParams({ strict: false }) as { taskId: string }
  const taskId = params.taskId
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const { data: task, isLoading: taskLoading } = useTask(taskId)
  const { data: comments = [], isLoading: commentsLoading } = useComments(taskId)
  const createCommentMutation = useCreateComment()
  const deleteCommentMutation = useDeleteComment()

  const form = useForm<CommentForm>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: '',
    },
  })

  const onSubmitComment = async (data: CommentForm) => {
    try {
      await createCommentMutation.mutateAsync({
        taskId: taskId,
        content: data.content,
      })
      form.reset()
      toast({
        title: 'Comentário adicionado',
        description: 'Seu comentário foi adicionado com sucesso.',
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o comentário.',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteCommentMutation.mutateAsync({ taskId, commentId })
      toast({
        title: 'Comentário removido',
        description: 'O comentário foi removido com sucesso.',
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o comentário.',
        variant: 'destructive',
      })
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'TODO':
        return 'A Fazer'
      case 'IN_PROGRESS':
        return 'Em Progresso'
      case 'DONE':
        return 'Concluída'
      default:
        return status
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return 'Baixa'
      case 'MEDIUM':
        return 'Média'
      case 'HIGH':
        return 'Alta'
      default:
        return priority
    }
  }

  if (taskLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <TaskSkeleton />
      </div>
    )
  }

  if (!task) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">Tarefa não encontrada</h3>
              <p className="text-muted-foreground mb-4">
                A tarefa que você está procurando não existe ou foi removida.
              </p>
              <Button onClick={() => navigate({ to: '/tasks', search: { status: undefined } })}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para Tarefas
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: '/tasks', search: { status: undefined } })}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">Detalhes da Tarefa</h1>
      </div>

      {/* Task Details */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-xl">{task.title}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant={task.status === 'DONE' ? 'default' : task.status === 'IN_PROGRESS' ? 'secondary' : 'outline'}>
                  {getStatusText(task.status)}
                </Badge>
                <Badge variant={task.priority === 'HIGH' ? 'destructive' : task.priority === 'MEDIUM' ? 'default' : 'secondary'}>
                  <Flag className="h-3 w-3 mr-1" />
                  {getPriorityText(task.priority)}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {task.description && (
            <div>
              <h4 className="font-semibold mb-2">Descrição</h4>
              <p className="text-muted-foreground">{task.description}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Criada em: {new Date(task.createdAt).toLocaleDateString('pt-BR')}</span>
            </div>
            {task.deadline && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Vence em: {new Date(task.deadline).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Comentários ({comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Comment Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitComment)} className="space-y-4">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Adicione um comentário..."
                          {...field}
                          disabled={createCommentMutation.isPending}
                        />
                        <Button
                          type="submit"
                          size="sm"
                          disabled={createCommentMutation.isPending || !field.value.trim()}
                        >
                          {createCommentMutation.isPending ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>

          <Separator />

          {/* Comments List */}
          {commentsLoading ? (
            <CommentListSkeleton />
          ) : comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{comment.username || comment.createdBy}</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleDateString('pt-BR')} às{' '}
                        {new Date(comment.createdAt).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    {user && comment.createdBy === user.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteComment(comment.id)}
                        disabled={deleteCommentMutation.isPending}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-sm">{comment.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Nenhum comentário ainda</p>
              <p className="text-sm text-muted-foreground">Seja o primeiro a comentar nesta tarefa</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}