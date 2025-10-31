import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUnreadNotificationsCount } from "@/hooks/useNotifications";
import {
  CheckSquare,
  Bell,
  User,
  LogOut,
  Menu,
  Home,
  ListTodo,
  Users,
} from "lucide-react";
import { useState } from "react";

export function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const { data: unreadCount } = useUnreadNotificationsCount();

  if (!isAuthenticated) {
    return (
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">TaskFlow</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <a href="/login">Entrar</a>
            </Button>
            <Button asChild>
              <a href="/register">Criar Conta</a>
            </Button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <CheckSquare className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">TaskFlow</span>
        </div>

        {/* Navegação Desktop */}
        <nav className="hidden md:flex items-center gap-6">
          <a
            href="/dashboard"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <Home className="h-4 w-4" />
            Dashboard
          </a>
          <a
            href="/tasks"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ListTodo className="h-4 w-4" />
            Tarefas
          </a>
          <a
            href="/notifications"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <Bell className="h-4 w-4" />
            <span>Notificações</span>
            {unreadCount && unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shrink-0">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </a>
        </nav>

        {/* Menu do Usuário */}
        <div className="flex items-center gap-4">
          {/* Notificações Mobile */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" asChild>
              <a href="/notifications" className="relative">
                <Bell className="h-4 w-4" />
                {unreadCount && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </a>
            </Button>
          </div>

          {/* Menu Desktop do Usuário */}
          <div className="hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium">{user?.fullName}</p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a href="/users" className="flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    Usuários
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => await logout()}
                  className="text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Menu Mobile */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Menu Mobile Expandido */}
      {showMobileMenu && (
        <div className="md:hidden border-t bg-background">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {/* Informações do Usuário Mobile */}
            <div className="flex items-center gap-3 pb-4 border-b">
              <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{user?.fullName}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            {/* Navegação Mobile */}
            <nav className="space-y-2">
              <a
                href="/dashboard"
                className="flex items-center gap-3 p-2 rounded-md hover:bg-accent transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                <Home className="h-5 w-5" />
                Dashboard
              </a>
              <a
                href="/tasks"
                className="flex items-center gap-3 p-2 rounded-md hover:bg-accent transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                <ListTodo className="h-5 w-5" />
                Tarefas
              </a>
              <a
                href="/notifications"
                className="flex items-center gap-3 p-2 rounded-md hover:bg-accent transition-colors relative"
                onClick={() => setShowMobileMenu(false)}
              >
                <Bell className="h-5 w-5" />
                <span>Notificações</span>
                {unreadCount && unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </a>
            </nav>

            {/* Ações Mobile */}
            <div className="pt-4 border-t space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={async () => {
                  setShowMobileMenu(false);
                  await logout();
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
