import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteBuilding } from "../../services/apiBuildings";

export function useDeleteBuilding() {
  const queryClient = useQueryClient();

  const { mutate: deleteBuildingMutation, isPending: isDeleting } = useMutation({
    mutationFn: deleteBuilding,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["buildings"],
      });
    },
  });

  return {
    deleteBuilding: deleteBuildingMutation,
    isDeleting,
  };
}
