import React from "react";
import { FaCheckDouble, FaLongArrowAltRight } from "react-icons/fa";
import { FaCircle } from "react-icons/fa";
import { formatDateAndTime, getAvatarName } from "../../utils/index";

const OrderCard = ({ order }) => {
  return (
    <div key={key} className="pos-card p-4">
      <div className="flex items-center gap-4">
        <div className="bg-emerald-600 text-white h-12 w-12 flex items-center justify-center text-lg font-bold rounded-xl shrink-0">
          {getAvatarName(order.customerDetails.name)}
        </div>
        <div className="flex items-center justify-between w-full">
          <div className="flex flex-col items-start gap-1">
            <h1 className="text-slate-900 text-lg font-semibold tracking-wide">
              {order.customerDetails.name}
            </h1>
            <p className="text-slate-500 text-sm">#{Math.floor(new Date(order.orderDate).getTime())} / Dine in</p>
            <p className="text-slate-500 text-sm">Table <FaLongArrowAltRight className="text-slate-500 ml-2 inline" /> {order.table.tableNo}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {order.orderStatus === "Ready" ? (
              <>
                <p className="pos-badge pos-badge-green">
                  <FaCheckDouble className="inline" /> {order.orderStatus}
                </p>
                <p className="text-slate-500 text-sm">
                  <FaCircle className="inline mr-2 text-emerald-600" /> Ready to
                  serve
                </p>
              </>
            ) : (
              <>
                <p className="pos-badge pos-badge-amber">
                  <FaCircle className="inline" /> {order.orderStatus}
                </p>
                <p className="text-slate-500 text-sm">
                  <FaCircle className="inline mr-2 text-amber-500" /> Preparing your order
                </p>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center mt-4 text-slate-500">
        <p>{formatDateAndTime(order.orderDate)}</p>
        <p>{order.items.length} Items</p>
      </div>
      <hr className="w-full mt-4 border-t border-slate-200" />
      <div className="flex items-center justify-between mt-4">
        <h1 className="text-slate-900 text-lg font-semibold">Total</h1>
        <p className="text-slate-900 text-lg font-semibold">₹{order.bills.totalWithTax.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default OrderCard;
