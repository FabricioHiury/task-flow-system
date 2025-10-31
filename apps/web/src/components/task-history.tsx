import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useTaskHistory } from '@/hooks/useTaskHistory';
import { getHistoryChangeTypeDisplay, getHistoryChangeTypeIcon } from '@/lib/api';
import { Clock, User } from 'lucide-react';
import { TaskHistorySkeleton } from '@/components/skeletons/task-history-skeleton';

interface TaskHistoryProps {
  taskId: string;
}

// Funções para formatar os valores do histórico
const formatHistoryValue = (key: string, value: any): string => {
  if (value === null || value === undefined || value === '') {
    return 'N/A';
  }

  switch (key) {
    case 'status':
      switch (value) {
        case 'TODO': return 'Pendente';
        case 'IN_PROGRESS': return 'Em Progresso';
        case 'REVIEW': return 'Em Revisão';
        case 'DONE': return 'Concluída';
        default: return value;
      }
    
    case 'priority':
      switch (value) {
        case 'LOW': return 'Baixa';
        case 'MEDIUM': return 'Média';
        case 'HIGH': return 'Alta';
        case 'URGENT': return 'Urgente';
        default: return value;
      }
    
    case 'deadline':
      if (typeof value === 'string') {
        try {
          const date = new Date(value);
          return date.toLocaleDateString('pt-BR');
        } catch {
          return value;
        }
      }
      return value;
    
    case 'assignedTo':
      if (Array.isArray(value)) {
        return value.length > 0 ? `${value.length} usuários` : 'Ninguém';
      }
      return value || 'Ninguém';
    
    default:
      return String(value);
  }
};

const formatHistoryKey = (key: string): string => {
  switch (key) {
    case 'status': return 'Status';
    case 'priority': return 'Prioridade';
    case 'deadline': return 'Prazo';
    case 'assignedTo': return 'Atribuído para';
    case 'title': return 'Título';
    case 'description': return 'Descrição';
    default:
      return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  }
};

export function TaskHistory({ taskId }: TaskHistoryProps) {
  const { data: history, isLoading } = useTaskHistory(taskId);

  if (isLoading) {
    return <TaskHistorySkeleton />;
  }

  if (!history || history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Histórico da Tarefa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma alteração registrada</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Histórico da Tarefa</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {history.map((item, index) => (
            <div key={item.id}>
              <div className="flex items-start space-x-3">
                <div className="text-xl mt-1">
                  {getHistoryChangeTypeIcon(item.changeType)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">
                      {getHistoryChangeTypeDisplay(item.changeType)}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.createdAt).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  
                  <div className="flex items-center mt-2 text-xs text-muted-foreground">
                    <User className="h-3 w-3 mr-1" />
                    Por: {item.user?.fullName || item.user?.username || item.changedBy}
                  </div>

                  {/* Exibir mudanças específicas */}
                  {item.previousValues && item.newValues && (
                    <div className="mt-3 p-3 bg-muted/30 rounded-md">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        {Object.entries(item.previousValues).map(([key, value]) => {
                          const newValue = item.newValues?.[key];
                          if (value !== newValue) {
                            return (
                              <div key={key} className="space-y-1">
                                <span className="font-medium">
                                  {formatHistoryKey(key)}:
                                </span>
                                <div className="flex items-center space-x-2">
                                  <span className="text-red-600 line-through">
                                    {formatHistoryValue(key, value)}
                                  </span>
                                  <span className="text-muted-foreground">→</span>
                                  <span className="text-green-600">
                                    {formatHistoryValue(key, newValue)}
                                  </span>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {index < history.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
