import React from "react";
import { useQuery } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { getMetrics } from "../../https";
import { menus } from "../../constants";

// Category / dish counts come from the app's menu definition.
const totalCategories = menus.length;
const totalDishes = menus.reduce((sum, cat) => sum + cat.items.length, 0);

const Metrics = () => {
  const { data: resData, isError } = useQuery({
    queryKey: ["metrics"],
    queryFn: getMetrics,
  });

  if (isError) {
    enqueueSnackbar("Failed to load metrics!", { variant: "error" });
  }

  const m = resData?.data?.data || {};

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

      <div className="mt-10">
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
