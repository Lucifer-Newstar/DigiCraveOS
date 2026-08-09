import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getPayments } from "../../https";

const inr = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const methodColor = (m) => {
  const key = (m || "").toLowerCase();
  if (key.includes("online")) return "bg-indigo-500";
  if (key.includes("cash")) return "bg-emerald-500";
  if (key.includes("card")) return "bg-amber-500";
  return "bg-slate-400";
};

const StatusBadge = ({ status }) => {
  const s = (status || "").toLowerCase();
  const cls = s.includes("complete")
    ? "bg-emerald-100 text-emerald-700"
    : s.includes("progress")
    ? "bg-amber-100 text-amber-700"
    : s.includes("ready")
    ? "bg-sky-100 text-sky-700"
    : "bg-slate-100 text-slate-600";
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cls}`}>
      {status || "—"}
    </span>
  );
};

const Payments = () => {
  const { data: res, isLoading, isError } = useQuery({
    queryKey: ["payments"],
    queryFn: () => getPayments(25),
  });

  if (isError) {
    return (
      <div className="pos-card p-6 text-rose-600">Failed to load payments.</div>
    );
  }

  const d = res?.data?.data || {};
  const summary = d.summary || {};
  const byMethod = d.byMethod || [];
  const payments = d.payments || [];
  const maxMethod = Math.max(1, ...byMethod.map((m) => m.amount || 0));

  const cards = [
    { title: "Total Collected", value: inr(summary.totalCollected), dot: "bg-emerald-500" },
    { title: "Tax Collected (GST)", value: inr(summary.totalTax), dot: "bg-amber-500" },
    { title: "Transactions", value: summary.transactions ?? 0, dot: "bg-indigo-500" },
  ];

  return (
    <div className="container mx-auto space-y-8">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.title} className="pos-card pos-card-hover p-5">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${c.dot}`} />
              <p className="text-sm font-medium text-slate-500">{c.title}</p>
            </div>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              {isLoading ? "…" : c.value}
            </p>
          </div>
        ))}
      </div>

      {/* By payment method */}
      <div>
        <h2 className="pos-title">Collection by Payment Method</h2>
        <p className="pos-subtitle">How customers are paying across all orders.</p>
        <div className="pos-card p-5 mt-4">
          {isLoading ? (
            <div className="text-slate-400">Loading…</div>
          ) : byMethod.length === 0 ? (
            <div className="text-slate-400">No payments recorded yet.</div>
          ) : (
            <ul className="space-y-3">
              {byMethod.map((m) => (
                <li key={m.method} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 text-sm font-medium text-slate-700 capitalize">
                    {m.method}
                  </span>
                  <div className="flex-1 h-3 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${methodColor(m.method)}`}
                      style={{ width: `${(m.amount / maxMethod) * 100}%` }}
                    />
                  </div>
                  <span className="w-28 text-right text-sm font-semibold text-slate-900">
                    {inr(m.amount)}
                  </span>
                  <span className="w-16 text-right text-xs text-slate-400">
                    {m.count} txns
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Recent transactions */}
      <div>
        <h2 className="pos-title">Recent Transactions</h2>
        <p className="pos-subtitle">Latest {payments.length} payments.</p>
        <div className="pos-card mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-100">
                <th className="p-3 font-medium">Customer</th>
                <th className="p-3 font-medium">Amount</th>
                <th className="p-3 font-medium">Method</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Transaction ID</th>
                <th className="p-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-4 text-slate-400">
                    Loading…
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-slate-400">
                    No transactions yet.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p._id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="p-3 font-medium text-slate-800">
                      {p.customerName}
                    </td>
                    <td className="p-3 font-semibold text-slate-900">
                      {inr(p.amount)}
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-2 capitalize text-slate-700">
                        <span className={`h-2 w-2 rounded-full ${methodColor(p.method)}`} />
                        {p.method}
                      </span>
                    </td>
                    <td className="p-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="p-3 text-slate-500 font-mono text-xs">
                      {p.transactionId}
                    </td>
                    <td className="p-3 text-slate-500">
                      {p.date ? new Date(p.date).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }) : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Payments;
