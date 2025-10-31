# Task Flow System

Sistema de Gestão de Tarefas Colaborativo construído com arquitetura de microsserviços, utilizando NestJS, React, PostgreSQL e comunicação em tempo real via WebSockets.

## 🏗️ Arquitetura

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway    │    │  Task Service   │
│   (React/Vite)  │◄──►│   (NestJS)       │◄──►│   (NestJS)      │
│   Port: 5173    │    │   Port: 3000     │    │   Port: 3001    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                │                        │
                       ┌────────▼────────┐              │
                       │ Notification    │              │
                       │ Service         │              │
                       │ (NestJS)        │              │
                       │ Port: 3002      │              │
                       └─────────────────┘              │
                                │                        │
                                │                        │
        ┌───────────────────────┼────────────────────────┼───────────────┐
        │                       │                        │               │
        ▼                       ▼                        ▼               ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ PostgreSQL  │    │  RabbitMQ   │    │    Redis    │    │  WebSocket  │
│ Port: 5432  │    │ Port: 5672  │    │ Port: 6380  │    │ Real-time   │
│ (Database)  │    │ (Message    │    │ (Cache)     │    │ Updates     │
│             │    │  Broker)    │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### Componentes da Arquitetura

- **API Gateway**: Ponto de entrada único, gerencia autenticação JWT e roteamento
- **Task Service**: Gerenciamento de tarefas, projetos e colaboração
- **Notification Service**: Sistema de notificações em tempo real via WebSocket
- **Frontend**: Interface React com TanStack Query para gerenciamento de estado
- **PostgreSQL**: Banco de dados principal com TypeORM
- **RabbitMQ**: Message broker para comunicação assíncrona entre serviços
- **Redis**: Cache e sessões para melhor performance

## 🛠️ Decisões Técnicas e Trade-offs

### Tecnologias Escolhidas

| Tecnologia | Justificativa | Trade-offs |
|------------|---------------|------------|
| **NestJS** | Framework robusto com decorators, DI nativo, excelente para microsserviços | Curva de aprendizado mais alta, overhead para projetos simples |
| **React + Vite** | Desenvolvimento rápido, HMR eficiente, ecossistema maduro | Bundle size maior comparado a alternativas como Svelte |
| **PostgreSQL** | ACID compliance, JSON support, performance para queries complexas | Mais pesado que NoSQL para casos simples |
| **RabbitMQ** | Confiabilidade, persistência de mensagens, padrões de messaging | Complexidade adicional vs comunicação HTTP direta |
| **TypeORM** | Type safety, migrations automáticas, Active Record pattern | Performance inferior ao Prisma em alguns cenários |
| **TanStack Query** | Cache inteligente, sincronização automática, otimistic updates | Complexidade adicional para estados simples |

### Padrões Arquiteturais

- **Microsserviços**: Escalabilidade independente vs complexidade de deployment
- **API Gateway Pattern**: Ponto único de entrada vs single point of failure
- **Event-Driven Architecture**: Desacoplamento vs eventual consistency
- **Repository Pattern**: Abstração de dados vs overhead de código

## ✅ Funcionalidades Implementadas

### Autenticação & Segurança
- ✅ JWT com accessToken (15min) e refreshToken (7 dias)
- ✅ Rate limiting configurado (10 req/seg)
- ✅ Hash de senha com bcrypt
- ✅ Logout individual e logout de todos os dispositivos
- ✅ **Refresh token automático** no frontend com interceptor Axios
- ✅ **Tokens persistidos** em localStorage com renovação transparente

### Gestão de Tarefas
- ✅ CRUD completo de tarefas
- ✅ Status: TODO, IN_PROGRESS, REVIEW, DONE
- ✅ Prioridade: LOW, MEDIUM, HIGH, URGENT
- ✅ Atribuição múltipla de usuários (array)
- ✅ Histórico de alterações (audit log)
- ✅ Comentários com paginação

### Notificações & Tempo Real
- ✅ WebSocket para atualizações em tempo real
- ✅ Eventos: task_created, task_updated, task_comment_created
- ✅ Sistema de notificações persistente
- ✅ **Contador de notificações** no header
- ✅ **Interface responsiva** com mobile menu

### Interface do Usuário
- ✅ **Design moderno** com shadcn/ui e Tailwind CSS
- ✅ **Layout responsivo** funcionando em desktop e mobile
- ✅ **Skeleton loaders** para estados de carregamento
- ✅ **Toast notifications** para feedback ao usuário
- ✅ **Formulários validados** com react-hook-form + zod
- ✅ **Navegação intuitiva** com TanStack Router

### Monitoramento & Logs
- ✅ Health checks em todos os serviços (`/health`, `/health/ready`, `/health/live`)
- ✅ Logging estruturado com Winston
- ✅ Middleware para logging HTTP

### Banco de Dados
- ✅ TypeORM
- ✅ PostgreSQL com relacionamentos e índices

### API & Documentação
- ✅ Swagger/OpenAPI completo em `/api/docs`
- ✅ Paginação implementada em endpoints de listagem
- ✅ Respostas padronizadas com ApiResponseDto

## ⚠️ Problemas Conhecidos e Melhorias

### Problemas Identificados

1. **Performance**: Queries podem ser otimizadas com cache Redis (já configurado, mas não implementado nas queries)
2. **Testes**: Testes unitários existem mas não cobrem todos os cenários

### Melhorias Propostas

#### Curto Prazo
- [ ] Implementar cache Redis para queries frequentes de tarefas
- [ ] Adicionar mais testes unitários e de integração
- [ ] Implementar métricas com Prometheus
- [ ] Adicionar reset de senha via e-mail

#### Médio Prazo
- [ ] Implementar Circuit Breaker pattern para comunicação entre serviços
- [ ] Configurar CI/CD com GitHub Actions
- [ ] Implementar observabilidade com OpenTelemetry
- [ ] Adicionar dashboard administrativo

#### Longo Prazo
- [ ] Migrar para Kubernetes
- [ ] Implementar Event Sourcing para auditoria completa
- [ ] Adicionar multi-tenancy
- [ ] Implementar análise de dados e relatórios

## ⏱️ Tempo Gasto por Componente

| Componente | Tempo Estimado | Principais Atividades |
|------------|----------------|----------------------|
| **Setup Inicial** | 6h | Docker, estrutura monorepo, configurações base, ambiente dev |
| **API Gateway** | 12h | Autenticação JWT com refresh tokens, roteamento, middlewares, rate limiting, Swagger, health checks |
| **Task Service** | 10h | CRUD tarefas, relacionamentos, validações, atribuição múltipla, histórico, migrações |
| **Notification Service** | 10h | WebSocket setup, event handling, real-time, RabbitMQ integration, persistência |
| **Frontend** | 15h | Components shadcn/ui, routing TanStack, auth context, TanStack Query, forms, skeletons, toasts |
| **Integração** | 8h | Comunicação entre serviços, debugging, eventos RabbitMQ, WebSocket events |
| **Debugging & Fixes** | 6h | Correção de bugs, ajustes de configuração, refresh token implementation, UI fixes |
| **Documentação** | 3h | README detalhado, comentários, diagramas ASCII, documentação técnica |
| **Total** | **70h** | |

## 🚀 Instruções de Execução

### Pré-requisitos

- Node.js >= 22.0.0
- Docker & Docker Compose
- pnpm >= 9.0.0

### Configuração Inicial

1. **Clone o repositório**
   ```bash
   git clone <repository-url>
   cd task-flow-system
   ```

2. **Instale as dependências**
   ```bash
   pnpm install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   # Copie os arquivos de exemplo
   cp .env.example .env
   cp apps/web/.env.example apps/web/.env
   cp apps/api-gateway/.env.example apps/api-gateway/.env
   ```

4. **Inicie os serviços com Docker**
   ```bash
   # Sobe todos os containers (banco, rabbitmq, redis, serviços)
   pnpm docker:up
   
   # Aguarde todos os serviços iniciarem (aproximadamente 2-3 minutos)
   # Os bancos de dados são criados automaticamente
   ```

5. **Inicie o frontend em modo de desenvolvimento**
   ```bash
   # Em um novo terminal, após os containers estarem rodando
   cd apps/web
   pnpm dev
   ```

### Acessos

- **Frontend**: http://localhost:5173
- **API Gateway**: http://localhost:3000
  - Health Check: http://localhost:3000/health
  - Swagger Docs: http://localhost:3000/api/docs
- **Task Service**: http://localhost:3001
  - Health Check: http://localhost:3001/health
- **Notification Service**: http://localhost:3002
  - Health Check: http://localhost:3002/health
- **RabbitMQ Management**: http://localhost:15672 (user: taskflow, pass: taskflow123)
- **PostgreSQL**: localhost:5434 (user: taskflow, pass: taskflow123, db: taskflow)

### Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev              # Inicia todos os serviços em modo dev (requer containers rodando)
pnpm build            # Build de produção de todos os serviços
pnpm lint             # Linting de código em todos os projetos
pnpm test             # Executa testes em todos os projetos
pnpm clean            # Limpa builds e caches

# Docker
pnpm docker:up        # Sobe todos os containers com docker-compose
pnpm docker:down      # Para e remove todos os containers
pnpm docker:logs      # Visualiza logs dos containers em tempo real

# Comandos individuais (se necessário)
cd apps/api-gateway && pnpm dev          # Inicia apenas o API Gateway
cd apps/task-service && pnpm dev         # Inicia apenas o Task Service  
cd apps/notification-service && pnpm dev # Inicia apenas o Notification Service
cd apps/web && pnpm dev                  # Inicia apenas o Frontend
```

### Estrutura de Pastas

```
task-flow-system/
├── apps/
│   ├── api-gateway/          # Gateway principal
│   ├── task-service/         # Serviço de tarefas
│   ├── notification-service/ # Serviço de notificações
│   └── web/                  # Frontend React
├── packages/
│   └── shared/               # Código compartilhado
├── docker-compose.yml        # Orquestração de containers
└── turbo.json               # Configuração do monorepo
```

## 🧪 Testes

### Endpoints Principais

```bash
# Registro de usuário
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "MyStr0ngP@ssw0rd123!",
    "fullName": "Test User"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test@example.com",
    "password": "MyStr0ngP@ssw0rd123!"
  }'

# Listar notificações (com token)
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/notifications
```

## 📝 Notas de Desenvolvimento

- **Monorepo**: Utiliza Turbo para build e desenvolvimento eficiente
- **Type Safety**: TypeScript em todo o stack
- **Hot Reload**: Configurado para desenvolvimento rápido
- **Docker**: Ambiente consistente entre desenvolvimento e produção
- **Migrations**: Automáticas via TypeORM
- **Real-time**: WebSocket para atualizações instantâneas

---