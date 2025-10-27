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
│ Port: 5434  │    │ Port: 5672  │    │ Port: 6380  │    │ Real-time   │
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

## ⚠️ Problemas Conhecidos e Melhorias

### Problemas Identificados

1. **Lentidão no Task Service**: Queries lentas na criação de tarefas `/api/tasks`

### Melhorias Propostas

#### Curto Prazo
- [ ] Implementar health checks para todos os serviços
- [ ] Adicionar rate limiting no API Gateway
- [ ] Adicionar métricas com Prometheus

#### Médio Prazo
- [ ] Implementar Circuit Breaker pattern
- [ ] Adicionar cache Redis para queries frequentes
- [ ] Configurar CI/CD com GitHub Actions
- [ ] Implementar observabilidade com OpenTelemetry

#### Longo Prazo
- [ ] Migrar para Kubernetes
- [ ] Implementar Event Sourcing para auditoria
- [ ] Adicionar multi-tenancy

## ⏱️ Tempo Gasto por Componente

| Componente | Tempo Estimado | Principais Atividades |
|------------|----------------|----------------------|
| **Setup Inicial** | 2h | Docker, estrutura monorepo, configurações base |
| **API Gateway** | 4h | Autenticação JWT, roteamento, middlewares |
| **Task Service** | 3h | CRUD tarefas, relacionamentos, validações |
| **Notification Service** | 3h | WebSocket setup, event handling, real-time |
| **Frontend** | 5h | Components, routing, state management, UI |
| **Integração** | 3h | Comunicação entre serviços, debugging |
| **Debugging & Fixes** | 4h | Correção de bugs, ajustes de configuração |
| **Documentação** | 1h | README, comentários, diagramas |
| **Total** | **25h** | |

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

4. **Inicie os serviços**
   ```bash
   # Subir toda a infraestrutura
   pnpm docker:up
   
   # Verificar logs
   pnpm docker:logs
   ```

### Acessos

- **Frontend**: http://localhost:5173
- **API Gateway**: http://localhost:3000
- **Task Service**: http://localhost:3001
- **Notification Service**: http://localhost:3002
- **RabbitMQ Management**: http://localhost:15672 (user: taskflow, pass: taskflow123)
- **PostgreSQL**: localhost:5434 (user: taskflow, pass: taskflow123, db: taskflow)

### Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev              # Inicia todos os serviços em modo dev
pnpm build            # Build de produção
pnpm lint             # Linting de código
pnpm test             # Executa testes

# Docker
pnpm docker:up        # Sobe containers
pnpm docker:down      # Para containers
pnpm docker:logs      # Visualiza logs
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