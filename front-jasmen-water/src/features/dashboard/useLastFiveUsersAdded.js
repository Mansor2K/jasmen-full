import { useQuery } from "@tanstack/react-query";
import { lastFiveUsersAdded as lastFiveUsersAddedApi } from "../../services/apiDashboard";

export function useLastFiveUsersAdded() {
  const {
    isPending: isLoading,
    data: lastFiveUsersAdded,
    error,
  } = useQuery({
    queryKey: ["LastFiveUsersAdded"],
    queryFn: lastFiveUsersAddedApi,
    keepPreviousData: true,
  });

  return {
    isLoading,
    totalMoney: lastFiveUsersAdded?.totalMoney,
    userCount: lastFiveUsersAdded?.userCount,
    lastUsers: lastFiveUsersAdded?.users,
    error,
  };
}
