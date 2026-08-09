import React, { useEffect } from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { getOrders, updateOrderStatus } from "../https";

// Kitchen Display (KDS-lite) — the Kitchen role's screen. Shows active tickets
// (In Progress) with items, quantities, notes and station, and lets kitchen
// staff bump a ticket to "Ready". Maps to UML uc7/uc8 at MVP level.
const Kitchen = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    document.title = "POS | Kitchen Display";
  }, []);

  const { data, isError } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
    placeholderData: keepPreviousData,
    refetchInterval: 10000, // live board
  });

  if (isError) enqueueSnackbar("Failed to load tickets", { variant: "error" });

  const bump = useMutation({
    mutationFn: ({ orderId, orderStatus }) => updateOrderStatus({ orderId, orderStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      enqueueSnackbar("Ticket updated", { variant: "success" });
    },
    onError: () => enqueueSnackbar("Update failed", { variant: "error" }),
  });

  const orders = (data?.data || []).filter((o) =>
    ["In Progress", "On Hold"].includes(o.orderStatus)
  );

  return (
    <section className="pos-page">
      <div className="pos-page-header">
        <div>
          <h1 className="pos-title">Kitchen Display</h1>
          <p className="pos-subtitle">Active tickets · auto-refreshes every 10s</p>
        </div>
        <span className="pos-chip pos-chip-active">{orders.length} active</span>
      </div>

      {orders.length === 0 ? (
        <div className="pos-card p-10 text-center text-slate-500">
          🎉 No pending tickets. Kitchen is all caught up!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {orders.map((o) => (
            <div key={o._id} className="pos-card p-4 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-900">
                  {o.customerDetails?.name || "Guest"}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(o.orderDate || o.createdAt).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                {o.table ? `Table ${o.table.tableNo}` : o.orderType || "Order"}
              </p>

              <ul className="space-y-2 flex-1">
                {(o.items || []).map((it, idx) => (
                  <li key={idx} className="text-sm">
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate-800">
                        {it.quantity} × {it.name}
                      </span>
                      {it.station && (
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                          {it.station}
                        </span>
                      )}
                    </div>
                    {it.notes && (
                      <p className="text-xs text-amber-700 bg-amber-50 rounded px-2 py-1 mt-1">
                        📝 {it.notes}
                      </p>
                    )}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => bump.mutate({ orderId: o._id, orderStatus: "Ready" })}
                disabled={bump.isPending}
                className="pos-btn-primary w-full mt-4 disabled:opacity-50"
              >
                Mark Ready
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default Kitchen;
