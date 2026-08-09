import React, { useState, useEffect } from "react";
import TableCard from "../components/tables/TableCard";
import { tables } from "../constants";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getTables } from "../https";
import { enqueueSnackbar } from "notistack";

const Tables = () => {
  const [status, setStatus] = useState("all");

    useEffect(() => {
      document.title = "POS | Tables"
    }, [])

  const { data: resData, isError } = useQuery({
    queryKey: ["tables"],
    queryFn: async () => {
      return await getTables();
    },
    placeholderData: keepPreviousData,
  });

  if(isError) {
    enqueueSnackbar("Something went wrong!", { variant: "error" })
  }

  return (
    <section className="pos-page">
      <div className="pos-page-header">
        <div>
          <h1 className="pos-title">Tables</h1>
          <p className="pos-subtitle">Manage table availability and bookings</p>
        </div>
        <div className="inline-flex gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setStatus("all")}
            className={`pos-chip ${status === "all" ? "pos-chip-active" : ""}`}
          >
            All
          </button>
          <button
            onClick={() => setStatus("booked")}
            className={`pos-chip ${status === "booked" ? "pos-chip-active" : ""}`}
          >
            Booked
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {(resData?.data || []).map((table) => {
          return (
            <TableCard
              id={table._id}
              name={table.tableNo}
              status={table.status}
              initials={table?.currentOrder?.customerDetails.name}
              seats={table.seats}
            />
          );
        })}
      </div>
    </section>
  );
};

export default Tables;
