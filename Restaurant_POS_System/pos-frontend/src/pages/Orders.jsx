import React, { useState, useEffect } from "react";
import OrderCard from "../components/orders/OrderCard";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getOrders } from "../https/index";
import { enqueueSnackbar } from "notistack"
import { toArray } from "../utils/index";

const Orders = () => {

  const [status, setStatus] = useState("all");

    useEffect(() => {
      document.title = "POS | Orders"
    }, [])

  const { data: resData, isError } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      return await getOrders();
    },
    placeholderData: keepPreviousData
  })

  if(isError) {
    enqueueSnackbar("Something went wrong!", {variant: "error"})
  }

  // Map filter chips -> matching order statuses (matches UML U10 lifecycle).
  const STATUS_FILTERS = {
    all: null,
    progress: ["In Progress", "On Hold"],
    ready: ["Ready", "Served"],
    completed: ["Billing", "Paid", "Completed"],
  };
  const allowed = STATUS_FILTERS[status];
  const orders = toArray(resData).filter(
    (o) => !allowed || allowed.includes(o.orderStatus)
  );

  return (
    <section className="pos-page">
      <div className="pos-page-header">
        <div>
          <h1 className="pos-title">Orders</h1>
          <p className="pos-subtitle">Track and manage all customer orders</p>
        </div>
        <div className="inline-flex gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setStatus("all")}
            className={`pos-chip ${status === "all" ? "pos-chip-active" : ""}`}
          >
            All
          </button>
          <button
            onClick={() => setStatus("progress")}
            className={`pos-chip ${status === "progress" ? "pos-chip-active" : ""}`}
          >
            In Progress
          </button>
          <button
            onClick={() => setStatus("ready")}
            className={`pos-chip ${status === "ready" ? "pos-chip-active" : ""}`}
          >
            Ready
          </button>
          <button
            onClick={() => setStatus("completed")}
            className={`pos-chip ${status === "completed" ? "pos-chip-active" : ""}`}
          >
            Completed
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {
          orders.length > 0 ? (
            orders.map((order) => {
              return <OrderCard key={order._id} order={order} />
            })
          ) : <p className="col-span-full text-slate-500">No orders available</p>
        }
      </div>
    </section>
  );
};

export default Orders;
