import { useTranslation } from "react-i18next";
import { useHighFiveUsersCharging } from "./useHighFiveUsersCharging";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import MiniSpinner from "../../ui/miniSpinner/MiniSpinner";
import Empty from "../../ui/Empty";
import Heading from "../../ui/Heading";

function HighFiveUsersCharging() {
  const { i18n, t } = useTranslation();
  const { isLoading, highFiveUsersCharging, error } =
    useHighFiveUsersCharging();

  if (isLoading) return <MiniSpinner />;
  if (error) return <Empty message={t("general.failedToGetData")} />;

  const isRTL = i18n.language === "ar";

  // Transform the sorted data into chart-friendly format
  const chartData = highFiveUsersCharging?.map((user) => ({
    name: user.userName,
    totalMoney: user.totalMoney,
    consumption: user.consumption,
    chargingMoney: user.charging?.reduce(
      (sum, charge) => sum + charge.money,
      0,
    ),
  }));

  return (
    <div
      title={t("descriptions.highConsumersChart")}
      className="h-[400px] rounded-md bg-secondary p-[10px]"
    >
      <div className="mb-[15px]">
        <Heading>{t("users.highFiveUsersCharging")}</Heading>
      </div>

      <ResponsiveContainer>
        <ComposedChart
          data={chartData}
          margin={{
            top: 10,
            right: isRTL ? 70 : 5,
            bottom: 30,
            left: isRTL ? 5 : 5,
          }}
        >
          <CartesianGrid stroke="#f5f5f5" />

          <XAxis
            dataKey="name"
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

          <Tooltip />
          <Legend
            layout="horizontal"
            align="center"
            verticalAlign="bottom"
            wrapperStyle={{ lineHeight: "40px" }}
            payload={[
              { value: t("users.totalMoney"), type: "rect", color: "#4f46e5" },
              {
                value: t("users.chargingMoney"),
                type: "rect",
                color: "#6366f1",
              },
              { value: t("users.consumption"), type: "line", color: "#c7d2fe" },
            ]}
          />
          <Area
            type="basis"
            dataKey="totalMoney"
            fill="url(#colorGradient)"
            stroke="#4f46e5"
          />
          <Bar dataKey="chargingMoney" barSize={20} fill="#6366f1" />
          <Line type="monotone" dataKey="consumption" stroke="#c7d2fe" />
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0.2} />
            </linearGradient>
          </defs>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export default HighFiveUsersCharging;
