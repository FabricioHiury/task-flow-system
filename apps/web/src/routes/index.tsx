import { createFileRoute, Navigate } from '@tanstack/react-router'
import { useAuth } from '@/contexts/auth-context'
import { CheckSquare, Users, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function HomePage() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />
  }

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <div className="flex justify-center">
          <CheckSquare className="h-16 w-16 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Gerencie suas tarefas com
          <span className="text-primary"> TaskFlow</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Uma plataforma completa para gerenciamento de tarefas em equipe, 
          com notificações em tempo real e colaboração eficiente.
        </p>
        <div className="flex justify-center space-x-4">
          <Button size="lg" asChild>
            <a href="/register">Começar Agora</a>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <a href="/login">Fazer Login</a>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-3 gap-8">
        <Card>
          <CardHeader>
            <CheckSquare className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Gerenciamento de Tarefas</CardTitle>
            <CardDescription>
              Crie, organize e acompanhe suas tarefas com facilidade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Sistema completo de tarefas com status, prioridades, 
              datas de vencimento e atribuição para membros da equipe.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Bell className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Notificações em Tempo Real</CardTitle>
            <CardDescription>
              Receba atualizações instantâneas sobre suas tarefas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              WebSocket integrado para notificações em tempo real sobre 
              mudanças nas tarefas, comentários e prazos.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Users className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Colaboração em Equipe</CardTitle>
            <CardDescription>
              Trabalhe em conjunto com sua equipe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Atribua tarefas, adicione comentários e mantenha todos 
              da equipe sincronizados no progresso dos projetos.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* CTA Section */}
      <section className="text-center space-y-6 bg-muted/50 rounded-lg p-12">
        <h2 className="text-3xl font-bold">
          Pronto para aumentar sua produtividade?
        </h2>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Junte-se a milhares de equipes que já usam o TaskFlow para 
          gerenciar seus projetos de forma mais eficiente.
        </p>
        <Button size="lg" asChild>
          <a href="/register">Criar Conta Gratuita</a>
        </Button>
      </section>
    </div>
  )
}

export const Route = createFileRoute('/')({
  component: HomePage,
})