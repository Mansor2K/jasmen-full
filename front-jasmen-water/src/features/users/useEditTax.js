import { useMutation, useQueryClient } from "@tanstack/react-query";
import { editTax } from "../../services/apiUsers";

export function useEditTax() {
  const queryClient = useQueryClient();

  const { mutate: updateUserTax, isPending: isUpdating } = useMutation({
    mutationFn: editTax,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["UsersData"] });
      queryClient.invalidateQueries({ queryKey: ["userInfo"] });
    },
  });

  return { isUpdating, updateUserTax };
}
