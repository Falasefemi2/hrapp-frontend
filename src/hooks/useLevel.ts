/** @format */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createLevel,
  getLevelById,
  getLevels,
  updateLevel,
  deleteLevel,
  type LevelResponse,
  type Level,
} from "@/api/level";

export const levelKeys = {
  all: ["levels"] as const,
  lists: () => [...levelKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) =>
    [...levelKeys.lists(), filters] as const,
  details: () => [...levelKeys.all, "detail"] as const,
  detail: (id: string) => [...levelKeys.details(), id] as const,
};

export const useGetLevels = () => {
  return useQuery<Level[], Error>({
    queryKey: levelKeys.lists(),
    queryFn: getLevels,
  });
};

export const useGetLevel = (id: string, enabled = true) => {
  return useQuery<LevelResponse, Error>({
    queryKey: levelKeys.detail(id),
    queryFn: () => getLevelById(id),
    enabled: !!id && enabled,
  });
};

export const useCreateLevel = () => {
  const queryClient = useQueryClient();

  return useMutation<LevelResponse, Error, Level>({
    mutationFn: createLevel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: levelKeys.lists() });
    },
    onError: (error) => {
      console.error("Create level failed:", error.message);
    },
  });
};

export const useUpdateLevel = () => {
  const queryClient = useQueryClient();

  return useMutation<
    LevelResponse,
    Error,
    { id: string; payload: Partial<Level> }
  >({
    mutationFn: ({ id, payload }) => updateLevel(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: levelKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: levelKeys.detail(variables.id),
      });
    },
    onError: (error) => {
      console.error("Update level failed:", error.message);
    },
  });
};

export const useDeleteLevel = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deleteLevel,
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: levelKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: levelKeys.lists() });
    },
    onError: (error) => {
      console.error("Delete level failed:", error.message);
    },
  });
};
