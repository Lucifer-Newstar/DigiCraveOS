/* eslint-disable react/prop-types */
import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { getKitchenIntelligence, getKitchenTickets, updateKitchenItem } from "../https";
import { toArray } from "../utils/index";

const NEXT_STATUS = {
  Pending: "Preparing",
  Preparing: "Ready",
};

const Kitchen = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    document.title = "POS | Kitchen Display";
  }, []);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["kitchen-tickets"],
    queryFn: getKitchenTickets,
    refetchInterval: 10000,
  });

  const updateItem = useMutation({
    mutationFn: updateKitchenItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kitchen-tickets"] });
      enqueueSnackbar("Kitchen ticket updated", { variant: "success" });
    },
    onError: (error) => {
      enqueueSnackbar(
        error.response?.data?.message || "Kitchen ticket update failed",
        { variant: "error" }
      );
    },
  });

  const tickets = toArray(data);
  const activeCount = tickets.length;
  const { data: intelligenceResponse } = useQuery({
    queryKey: ["kitchen-intelligence"],
    queryFn: getKitchenIntelligence,
    refetchInterval: 10000,
  });
  const intelligence = intelligenceResponse?.data?.data || {};
  const statusCounts = intelligence.statusCounts || {};

  return (
    <section className="pos-page">
      <div className="pos-page-header">
        <div>
          <h1 className="pos-title">Kitchen Display</h1>
          <p className="pos-subtitle">Tickets refresh every 10 seconds</p>
        </div>
        <span className="pos-chip pos-chip-active">{activeCount} active</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[["Active items", intelligence.activeItems || 0], ["Pending", statusCounts.Pending || 0], ["Preparing", statusCounts.Preparing || 0], ["Ready", statusCounts.Ready || 0]].map(([label, value]) => <div className="pos-card p-4" key={label}><p className="text-xs text-slate-500">{label}</p><p className="text-2xl font-bold mt-1">{value}</p></div>)}
      </div>

      {isLoading ? (
        <div className="pos-card p-10 text-center text-slate-500">Loading kitchen tickets...</div>
      ) : isError ? (
        <div className="pos-card p-10 text-center text-red-600">Could not load kitchen tickets.</div>
      ) : tickets.length === 0 ? (
        <div className="pos-card p-10 text-center text-slate-500">
          🎉 No pending tickets. Kitchen is all caught up!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tickets.map((ticket) => (
            <TicketCard key={ticket.ticketId} ticket={ticket} updateItem={updateItem} />
          ))}
        </div>
      )}
    </section>
  );
};

function TicketCard({ ticket, updateItem }) {
  const isOnHold = ticket.orderStatus === "On Hold";
  return (
    <div className="pos-card p-4 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-slate-900">{ticket.station} station</span>
        <span className="text-xs text-slate-400">
          {new Date(ticket.orderDate || ticket.createdAt).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
      <p className="text-xs text-slate-500 mb-3">
        {ticket.customerDetails?.name || "Guest"} · {ticket.table ? `Table ${ticket.table.tableNo}` : ticket.orderType || "Order"}
      </p>

      <ul className="space-y-3 flex-1">
        {(ticket.items || []).map((item) => {
          const nextStatus = NEXT_STATUS[item.kitchenStatus];
          return (
            <li key={`${ticket.ticketId}:${item.itemIndex}`} className="text-sm">
              <div className="flex justify-between gap-2">
                <span className="font-semibold text-slate-800">
                  {item.quantity} × {item.name}
                </span>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full whitespace-nowrap">
                  {item.kitchenStatus}
                </span>
              </div>
              {item.notes && (
                <p className="text-xs text-amber-700 bg-amber-50 rounded px-2 py-1 mt-1">📝 {item.notes}</p>
              )}
              {nextStatus && (
                <button
                  onClick={() => updateItem.mutate({ orderId: ticket.orderId, itemIndex: item.itemIndex, kitchenStatus: nextStatus })}
                  disabled={isOnHold || updateItem.isPending}
                  className="pos-btn-primary w-full mt-2 disabled:opacity-50"
                >
                  {isOnHold ? "Order on hold" : `Mark ${nextStatus}`}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default Kitchen;
