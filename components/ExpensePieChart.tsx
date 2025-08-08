import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart as RBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart as RLineChart,
  Line,
  ResponsiveContainer,
  AreaChart as RAreaChart,
  Area,
  RadarChart as RRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart as RScatterChart,
  Scatter,
  ComposedChart as RComposedChart,
} from "recharts";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
];

interface PieChartData {
  category: string;
  value: number;
}

export default function ExpensePieChart({ data }: { data: PieChartData[] }) {
  return (
    <PieChart width={300} height={200}>
      <Pie
        data={data}
        dataKey="value"
        nameKey="category"
        cx="50%"
        cy="50%"
        outerRadius={80}
        fill="#8884d8"
        label
      >
        {data.map((entry: PieChartData, idx: number) => (
          <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  );
}

export function ExpenseDonutChart({ data }: { data: PieChartData[] }) {
  return (
    <PieChart width={300} height={200}>
      <Pie
        data={data}
        dataKey="value"
        nameKey="category"
        cx="50%"
        cy="50%"
        innerRadius={40}
        outerRadius={80}
        fill="#8884d8"
        label
      >
        {data.map((entry: PieChartData, idx: number) => (
          <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  );
}

export function ExpenseBarChart({
  data,
  xKey = "month",
  yKey = "value",
  label = "Amount",
}: {
  data: Record<string, unknown>[];
  xKey?: string;
  yKey?: string;
  label?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <RBarChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey} stroke="#8884d8" />
        <YAxis stroke="#8884d8" />
        <Tooltip />
        <Legend />
        <Bar dataKey={yKey} fill="#0088FE" name={label} />
      </RBarChart>
    </ResponsiveContainer>
  );
}

export function ExpenseAreaChart({
  data,
  xKey = "month",
  yKey = "value",
  label = "Amount",
}: {
  data: Record<string, unknown>[];
  xKey?: string;
  yKey?: string;
  label?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <RAreaChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey} stroke="#8884d8" />
        <YAxis stroke="#8884d8" />
        <Tooltip />
        <Legend />
        <Area
          type="monotone"
          dataKey={yKey}
          stroke="#00C49F"
          fill="#00C49F"
          fillOpacity={0.3}
          name={label}
        />
      </RAreaChart>
    </ResponsiveContainer>
  );
}

export function ExpenseLineChart({
  data,
  xKey = "month",
  yKey = "value",
  label = "Amount",
}: {
  data: Record<string, unknown>[];
  xKey?: string;
  yKey?: string;
  label?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <RLineChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey} stroke="#8884d8" />
        <YAxis stroke="#8884d8" />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey={yKey}
          stroke="#00C49F"
          name={label}
          strokeWidth={2}
          dot={{ r: 3 }}
        />
      </RLineChart>
    </ResponsiveContainer>
  );
}

export function ExpenseRadarChart({
  data,
}: {
  data: { category: string; value: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <RRadarChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <PolarGrid />
        <PolarAngleAxis dataKey="category" />
        <PolarRadiusAxis />
        <Radar
          name="Spending"
          dataKey="value"
          stroke="#8884D8"
          fill="#8884D8"
          fillOpacity={0.3}
        />
        <Tooltip />
        <Legend />
      </RRadarChart>
    </ResponsiveContainer>
  );
}

export function ExpenseScatterChart({
  data,
  xKey = "amount",
  yKey = "date",
  label = "Expenses",
}: {
  data: Record<string, unknown>[];
  xKey?: string;
  yKey?: string;
  label?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <RScatterChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey} stroke="#8884d8" />
        <YAxis stroke="#8884d8" />
        <Tooltip />
        <Legend />
        <Scatter name={label} dataKey={yKey} fill="#FF8042" />
      </RScatterChart>
    </ResponsiveContainer>
  );
}

export function ExpenseStackedBarChart({
  data,
  categories,
}: {
  data: Record<string, unknown>[];
  categories: string[];
}) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <RComposedChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" stroke="#8884d8" />
        <YAxis stroke="#8884d8" />
        <Tooltip />
        <Legend />
        {categories.map((category, index) => (
          <Bar
            key={category}
            dataKey={category}
            stackId="a"
            fill={COLORS[index % COLORS.length]}
          />
        ))}
      </RComposedChart>
    </ResponsiveContainer>
  );
}
