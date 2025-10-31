import { useQuery } from '@tanstack/react-query';
import { taskHistoryService } from '@/lib/api';

export const useTaskHistory = (taskId: string) => {
  return useQuery({
    queryKey: ['taskHistory', taskId],
    queryFn: () => taskHistoryService.getTaskHistory(taskId),
    enabled: !!taskId,
    staleTime: 1000 * 60 * 5, // 5 min
  });
};
