import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getFinanceReport } from "../https";

const Reports = () => {
  const today = new Date().toISOString().slice(0, 10);
  const prior = new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10);
  const [range, setRange] = useState({ from: prior, to: today });
  useEffect(() => { document.title = "POS | Finance Reports"; }, []);
  const { data, isLoading, refetch } = useQuery({ queryKey: ["finance-report", range], queryFn: () => getFinanceReport(range) });
  const report = data?.data?.data;
  return <section className="pos-page"><div className="pos-page-header"><div><h1 className="pos-title">Finance and GST Reports</h1><p className="pos-subtitle">Revenue, payment, and tax summaries</p></div><div className="flex gap-2"><input className="pos-input" type="date" value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} /><input className="pos-input" type="date" value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} /><button className="pos-btn-primary" onClick={() => refetch()}>Refresh</button></div></div>
    {isLoading ? <div className="pos-card p-6">Loading report...</div> : <><div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">{[["Orders", report?.summary.orders], ["Paid orders", report?.summary.paidOrders], ["Revenue", `₹${Number(report?.summary.revenue || 0).toFixed(2)}`], ["CGST", `₹${Number(report?.summary.cgst || 0).toFixed(2)}`], ["SGST", `₹${Number(report?.summary.sgst || 0).toFixed(2)}`]].map(([label, value]) => <div className="pos-card p-4" key={label}><p className="text-xs text-slate-500">{label}</p><p className="text-xl font-bold mt-1">{value}</p></div>)}</div><div className="pos-card overflow-hidden"><table className="w-full text-sm"><thead><tr className="text-left bg-slate-50"><th className="p-3">Date</th><th>Orders</th><th>Revenue</th><th>CGST</th><th>SGST</th></tr></thead><tbody>{(report?.daily || []).map((row) => <tr key={row.date} className="border-t"><td className="p-3">{row.date}</td><td>{row.orders}</td><td>₹{Number(row.revenue).toFixed(2)}</td><td>₹{Number(row.cgst).toFixed(2)}</td><td>₹{Number(row.sgst).toFixed(2)}</td></tr>)}</tbody></table></div></>}
  </section>;
};
export default Reports;
