import { formatPercentage } from "@/lib/utils";
import {
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { CategoryTooltip } from "./category-tooltip";

const COLORS = ["#0062FF", "#12C6FF", "#FF647F", "#FF9354"];

type Props = {
  data: {
    name: string;
    value: number;
  }[];
};

export const PieVariant = ({ data }: Props) => {
  const pieData = data.map((item, index) => ({
    ...item,
    fill: COLORS[index % COLORS.length],
  }));

  const total = pieData.reduce((sum, item) => sum + item.value, 0);

  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
       <Legend
          layout="horizontal"
          verticalAlign="bottom"
          align="right"
          iconType="circle"
          content={({ payload }: any) => (
            <ul className="flex flex-col space-y-2">
              {payload.map((entry: any, index: number) => {
                const percent =
                  total === 0 ? 0 : (entry.payload.value / total) * 100;

                return (
                  <li
                    key={`item-${index}`}
                    className="flex items-center space-x-2"
                  >
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <div className="space-x-1">
                      <span className="text-sm text-muted-foreground">
                        {entry.value}
                      </span>
                      <span className="text-sm">
                       {formatPercentage(percent, { addprefix: false })}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        />
        <Tooltip content={<CategoryTooltip/>}/>
        <Pie
          data={pieData}
          cx="50%"
          cy="50%"
          outerRadius={90}
          innerRadius={60}
          paddingAngle={2}
          dataKey="value"
        />
      </PieChart>
    </ResponsiveContainer>
  );
};
