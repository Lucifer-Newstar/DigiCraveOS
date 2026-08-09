import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getCustomerOrders } from "../../https";

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const statusStyle = (s) => {
  const k = (s || "").toLowerCase();
  if (k.includes("progress")) return "bg-amber-100 text-amber-700";
  if (k.includes("ready")) return "bg-sky-100 text-sky-700";
  if (k.includes("served")) return "bg-indigo-100 text-indigo-700";
  if (k.includes("paid") || k.includes("complete")) return "bg-emerald-100 text-emerald-700";
  return "bg-slate-100 text-slate-600";
};

// Lifecycle steps a guest cares about.
const STEPS = ["In Progress", "Ready", "Served", "Completed"];

const CustomerOrders = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["customer-orders"],
    queryFn: getCustomerOrders,
    refetchInterval: 15000, // live-ish status updates
  });
  const orders = data?.data?.data || [];

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-extrabold text-slate-900 mb-4">My Orders</h1>

      {isLoading ? (
        <p className="text-slate-400">Loading…</p>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center">
          <p className="text-4xl mb-3">🍜</p>
          <p className="text-slate-600 font-medium">No orders yet</p>
          <button
            onClick={() => navigate("/customer")}
            className="mt-4 px-5 py-2 rounded-xl bg-orange-600 text-white font-semibold"
          >
            Order now
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => {
            const stepIdx = STEPS.indexOf(o.orderStatus);
            return (
              <div key={o._id} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">
                      {new Date(o.orderDate || o.createdAt).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                    <p className="text-sm text-slate-500">{o.orderType || "Dine In"}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyle(o.orderStatus)}`}>
                    {o.orderStatus}
                  </span>
                </div>

                {/* Progress tracker */}
                {stepIdx >= 0 && (
                  <div className="flex items-center gap-1 my-3">
                    {STEPS.map((s, i) => (
                      <React.Fragment key={s}>
                        <div className={`h-2 flex-1 rounded-full ${i <= stepIdx ? "bg-orange-500" : "bg-slate-200"}`} />
                      </React.Fragment>
                    ))}
                  </div>
                )}

                <ul className="text-sm text-slate-600 mt-2 space-y-0.5">
                  {(o.items || []).map((it, idx) => (
                    <li key={idx} className="flex justify-between">
                      <span>{it.quantity} × {it.name}</span>
                      <span>{inr(it.price)}</span>
                    </li>
                  ))}
                </ul>

                <div className="border-t border-slate-100 mt-3 pt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-orange-600">{inr(o.bills?.totalWithTax)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomerOrders;
