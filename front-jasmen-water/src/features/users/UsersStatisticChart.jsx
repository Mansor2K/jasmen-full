import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useUsers } from "./useUsers";
import { useTranslation } from "react-i18next";
import Spinner from "../../ui/spinner/Spinner";
import Empty from "../../ui/Empty";
import Pagination from "../../ui/Pagination";

function UsersStatisticChart() {
  const { i18n, t } = useTranslation();
  const { isLoading, users, totalPages, count, error } = useUsers();
  const isRTL = i18n.language === "ar";

  if (isLoading) return <Spinner height="h-[calc(100vh-160px)]" />;
  if (!users?.length) return <Empty message={t("users.noUsers")} />;
  if (error) return <Empty message={t("general.failedToGetData")} />;

  // Aggregating data for the chart
  const chartData = users.map((user) => {
    const totalCharging = user.charging.reduce(
      (acc, charge) => acc + charge.money,
      0,
    );
    return {
      userName: user.userName,
      totalCharging,
      consumption: user.consumption,
      limit: user.limit,
    };
  });

  return (
    <div
      title={t("descriptions.usersStatistic")}
      className="h-[500px] rounded-md bg-secondary p-[10px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          width={730}
          height={250}
          data={chartData}
          margin={{
            top: 10,
            right: isRTL ? 70 : 5,
            bottom: 30,
            left: isRTL ? 5 : 5,
          }}
        >
          <defs>
            <linearGradient id="colorCharging" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorConsumption" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#c7d2fe" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#c7d2fe" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="userName"
            reversed={isRTL}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            orientation={isRTL ? "right" : "left"}
            tickCount={5}
            mirror={isRTL}
            dx={isRTL ? 15 : 0}
          />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Legend verticalAlign="bottom" height={36} />
          <Area
            type="monotone"
            dataKey="totalCharging"
            name={t("users.chargingMoney")}
            stroke="#4f46e5"
            fillOpacity={1}
            fill="url(#colorCharging)"
          />
          <Area
            type="monotone"
            dataKey="consumption"
            name={t("users.consumption")}
            stroke="#c7d2fe"
            fillOpacity={1}
            fill="url(#colorConsumption)"
          />
        </AreaChart>
      </ResponsiveContainer>
      <Pagination count={count} pageCount={totalPages} />
    </div>
  );
}

export default UsersStatisticChart;
