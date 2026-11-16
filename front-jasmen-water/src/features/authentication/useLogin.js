import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login as loginApi } from "../../services/apiAuth";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export function useLogin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate: login, isPending: isLoading } = useMutation({
    mutationFn: ({ email, password }) => loginApi({ email, password }),

    onSuccess: (user) => {
      const { user: userData, role } = user;
      const decodedToken = jwtDecode(userData?.token);

      localStorage.setItem("WATER_USER_TOKEN", userData?.token);
      queryClient.setQueryData(["user"], {
        ...userData,
        role,
        type: decodedToken?.isAdmin,
        id: decodedToken?._id,
      });

      navigate("/", { replace: true });
    },
  });

  return { login, isLoading };
}
