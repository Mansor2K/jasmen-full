import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "../../services/apiAuth";
import { jwtDecode } from "jwt-decode";

export function useUser() {
  const {
    data: user,
    isPending: isLoading,
    error,
  } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const token = localStorage.getItem("WATER_USER_TOKEN");
      if (!token) {
        return null;
      }
      const decoded = jwtDecode(token);
      const userData = await getCurrentUser();
      return {
        ...userData,
        token,
        type: decoded?.isAdmin,
        id: decoded?._id,
      };
    },
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: user?.role === "authenticated",
    type: user?.type,
    id: user?.id,
    error,
  };
}
