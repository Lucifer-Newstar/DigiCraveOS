import React from "react";
import { useQuery } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { getMetrics } from "../../https";
import { menus } from "../../constants";

// Category / dish counts come from the app's menu definition (fallback baseline).
const totalCategories = menus.length;
const totalDishes = menus.reduce((sum, cat) => sum + cat.items.length, 0);

const inr = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

/* ------------------------- Revenue trend area chart ------------------------- */
const RevenueTrend = ({ trend }) => {
  const data = trend || [];
  if (data.length < 2) {
    return (
      <div className="h-52 flex items-center justify-center text-slate-400 text-sm">
        Not enough data to plot a trend yet.
      </div>
    );
  }
  const W = 720;
  const H = 200;
  const pad = { l: 44, r: 12, t: 12, b: 22 };
  const vals = data.map((d) => d.revenue);
  const maxV = Math.max(...vals, 1);
  const minV = Math.min(...vals, 0);
  const span = maxV - minV || 1;
  const x = (i) => pad.l + (i * (W - pad.l - pad.r)) / (data.length - 1);
  const y = (v) => pad.t + (H - pad.t - pad.b) * (1 - (v - minV) / span);

  const linePts = data.map((d, i) => `${x(i)},${y(d.revenue)}`).join(" ");
  const areaPts = `${x(0)},${y(minV)} ${linePts} ${x(data.length - 1)},${y(minV)}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-52">
      <defs>
        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.5, 1].map((t, i) => {
        const gy = pad.t + (H - pad.t - pad.b) * t;
        const val = maxV - span * t;
        return (
          <g key={i}>
            <line x1={pad.l} y1={gy} x2={W - pad.r} y2={gy} stroke="#e2e8f0" strokeWidth="1" />
            <text x={4} y={gy + 3} fontSize="9" fill="#94a3b8">
              {inr(val)}
            </text>
          </g>
        );
      })}
      <polygon points={areaPts} fill="url(#revGrad)" />
      <polyline fill="none" stroke="#10b981" strokeWidth="2.5" points={linePts} />
      {data.map((d, i) => (
        <circle key={i} cx={x(i)} cy={y(d.revenue)} r="2.5" fill="#059669" />
      ))}
    </svg>
  );
};

/* ----------------------------- Status donut ----------------------------- */
const COLORS = ["#10b981", "#6366f1", "#f59e0b", "#ef4444", "#0ea5e9", "#a855f7"];
const StatusDonut = ({ breakdown }) => {
  const data = (breakdown || []).filter((d) => d.count > 0);
  const total = data.reduce((s, d) => s + d.count, 0);
  if (total === 0) {
    return (
      <div className="h-52 flex items-center justify-center text-slate-400 text-sm">
        No orders yet.
      </div>
    );
  }
  const R = 60;
  const C = 2 * Math.PI * R;
  let offset = 0;

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 160 160" className="h-40 w-40 shrink-0 -rotate-90">
        <circle cx="80" cy="80" r={R} fill="none" stroke="#f1f5f9" strokeWidth="20" />
        {data.map((d, i) => {
          const frac = d.count / total;
          const dash = frac * C;
          const seg = (
            <circle
              key={i}
              cx="80"
              cy="80"
              r={R}
              fill="none"
              stroke={COLORS[i % COLORS.length]}
              strokeWidth="20"
              strokeDasharray={`${dash} ${C - dash}`}
              strokeDashoffset={-offset}
            />
          );
          offset += dash;
          return seg;
        })}
      </svg>
      <ul className="space-y-2">
        {data.map((d, i) => (
          <li key={d.status} className="flex items-center gap-2 text-sm">
            <span
              className="h-3 w-3 rounded-sm"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            <span className="text-slate-700 font-medium">{d.status}</span>
            <span className="text-slate-400">
              {d.count} ({Math.round((d.count / total) * 100)}%)
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const Metrics = () => {
  const { data: resData, isError } = useQuery({
    queryKey: ["metrics"],
    queryFn: getMetrics,
  });

  if (isError) {
    enqueueSnackbar("Failed to load metrics!", { variant: "error" });
  }

  const m = resData?.data?.data || resData?.data || {};

  const metricsData = [
    {
      title: "Total Revenue",
      value: `₹${(m.totalRevenue || 0).toLocaleString("en-IN", {
        maximumFractionDigits: 2,
      })}`,
      dot: "bg-emerald-500",
    },
    { title: "Total Orders", value: m.totalOrders ?? 0, dot: "bg-sky-500" },
    { title: "Total Customers", value: m.totalCustomers ?? 0, dot: "bg-amber-500" },
    { title: "Active Orders", value: m.activeOrders ?? 0, dot: "bg-rose-500" },
  ];

  const itemsData = [
    { title: "Total Categories", value: totalCategories, dot: "bg-violet-500" },
    { title: "Total Dishes", value: totalDishes, dot: "bg-emerald-500" },
    { title: "Ready Orders", value: m.readyOrders ?? 0, dot: "bg-amber-500" },
    { title: "Total Tables", value: m.totalTables ?? 0, dot: "bg-fuchsia-500" },
  ];

  const Card = ({ title, value, dot }) => (
    <div className="pos-card pos-card-hover p-5">
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${dot}`} />
        <p className="text-sm font-medium text-slate-500">{title}</p>
      </div>
      <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </p>
    </div>
  );

  return (
    <div className="container mx-auto">
      <div>
        <h2 className="pos-title">Overall Performance</h2>
        <p className="pos-subtitle">
          Live figures across all orders recorded in the system.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {metricsData.map((metric, index) => (
          <Card key={index} {...metric} />
        ))}
      </div>

      {/* Charts */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="pos-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-slate-900">Revenue — last 14 days</h3>
            <span className="text-xs text-slate-400">daily totals</span>
          </div>
          <RevenueTrend trend={m.revenueTrend} />
        </div>
        <div className="pos-card p-5">
          <h3 className="font-semibold text-slate-900 mb-3">Order Status Mix</h3>
          <StatusDonut breakdown={m.statusBreakdown} />
        </div>
      </div>

      <div className="mt-8">
        <h2 className="pos-title">Item Details</h2>
        <p className="pos-subtitle">Menu size and current order activity.</p>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {itemsData.map((item, index) => (
            <Card key={index} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Metrics;
