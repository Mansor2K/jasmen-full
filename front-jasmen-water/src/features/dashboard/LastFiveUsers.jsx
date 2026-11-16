import { useTranslation } from "react-i18next";
import { useLastFiveUsersAdded } from "./useLastFiveUsersAdded";
import { Link } from "react-router-dom";
import Empty from "../../ui/Empty";
import Heading from "../../ui/Heading";
import MiniSpinner from "../../ui/miniSpinner/MiniSpinner";

import userImage from "/user-avatar.jpg";

function LastFiveUsers() {
  const [t] = useTranslation();
  const { isLoading, lastUsers, error } = useLastFiveUsersAdded();

  if (isLoading) return <MiniSpinner />;
  if (error) return <Empty message={t("general.failedToGetData")} />;
  if (!lastUsers?.length) return <Empty message={t("users.noUsers")} />;

  return (
    <>
      <Heading>{t("users.lastNewUsers")}</Heading>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-x-[20px] gap-y-[40px] rounded-md bg-secondary px-[15px] py-[25px]">
        {lastUsers?.map((user) => {
          const progressPercentage =
            user?.limit > 0
              ? Math.min((user?.consumption / user?.limit) * 100, 100)
              : 0;

          // Circle properties
          const radius = 40;
          const circumference = 2 * Math.PI * radius;
          const strokeDasharray = circumference;
          const strokeDashoffset =
            circumference - (progressPercentage / 100) * circumference;

          return (
            <Link
              title={t("descriptions.client")}
              to={`/user/${user?._id}`}
              key={user?._id}
              className="relative flex h-[70px] items-center justify-between rounded-md bg-primary p-[5px]"
            >
              <div className="relative flex h-[110px] w-[110px] items-center justify-center rounded-full bg-secondary">
                <svg
                  className="absolute h-[110px] w-[110px]"
                  aria-hidden="true"
                >
                  <circle
                    className="text-gray-300"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="55"
                    cy="55"
                  />
                  <circle
                    className="text-colorBrand"
                    strokeWidth="10"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="55"
                    cy="55"
                    style={{
                      strokeDasharray,
                      strokeDashoffset,
                      transition: "stroke-dashoffset 0.5s ease",
                    }}
                  />
                </svg>
                <img
                  src={userImage}
                  alt={user?.userName || "User Avatar"}
                  className="absolute h-[70px] w-[70px] rounded-full border-4 border-white object-cover"
                  style={{
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                />
              </div>
              <div className="flex flex-col items-end gap-[10px] text-sm ltr:ml-auto rtl:mr-auto">
                <span>{user?.userName?.split(" ")?.[0]}</span>
                <span className="text-colorBrand">
                  {progressPercentage?.toFixed(0)}%
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}

export default LastFiveUsers;
