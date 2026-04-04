import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Episode, Show, UserProfile, UserRole } from "../backend";
import { useActor } from "./useActor";

export function useAllShows(publicOnly = true) {
  const { actor, isFetching } = useActor();
  return useQuery<Show[]>({
    queryKey: ["shows", publicOnly],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllShows(publicOnly);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useShow(showId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Show | null>({
    queryKey: ["show", showId?.toString()],
    queryFn: async () => {
      if (!actor || showId === null) return null;
      return actor.getShow(showId);
    },
    enabled: !!actor && !isFetching && showId !== null,
  });
}

export function useFeaturedShow() {
  const { actor, isFetching } = useActor();
  return useQuery<Show | null>({
    queryKey: ["featuredShow"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getFeaturedShow();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useEpisodesByShow(showId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Episode[]>({
    queryKey: ["episodes", showId?.toString()],
    queryFn: async () => {
      if (!actor || showId === null) return [];
      return actor.getEpisodesByShow(showId);
    },
    enabled: !!actor && !isFetching && showId !== null,
  });
}

export function useWatchlist() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint[]>({
    queryKey: ["watchlist"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getWatchlist();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSearchShows(term: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Show[]>({
    queryKey: ["search", term],
    queryFn: async () => {
      if (!actor || !term.trim()) return [];
      return actor.searchShows(term);
    },
    enabled: !!actor && !isFetching && !!term.trim(),
  });
}

export function useCallerUserProfile() {
  const { actor, isFetching } = useActor();
  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
  return {
    ...query,
    isLoading: isFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useCallerUserRole() {
  const { actor, isFetching } = useActor();
  return useQuery<UserRole>({
    queryKey: ["callerRole"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// Mutations
export function useAddToWatchlist() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (showId: bigint) => actor!.addToWatchlist(showId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["watchlist"] }),
  });
}

export function useRemoveFromWatchlist() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (showId: bigint) => actor!.removeFromWatchlist(showId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["watchlist"] }),
  });
}

export function useSaveUserProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (profile: UserProfile) => actor!.saveCallerUserProfile(profile),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["currentUserProfile"] }),
  });
}

export function useCreateShow() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      genre: string;
      thumbnailUrl: string;
      isPublic: boolean;
    }) =>
      actor!.createShow(
        data.title,
        data.description,
        data.genre,
        data.thumbnailUrl,
        data.isPublic,
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["shows"] }),
  });
}

export function useUpdateShow() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      title: string;
      description: string;
      genre: string;
      thumbnailUrl: string;
      isFeatured: boolean;
      isPublic: boolean;
    }) =>
      actor!.updateShow(
        data.id,
        data.title,
        data.description,
        data.genre,
        data.thumbnailUrl,
        data.isFeatured,
        data.isPublic,
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["shows"] }),
  });
}

export function useDeleteShow() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (showId: bigint) => actor!.deleteShow(showId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["shows"] }),
  });
}

export function useCreateEpisode() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      showId: bigint;
      seasonNumber: bigint;
      episodeNumber: bigint;
      title: string;
      description: string;
      videoUrl: string;
      thumbnailUrl: string;
      duration: bigint;
    }) =>
      actor!.createEpisode(
        data.showId,
        data.seasonNumber,
        data.episodeNumber,
        data.title,
        data.description,
        data.videoUrl,
        data.thumbnailUrl,
        data.duration,
      ),
    onSuccess: (_, vars) =>
      qc.invalidateQueries({ queryKey: ["episodes", vars.showId.toString()] }),
  });
}

export function useUpdateEpisode() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      showId: bigint;
      seasonNumber: bigint;
      episodeNumber: bigint;
      title: string;
      description: string;
      videoUrl: string;
      thumbnailUrl: string;
      duration: bigint;
    }) =>
      actor!.updateEpisode(
        data.id,
        data.seasonNumber,
        data.episodeNumber,
        data.title,
        data.description,
        data.videoUrl,
        data.thumbnailUrl,
        data.duration,
      ),
    onSuccess: (_, vars) =>
      qc.invalidateQueries({ queryKey: ["episodes", vars.showId.toString()] }),
  });
}

export function useDeleteEpisode() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { episodeId: bigint; showId: bigint }) =>
      actor!.deleteEpisode(data.episodeId),
    onSuccess: (_, vars) =>
      qc.invalidateQueries({ queryKey: ["episodes", vars.showId.toString()] }),
  });
}

export function useAllUsers() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["allUsers"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getAllUsers();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000,
  });
}

export function useStorageClient() {
  const { actor } = useActor();
  return actor ? { actor } : { actor: null };
}
