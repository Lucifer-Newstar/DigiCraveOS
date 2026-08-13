import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getFinanceReport, getProfitReport } from "../https";

const money = (value) => `₹${Number(value || 0).toFixed(2)}`;

const Reports = () => {
  const today = new Date().toISOString().slice(0, 10);
  const prior = new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10);
  const [range, setRange] = useState({ from: prior, to: today });
  useEffect(() => { document.title = "POS | Finance Reports"; }, []);
  const finance = useQuery({ queryKey: ["finance-report", range], queryFn: () => getFinanceReport(range) });
  const profit = useQuery({ queryKey: ["profit-report", range], queryFn: () => getProfitReport(range) });
  const report = finance.data?.data?.data;
  const profitReport = profit.data?.data?.data;
  const refresh = () => { finance.refetch(); profit.refetch(); };
  return <section className="pos-page"><div className="pos-page-header"><div><h1 className="pos-title">Finance and Profit Reports</h1><p className="pos-subtitle">Revenue, GST, food cost, and margin intelligence</p></div><div className="flex gap-2"><input className="pos-input" type="date" value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} /><input className="pos-input" type="date" value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} /><button className="pos-btn-primary" onClick={refresh}>Refresh</button></div></div>
    {finance.isLoading || profit.isLoading ? <div className="pos-card p-6">Loading reports...</div> : <><div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">{[["Orders", report?.summary.orders], ["Paid orders", report?.summary.paidOrders], ["Revenue", money(report?.summary.revenue)], ["CGST", money(report?.summary.cgst)], ["SGST", money(report?.summary.sgst)]].map(([label, value]) => <div className="pos-card p-4" key={label}><p className="text-xs text-slate-500">{label}</p><p className="text-xl font-bold mt-1">{value}</p></div>)}</div><div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">{[["Food cost", money(profitReport?.summary.foodCost)], ["Gross profit", money(profitReport?.summary.grossProfit)], ["Gross margin", `${Number(profitReport?.summary.marginPct || 0).toFixed(1)}%`], ["Uncosted items", profitReport?.summary.uncostedItems || 0]].map(([label, value]) => <div className="pos-card p-4" key={label}><p className="text-xs text-slate-500">{label}</p><p className="text-xl font-bold mt-1">{value}</p></div>)}</div><div className="pos-card overflow-hidden mb-4"><div className="p-4 border-b"><h2 className="font-semibold">Dish margin analysis</h2></div><table className="w-full text-sm"><thead><tr className="text-left bg-slate-50"><th className="p-3">Dish</th><th>Units</th><th>Revenue</th><th>Food cost</th><th>Margin</th><th>Status</th></tr></thead><tbody>{(profitReport?.items || []).map((item) => <tr key={String(item.dishId || item.name)} className="border-t"><td className="p-3">{item.name}</td><td>{item.unitsSold}</td><td>{money(item.revenue)}</td><td>{item.foodCost === null ? "Not measured" : money(item.foodCost)}</td><td>{item.marginPct === null ? "—" : `${item.marginPct.toFixed(1)}%`}</td><td>{item.status.replace("_", " ")}</td></tr>)}</tbody></table></div><div className="pos-card overflow-hidden"><table className="w-full text-sm"><thead><tr className="text-left bg-slate-50"><th className="p-3">Date</th><th>Orders</th><th>Revenue</th><th>CGST</th><th>SGST</th></tr></thead><tbody>{(report?.daily || []).map((row) => <tr key={row.date} className="border-t"><td className="p-3">{row.date}</td><td>{row.orders}</td><td>{money(row.revenue)}</td><td>{money(row.cgst)}</td><td>{money(row.sgst)}</td></tr>)}</tbody></table></div></>}
  </section>;
};
export default Reports;
