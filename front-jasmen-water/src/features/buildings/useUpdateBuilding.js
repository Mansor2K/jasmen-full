import { useMutation, useQueryClient } from "@tanstack/react-query";
import { editBuilding } from "../../services/apiBuildings";

export function useUpdateBuilding() {
  const queryClient = useQueryClient();

  const { mutate: updateBuildingMutation, isPending: isUpdating } = useMutation({
    mutationFn: editBuilding,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["buildings"],
      });
    },
  });

  return {
    updateBuilding: updateBuildingMutation,
    isUpdating,
  };
}
