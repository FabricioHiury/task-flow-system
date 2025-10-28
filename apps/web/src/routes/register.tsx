import { createFileRoute, Navigate } from '@tanstack/react-router'
import { useAuth } from '@/contexts/auth-context'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { CheckSquare, Eye, EyeOff } from 'lucide-react'
import { useRegister } from '@/hooks/useAuth'

const registerSchema = z.object({
  username: z.string().min(3, 'Username deve ter pelo menos 3 caracteres').max(50, 'Username deve ter no máximo 50 caracteres'),
  fullName: z.string().min(2, 'Nome completo deve ter pelo menos 2 caracteres').max(100, 'Nome completo deve ter no máximo 100 caracteres').optional(),
  email: z.string().email('Email inválido').max(255, 'Email deve ter no máximo 255 caracteres'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres').max(100, 'Senha deve ter no máximo 100 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
})

type RegisterForm = z.infer<typeof registerSchema>

function RegisterPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const registerMutation = useRegister()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

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

  const onSubmit = async (data: RegisterForm) => {
    registerMutation.mutate({
      username: data.username,
      email: data.email,
      password: data.password,
      fullName: data.fullName,
    })
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckSquare className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Criar Conta</CardTitle>
          <CardDescription>
            Crie sua conta para começar a usar o TaskFlow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Seu nome de usuário"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Seu nome completo"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="seu@email.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Sua senha"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirme sua senha"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {registerMutation.error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                  {(() => {
                    const error = registerMutation.error as any;
                    
                    // Se o erro tem detalhes de validação específicos
                    if (error?.response?.data?.error?.details) {
                      const details = error.response.data.error.details;
                      return (
                        <div className="space-y-1">
                          <div className="font-medium">Erro de validação:</div>
                          {details.map((detail: any, index: number) => (
                            <div key={index} className="text-xs">
                              • {detail.message}
                            </div>
                          ))}
                        </div>
                      );
                    }
                    
                    // Se tem uma mensagem de erro específica
                    if (error?.response?.data?.error?.message) {
                      return error.response.data.error.message;
                    }
                    
                    // Fallback para mensagem genérica
                    return error?.response?.data?.message || 'Erro ao criar conta';
                  })()}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? 'Criando conta...' : 'Criar Conta'}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Já tem uma conta?{' '}
              <a
                href="/login"
                className="font-medium text-primary hover:underline"
              >
                Faça login
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export const Route = createFileRoute('/register')({
  component: RegisterPage,
})