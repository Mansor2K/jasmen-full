import HighFiveUsersCharging from "../features/dashboard/HighFiveUsersCharging";
import LastFiveUsers from "../features/dashboard/LastFiveUsers";
import Status from "../features/dashboard/Status";

function Dashboard() {
  return (
    <div className="flex flex-col gap-[20px]">
      <Status />
      <LastFiveUsers />
      <HighFiveUsersCharging />
    </div>
  );
}

export default Dashboard;
