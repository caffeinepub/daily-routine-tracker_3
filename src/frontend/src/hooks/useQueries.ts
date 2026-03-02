import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { TaskDefinition, UserProfile } from "../backend.d";
import { useActor } from "./useActor";

export const TODAY = new Date().toISOString().split("T")[0];

export function getLast7Dates(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });
}

export function getLast30Dates(): string[] {
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split("T")[0];
  });
}

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTodayTasks() {
  const { actor, isFetching } = useActor();
  return useQuery<Array<[TaskDefinition, boolean]>>({
    queryKey: ["todayTasks", TODAY],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTodayTasks(TODAY);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllTaskDefinitions() {
  const { actor, isFetching } = useActor();
  return useQuery<TaskDefinition[]>({
    queryKey: ["taskDefinitions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTaskDefinitions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRandomQuote() {
  const { actor, isFetching } = useActor();
  return useQuery<string>({
    queryKey: ["randomQuote"],
    queryFn: async () => {
      if (!actor) return "";
      return actor.getRandomQuote();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

export function useAllTimeStats() {
  const { actor, isFetching } = useActor();
  return useQuery<{
    totalCoins: bigint;
    bestStreak: bigint;
    currentLevel: bigint;
    totalTasksCompleted: bigint;
    currentStreak: bigint;
  }>({
    queryKey: ["allTimeStats"],
    queryFn: async () => {
      if (!actor)
        return {
          totalCoins: 0n,
          bestStreak: 0n,
          currentLevel: 1n,
          totalTasksCompleted: 0n,
          currentStreak: 0n,
        };
      return actor.getAllTimeStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useWeeklyStats() {
  const { actor, isFetching } = useActor();
  const dates = getLast7Dates();
  return useQuery<Array<[string, bigint, bigint]>>({
    queryKey: ["weeklyStats", dates[0]],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getWeeklyStats(dates);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMonthlyStats() {
  const { actor, isFetching } = useActor();
  const dates = getLast30Dates();
  return useQuery<Array<[string, bigint, bigint]>>({
    queryKey: ["monthlyStats", dates[0]],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMonthlyStats(dates);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCustomCategories() {
  const { actor, isFetching } = useActor();
  return useQuery<string[]>({
    queryKey: ["customCategories"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCustomCategories();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMarkTaskComplete() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      taskId,
      date,
    }: {
      taskId: bigint;
      date: string;
    }) => {
      if (!actor) throw new Error("No actor");
      await actor.markTaskComplete(taskId, date);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["todayTasks"] });
      void queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      void queryClient.invalidateQueries({ queryKey: ["allTimeStats"] });
      void queryClient.invalidateQueries({ queryKey: ["weeklyStats"] });
    },
  });
}

export function useCreateTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      category,
      duration,
      coinReward,
    }: {
      name: string;
      category: string;
      duration: bigint | null;
      coinReward: bigint;
    }) => {
      if (!actor) throw new Error("No actor");
      const id = await actor.createTaskDefinition(name, category, duration);
      await actor.updateTaskDefinition(
        id,
        name,
        category,
        duration,
        coinReward,
      );
      return id;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["taskDefinitions"] });
      void queryClient.invalidateQueries({ queryKey: ["todayTasks"] });
    },
  });
}

export function useUpdateTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      taskId,
      name,
      category,
      duration,
      coinReward,
    }: {
      taskId: bigint;
      name: string;
      category: string;
      duration: bigint | null;
      coinReward: bigint;
    }) => {
      if (!actor) throw new Error("No actor");
      await actor.updateTaskDefinition(
        taskId,
        name,
        category,
        duration,
        coinReward,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["taskDefinitions"] });
      void queryClient.invalidateQueries({ queryKey: ["todayTasks"] });
    },
  });
}

export function useDeleteTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: bigint) => {
      if (!actor) throw new Error("No actor");
      await actor.deleteTaskDefinition(taskId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["taskDefinitions"] });
      void queryClient.invalidateQueries({ queryKey: ["todayTasks"] });
    },
  });
}

export function useAddCustomCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("No actor");
      await actor.addCustomCategory(name);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["customCategories"] });
    },
  });
}

export function useRemoveCustomCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("No actor");
      await actor.removeCustomCategory(name);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["customCategories"] });
    },
  });
}
