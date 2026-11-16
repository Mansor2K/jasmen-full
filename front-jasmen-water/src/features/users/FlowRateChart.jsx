import { useTranslation } from "react-i18next";
import { PieChart, Pie, Cell } from "recharts";

const RADIAN = Math.PI / 180;
const MAX_FLOW_RATE = 1024;

const data = [
  { name: "C", value: 25, color: "#6366f1" },
  { name: "B", value: 45, color: "#4f46e5" },
  { name: "A", value: 80, color: "#4338ca" },
];

const cx = 150;
const cy = 200;
const iR = 50;
const oR = 100;

const needle = (value, maxValue, cx, cy, iR, oR, color) => {
  const total = maxValue || MAX_FLOW_RATE;
  const ang = 180.0 * (1 - value / total);
  const length = (iR + 2 * oR) / 3;
  const sin = Math.sin(-RADIAN * ang);
  const cos = Math.cos(-RADIAN * ang);
  const r = 5;
  const x0 = cx + 5;
  const y0 = cy + 5;
  const xba = x0 + r * sin;
  const yba = y0 - r * cos;
  const xbb = x0 - r * sin;
  const ybb = y0 + r * cos;
  const xp = x0 + length * cos;
  const yp = y0 + length * sin;

  return [
    <circle key="circle" cx={x0} cy={y0} r={r} fill={color} stroke="none" />,
    <path
      key="path"
      d={`M${xba} ${yba}L${xbb} ${ybb} L${xp} ${yp} L${xba} ${yba}`}
      stroke="none"
      fill={color}
    />,
  ];
};

function FlowRateChart({ flowRate = 0 }) {
  const [t] = useTranslation();

  // Normalize flowRate to be a value between 0 and MAX_FLOW_RATE
  const normalizedFlowRate = Math.min(flowRate, MAX_FLOW_RATE); // Ensure flowRate does not exceed MAX_FLOW_RATE

  return (
    <div
      title={t("users.flowRate")}
      className="h-[380px] bg-secondary p-[10px]"
    >
      <h2 className="text-lg">{t("users.flowRate")}</h2>
      <div className="flex items-center justify-center">
        <PieChart width={400} height={500}>
          <Pie
            dataKey="value"
            startAngle={180}
            endAngle={0}
            data={data}
            cx={cx}
            cy={cy}
            innerRadius={iR}
            outerRadius={oR}
            fill="#8884d8"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          {needle(normalizedFlowRate, MAX_FLOW_RATE, cx, cy, iR, oR, "#312e81")}
        </PieChart>
      </div>
    </div>
  );
}

export default FlowRateChart;
