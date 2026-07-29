import React from "react";
import { FaSearch } from "react-icons/fa";
import OrderList from "./OrderList";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { getOrders } from "../../https/index";

const RecentOrders = () => {
  const { data: resData, isError } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      return await getOrders();
    },
    placeholderData: keepPreviousData,
  });

  if (isError) {
    enqueueSnackbar("Something went wrong!", { variant: "error" });
  }

  return (
    <div className="mt-6">
      <div className="pos-card">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
          <h1 className="text-slate-900 text-lg font-bold">Recent Orders</h1>
          <a href="#" className="text-emerald-600 text-sm font-semibold hover:underline">
            View all
          </a>
        </div>

        <div className="flex items-center gap-3 bg-slate-100 rounded-xl px-4 h-11 mx-6 mt-4">
          <FaSearch className="text-slate-400" />
          <input
            type="text"
            placeholder="Search recent orders"
            className="bg-transparent outline-none text-slate-800 placeholder:text-slate-400 w-full text-sm"
          />
        </div>

        {/* Order list */}
        <div className="mt-2 px-4 pb-3 overflow-y-auto h-[300px] scrollbar-hide">
          {resData?.data.data.length > 0 ? (
            resData.data.data.map((order) => {
              return <OrderList key={order._id} order={order} />;
            })
          ) : (
            <p className="text-slate-500 px-2 py-4">No orders available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentOrders;
