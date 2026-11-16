import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTax as deleteTaxApi } from "../../services/apiUsers";

export function useDeleteTax() {
  const queryClient = useQueryClient();

  const { mutate: deleteTax, isPending: isDeleting } = useMutation({
    mutationFn: deleteTaxApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["UsersData"] });
      queryClient.invalidateQueries({ queryKey: ["userInfo"] });
    },
  });

  return { isDeleting, deleteTax };
}
