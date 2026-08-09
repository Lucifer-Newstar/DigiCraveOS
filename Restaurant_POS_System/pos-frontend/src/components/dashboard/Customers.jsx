import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCustomers } from "../../https";

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

// Auto-CRM view — customers are built automatically from orders (UML U03
// Customer.upsertFromOrder). Shows who they are, spend and loyalty.
const Customers = () => {
  const [q, setQ] = useState("");
  const { data, isLoading, isError } = useQuery({
    queryKey: ["customers"],
    queryFn: getCustomers,
  });

  const customers = data?.data?.data || [];
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return customers;
    return customers.filter(
      (c) =>
        (c.name || "").toLowerCase().includes(t) ||
        (c.phone || "").includes(t) ||
        (c.email || "").toLowerCase().includes(t)
    );
  }, [customers, q]);

  const totalSpent = customers.reduce((s, c) => s + (c.totalSpent || 0), 0);

  if (isError)
    return <div className="pos-card p-6 text-rose-600">Failed to load customers.</div>;

  return (
    <div className="container mx-auto space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Stat label="Total Customers" value={customers.length} dot="bg-amber-500" />
        <Stat label="Lifetime Revenue" value={inr(totalSpent)} dot="bg-emerald-500" />
        <Stat
          label="Registered (online)"
          value={customers.filter((c) => c.hasAccount).length}
          dot="bg-indigo-500"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="pos-title">Customers</h2>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name / phone / email"
            className="pos-input max-w-xs"
          />
        </div>

        <div className="pos-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-100">
                <th className="p-3 font-medium">Name</th>
                <th className="p-3 font-medium">Phone</th>
                <th className="p-3 font-medium">Orders</th>
                <th className="p-3 font-medium">Total Spent</th>
                <th className="p-3 font-medium">Last Visit</th>
                <th className="p-3 font-medium">Account</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="p-4 text-slate-400">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="p-4 text-slate-400">No customers found.</td></tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c._id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="p-3 font-medium text-slate-800">{c.name}</td>
                    <td className="p-3 text-slate-600">{c.phone}</td>
                    <td className="p-3 text-slate-700">{c.totalOrders}</td>
                    <td className="p-3 font-semibold text-slate-900">{inr(c.totalSpent)}</td>
                    <td className="p-3 text-slate-500">
                      {c.lastVisit ? new Date(c.lastVisit).toLocaleDateString("en-IN", { dateStyle: "medium" }) : "—"}
                    </td>
                    <td className="p-3">
                      {c.hasAccount ? (
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Online</span>
                      ) : (
                        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Walk-in</span>
                      )}
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

const Stat = ({ label, value, dot }) => (
  <div className="pos-card pos-card-hover p-5">
    <div className="flex items-center gap-2">
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      <p className="text-sm font-medium text-slate-500">{label}</p>
    </div>
    <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
  </div>
);

export default Customers;
