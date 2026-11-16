import { useLastFiveUsersAdded } from "./useLastFiveUsersAdded";
import { useTranslation } from "react-i18next";
import { FaUsers } from "react-icons/fa6";
import { FaMoneyBillWave } from "react-icons/fa";
import { Link } from "react-router-dom";

import Stat from "./Stat";
import Empty from "../../ui/Empty";
import MiniSpinner from "../../ui/miniSpinner/MiniSpinner";
import Button from "../../ui/Button";
import { baseURL } from "../../services/axios";
import axios from "axios";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

function Status() {
  const [t] = useTranslation();
  const { isLoading, userCount, totalMoney, error } = useLastFiveUsersAdded();

  const token = localStorage.getItem("WATER_USER_TOKEN");
  const queryClient = useQueryClient();


  const resetTotalMoney = async () => {
    const response = await axios.delete(`${baseURL}user/v1/ResetAllMoneyGained`, {
      headers: {
        access_token: token,
      },
    });
    if (response.data?.success) {
      toast.success(t("users.resetTotalMoneySuccess"));
      queryClient.invalidateQueries({ queryKey: ["LastFiveUsersAdded"] });
    } else {
      toast.error(t("users.resetTotalMoneyFailed"));
    }
  };


  if (error) return <Empty message={t("general.failedToGetData")} />;

  return (
    <div className="flex flex-col gap-[20px]">

      {/* Stats Grid */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(270px,1fr))] gap-[10px]">
        {isLoading ? (
          <MiniSpinner />
        ) : (
          <Link to="/users">
            <Stat
              description="descriptions.allUsers"
              icon={<FaUsers className="text-xl" />}
              title="users.users"
              value={userCount || 0}
              color="#0000ff7a"
            />
          </Link>
        )}

        {isLoading ? (
          <MiniSpinner />
        ) : (
          <Link to="/usersStatistic">
            <Stat
              description="descriptions.allEarnings"
              icon={<FaMoneyBillWave className="text-xl" />}
              title="users.earnings"
              value={`${totalMoney || 0} ${t("general.EGP")}`}
              color="#00800087"
            />
          </Link>
        )}
      </div>
    </div>
  );
}

export default Status;
