import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { getUsers } from "../../services/apiUsers";

export function useUsers() {
  const [searchParams] = useSearchParams();

  const page = !searchParams.get("page") ? 1 : Number(searchParams.get("page"));

  const {
    isPending: isLoading,
    data: usersData,
    error,
  } = useQuery({
    queryKey: ["UsersData", page],
    queryFn: () => getUsers(page),
    keepPreviousData: true,
  });

  return {
    isLoading,
    users: usersData?.users,
    totalPages: usersData?.totalPages,
    currentPage: usersData?.currentPage,
    count: usersData?.totalUsers,
    error,
  };
}
