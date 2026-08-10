import React from "react";
import { FaCheckDouble, FaLongArrowAltRight } from "react-icons/fa";
import { FaCircle } from "react-icons/fa";
import { formatDateAndTime, getAvatarName } from "../../utils/index";

// Presentation for each lifecycle status (matches UML U10 state machine).
const STATUS_META = {
  "In Progress": { badge: "pos-badge-amber", dot: "text-amber-500", note: "Preparing your order" },
  "On Hold": { badge: "pos-badge-amber", dot: "text-amber-500", note: "On hold" },
  Ready: { badge: "pos-badge-green", dot: "text-emerald-600", note: "Ready to serve" },
  Served: { badge: "pos-badge-green", dot: "text-emerald-600", note: "Served" },
  Billing: { badge: "pos-badge-amber", dot: "text-sky-500", note: "Awaiting payment" },
  Paid: { badge: "pos-badge-green", dot: "text-emerald-600", note: "Paid" },
  Completed: { badge: "pos-badge-green", dot: "text-emerald-600", note: "Completed" },
  Voided: { badge: "pos-badge-amber", dot: "text-rose-500", note: "Voided" },
};

const OrderCard = ({ order }) => {
  const meta = STATUS_META[order.orderStatus] || STATUS_META["In Progress"];
  const isDone = ["Ready", "Served", "Paid", "Completed"].includes(order.orderStatus);
  return (
    <div className="pos-card p-4">
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
            <p className={`pos-badge ${meta.badge}`}>
              {isDone ? (
                <FaCheckDouble className="inline" />
              ) : (
                <FaCircle className="inline" />
              )}{" "}
              {order.orderStatus}
            </p>
            <p className="text-slate-500 text-sm">
              <FaCircle className={`inline mr-2 ${meta.dot}`} /> {meta.note}
            </p>
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
