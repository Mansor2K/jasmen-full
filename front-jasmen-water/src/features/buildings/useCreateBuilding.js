import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBuilding } from "../../services/apiBuildings";

export function useCreateBuilding() {
  const queryClient = useQueryClient();

  const { mutate: createBuildingMutation, isPending: isCreating } = useMutation({
    mutationFn: createBuilding,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["buildings"],
      });
    },
  });

  return {
    createBuilding: createBuildingMutation,
    isCreating,
  };
}
