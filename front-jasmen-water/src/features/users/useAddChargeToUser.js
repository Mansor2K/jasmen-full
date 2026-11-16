import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addChargeToUser } from "../../services/apiUsers";

export function useAddChargeToUser() {
  const queryClient = useQueryClient();

  const {
    mutate: chargeUser,
    isPending: isCharging,
    error,
  } = useMutation({
    mutationFn: addChargeToUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["UsersData"] });
      queryClient.invalidateQueries({ queryKey: ["userInfo"] });
    },
  });

  return { isCharging, chargeUser, error };
}
