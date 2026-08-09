import React from "react";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { getCustomerProfile } from "../../https";

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const CustomerProfile = () => {
  const cached = useSelector((s) => s.customerAuth);
  const { data } = useQuery({ queryKey: ["customer-profile"], queryFn: getCustomerProfile });
  const c = data?.data?.data || cached;

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-extrabold text-slate-900 mb-4">My Profile</h1>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center text-2xl font-bold">
            {(c.name || "G").charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900">{c.name}</p>
            <p className="text-sm text-slate-500">{c.email}</p>
            <p className="text-sm text-slate-500">{c.phone}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="rounded-xl bg-amber-50 p-4 text-center">
            <p className="text-2xl font-extrabold text-orange-600">{c.totalOrders ?? 0}</p>
            <p className="text-xs text-slate-500 mt-1">Total orders</p>
          </div>
          <div className="rounded-xl bg-amber-50 p-4 text-center">
            <p className="text-2xl font-extrabold text-orange-600">{inr(c.totalSpent)}</p>
            <p className="text-xs text-slate-500 mt-1">Total spent</p>
          </div>
        </div>

        <p className="text-xs text-slate-400 text-center mt-6">
          🎉 Thanks for being a DigiCrave customer!
        </p>
      </div>
    </div>
  );
};

export default CustomerProfile;
