import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addTax as addTaxApi } from "../../services/apiUsers";

export function useAddTax() {
  const queryClient = useQueryClient();

  const {
    mutate: addTax,
    isPending: isLoading,
    error,
  } = useMutation({
    mutationFn: addTaxApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["UsersData"] });
      queryClient.invalidateQueries({ queryKey: ["userInfo"] });
    },
  });

  return { isLoading, addTax, error };
}
