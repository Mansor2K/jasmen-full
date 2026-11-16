import { useTranslation } from "react-i18next";

import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function Charges({ charges }) {
  const { i18n, t } = useTranslation();
  const isRTL = i18n.language === "ar";

  const chartData = charges.map((item) => ({
    name: new Date(item.createdAt).toLocaleDateString("en-US"),
    money: item.money,
  }));

  return (
    <div className="h-[380px] w-full rounded-md bg-secondary p-[10px] lg:w-[50%]">
      <div className="flex items-center justify-between">
        <h2 className="text-lg">{t("users.UserCharges")}</h2>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart
          data={chartData}
          margin={{
            top: 15,
            right: isRTL ? 70 : 5,
            bottom: 65,
            left: isRTL ? 5 : 5,
          }}
        >
          <CartesianGrid stroke="#f5f5f5" />
          <XAxis dataKey="name" />
          <YAxis
            orientation={isRTL ? "right" : "left"}
            tickCount={5}
            mirror={isRTL}
            dx={isRTL ? 15 : 0}
          />
          <Tooltip />
          <Bar dataKey="money" barSize={20} fill="#4338ca" />
          <Line type="monotone" dataKey="money" stroke="#6366f1" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export default Charges;
