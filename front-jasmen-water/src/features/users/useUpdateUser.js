import { useMutation, useQueryClient } from "@tanstack/react-query";
import { editUser } from "../../services/apiUsers";

export function useUpdateUser() {
  const queryClient = useQueryClient();

  const { mutate: updateUser, isPending: isUpdating } = useMutation({
    mutationFn: editUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["UsersData"] });
      queryClient.invalidateQueries({ queryKey: ["userInfo"] });
    },
  });

  return { isUpdating, updateUser };
}
