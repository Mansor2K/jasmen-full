import { useTranslation } from "react-i18next";
import Heading from "../../ui/Heading";
import UsersStatisticChart from "./UsersStatisticChart";

function UsersStatistic() {
  const [t] = useTranslation();

  return (
    <div className="flex flex-col gap-[20px]">
      <div className="rounded-md bg-secondary p-[10px]">
        <Heading>{t("users.statistic")}</Heading>
      </div>
      <UsersStatisticChart />
    </div>
  );
}

export default UsersStatistic;
