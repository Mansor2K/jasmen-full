import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getBuildingDetails, 
  assignUserToBuilding, 
  unassignUserFromBuilding,
  addUserToBuilding,
  getUnassignedUsers 
} from "../../services/apiBuildings";

export function useBuildingDetails(id) {
  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["buildingDetails", id],
    queryFn: () => getBuildingDetails(id),
    enabled: !!id,
  });

  return {
    building: data,
    isLoading,
    error,
  };
}

export function useAssignUserToBuilding() {
  const queryClient = useQueryClient();

  const { mutate: assignUser, isPending: isAssigning } = useMutation({
    mutationFn: assignUserToBuilding,
    onSuccess: (data) => {
      // Invalidate building details and buildings list
      queryClient.invalidateQueries({
        queryKey: ["buildingDetails"],
      });
      queryClient.invalidateQueries({
        queryKey: ["buildings"],
      });
      queryClient.invalidateQueries({
        queryKey: ["unassignedUsers"],
      });
    },
  });

  return {
    assignUser,
    isAssigning,
  };
}

export function useUnassignUserFromBuilding() {
  const queryClient = useQueryClient();

  const { mutate: unassignUser, isPending: isUnassigning } = useMutation({
    mutationFn: unassignUserFromBuilding,
    onSuccess: (data) => {
      // Invalidate building details and buildings list
      queryClient.invalidateQueries({
        queryKey: ["buildingDetails"],
      });
      queryClient.invalidateQueries({
        queryKey: ["buildings"],
      });
      queryClient.invalidateQueries({
        queryKey: ["unassignedUsers"],
      });
    },
  });

  return {
    unassignUser,
    isUnassigning,
  };
}

export function useAddUserToBuilding() {
  const queryClient = useQueryClient();

  const { mutate: addUser, isPending: isAdding } = useMutation({
    mutationFn: addUserToBuilding,
    onSuccess: (data) => {
      // Invalidate building details and buildings list
      queryClient.invalidateQueries({
        queryKey: ["buildingDetails"],
      });
      queryClient.invalidateQueries({
        queryKey: ["buildings"],
      });
      queryClient.invalidateQueries({
        queryKey: ["unassignedUsers"],
      });
    },
  });

  return {
    addUser,
    isAdding,
  };
}

export function useUnassignedUsers(page = 1, limit = 10) {
  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["unassignedUsers", page, limit],
    queryFn: () => getUnassignedUsers(page, limit),
  });

  return {
    users: data?.users || [],
    totalPages: data?.totalPages || 0,
    totalUnassignedUsers: data?.totalUnassignedUsers || 0,
    currentPage: data?.currentPage || 1,
    isLoading,
    error,
  };
}
