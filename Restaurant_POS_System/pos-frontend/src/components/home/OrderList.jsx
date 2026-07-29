import React from "react";
import { FaCheckDouble, FaLongArrowAltRight } from "react-icons/fa";
import { FaCircle } from "react-icons/fa";
import { getAvatarName } from "../../utils/index";

const OrderList = ({ key, order }) => {
  return (
    <div className="flex items-center gap-4 px-2 py-3 rounded-xl hover:bg-slate-50 transition-colors">
      <div className="h-11 w-11 shrink-0 bg-emerald-100 text-emerald-700 text-sm font-bold rounded-xl flex items-center justify-center">
        {getAvatarName(order.customerDetails.name)}
      </div>
      <div className="flex items-center justify-between w-full gap-3">
        <div className="flex flex-col items-start gap-0.5 min-w-0">
          <h1 className="text-slate-900 font-semibold truncate">
            {order.customerDetails.name}
          </h1>
          <p className="text-slate-500 text-sm">{order.items.length} Items</p>
        </div>

        <span className="text-slate-600 text-sm font-medium bg-slate-100 rounded-lg px-2.5 py-1 whitespace-nowrap">
          Table <FaLongArrowAltRight className="text-slate-400 mx-1 inline" />
          {order.table?.tableNo ?? "—"}
        </span>

        <div className="flex flex-col items-end">
          {order.orderStatus === "Ready" ? (
            <span className="pos-badge pos-badge-green">
              <FaCheckDouble /> {order.orderStatus}
            </span>
          ) : (
            <span className="pos-badge pos-badge-amber">
              <FaCircle className="text-[8px]" /> {order.orderStatus}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderList;
