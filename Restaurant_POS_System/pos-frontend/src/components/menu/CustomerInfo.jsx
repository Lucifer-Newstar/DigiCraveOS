import React, { useState } from "react";
import { useSelector } from "react-redux";
import { formatDate, getAvatarName } from "../../utils";

const CustomerInfo = () => {
  const [dateTime, setDateTime] = useState(new Date());
  const customerData = useSelector((state) => state.customer);

  return (
    <div className="flex items-center justify-between px-4 py-4">
      <div className="flex flex-col items-start">
        <h1 className="text-md text-slate-900 font-semibold tracking-wide">
          {customerData.customerName || "Customer Name"}
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          #{customerData.orderId || "N/A"} / Dine in
        </p>
        <p className="text-xs text-slate-500 font-medium mt-2">
          {formatDate(dateTime)}
        </p>
      </div>
      <button className="bg-emerald-600 text-white h-11 w-11 flex items-center justify-center text-lg font-bold rounded-xl">
        {getAvatarName(customerData.customerName) || "CN"}
      </button>
    </div>
  );
};

export default CustomerInfo;
