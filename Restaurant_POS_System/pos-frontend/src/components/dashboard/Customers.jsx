import PropTypes from "prop-types";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCustomerIntelligence, getCustomers, getRetentionRecommendations } from "../../https";
import { toArray } from "../../utils";

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

// Auto-CRM view — customers are built automatically from orders (UML U03
// Customer.upsertFromOrder). Shows who they are, spend and loyalty.
const Customers = () => {
  const [q, setQ] = useState("");
  const { data, isLoading, isError } = useQuery({
    queryKey: ["customers"],
    queryFn: getCustomers,
  });
  const { data: intelligenceData } = useQuery({
    queryKey: ["customer-intelligence"],
    queryFn: getCustomerIntelligence,
  });
  const { data: retentionData } = useQuery({
    queryKey: ["customer-retention"],
    queryFn: getRetentionRecommendations,
  });

  const customers = toArray(data);
  const intelligence = intelligenceData?.data?.data || {};
  const segments = intelligence.segments || {};
  const segmentById = new Map((intelligence.customers || []).map((customer) => [customer._id, customer.segment]));
  const retention = retentionData?.data?.data?.recommendations || [];
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

      <div className="pos-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div><h2 className="font-semibold">Customer segments</h2><p className="text-xs text-slate-500">Deterministic retention groups from orders and visit recency.</p></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">{["vip", "loyal", "new", "at_risk", "regular"].map((segment) => <div className="rounded-lg bg-slate-50 p-3" key={segment}><p className="text-xs text-slate-500 capitalize">{segment.replace("_", " ")}</p><p className="text-xl font-bold text-slate-900">{segments[segment] || 0}</p></div>)}</div>
      </div>

      {retention.length > 0 && <div className="pos-card p-4"><h2 className="font-semibold">Retention actions</h2><p className="text-xs text-slate-500 mt-1">Advisory follow-ups only. No messages are sent automatically.</p><div className="mt-3 space-y-2">{retention.slice(0, 5).map((item) => <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-3" key={String(item.customer._id)}><div><p className="font-medium text-slate-800">{item.customer.name}</p><p className="text-xs text-slate-500">{item.reason} · {item.channel.replaceAll("_", " ")}</p></div><span className="text-xs font-semibold uppercase text-amber-700">{item.action}</span></div>)}</div></div>}

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
                <th className="p-3 font-medium">Segment</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="p-4 text-slate-400">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="p-4 text-slate-400">No customers found.</td></tr>
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
                    <td className="p-3 capitalize text-slate-600">{(segmentById.get(c._id) || "regular").replace("_", " ")}</td>
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

Stat.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  dot: PropTypes.string.isRequired,
};

export default Customers;
