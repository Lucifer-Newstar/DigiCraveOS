import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { FiTrash2 } from "react-icons/fi";
import { placeCustomerOrder } from "../../https";
import {
  incGuestItem,
  decGuestItem,
  removeGuestItem,
  clearGuestCart,
  guestCartTotal,
} from "../../redux/slices/guestCartSlice";

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const GST = 0.05;

const CustomerCart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cart = useSelector((s) => s.guestCart);
  const subtotal = useSelector(guestCartTotal);
  const [orderType, setOrderType] = useState("Pickup");
  const [guests, setGuests] = useState(1);

  const tax = subtotal * GST;
  const total = subtotal + tax;

  const placeMutation = useMutation({
    mutationFn: () =>
      placeCustomerOrder({
        items: cart.map((i) => ({
          id: i.id,
          name: i.name,
          pricePerQuantity: i.pricePerQuantity,
          quantity: i.quantity,
        })),
        guests,
        orderType,
      }),
    onSuccess: () => {
      dispatch(clearGuestCart());
      enqueueSnackbar("Order placed! 🎉", { variant: "success" });
      navigate("/customer/orders");
    },
    onError: (err) =>
      enqueueSnackbar(err?.response?.data?.message || "Could not place order", {
        variant: "error",
      }),
  });

  if (cart.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-10 text-center">
        <p className="text-4xl mb-3">🛒</p>
        <p className="text-slate-600 font-medium">Your cart is empty</p>
        <button
          onClick={() => navigate("/customer")}
          className="mt-4 px-5 py-2 rounded-xl bg-orange-600 text-white font-semibold"
        >
          Browse menu
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-extrabold text-slate-900 mb-4">Your Cart</h1>

      <div className="bg-white rounded-2xl divide-y divide-slate-100">
        {cart.map((it) => (
          <div key={it.id} className="p-4 flex items-center gap-3">
            <div className="flex-1">
              <p className="font-semibold text-slate-900">{it.name}</p>
              <p className="text-sm text-slate-500">{inr(it.pricePerQuantity)} each</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => dispatch(decGuestItem(it.id))} className="h-8 w-8 rounded-lg bg-slate-100 text-lg font-bold">−</button>
              <span className="w-6 text-center font-semibold">{it.quantity}</span>
              <button onClick={() => dispatch(incGuestItem(it.id))} className="h-8 w-8 rounded-lg bg-slate-100 text-lg font-bold">+</button>
            </div>
            <p className="w-20 text-right font-bold text-slate-900">{inr(it.price)}</p>
            <button onClick={() => dispatch(removeGuestItem(it.id))} className="text-rose-500 hover:text-rose-600">
              <FiTrash2 />
            </button>
          </div>
        ))}
      </div>

      {/* Order options */}
      <div className="bg-white rounded-2xl p-4 mt-4 space-y-3">
        <div>
          <label className="text-sm font-medium text-slate-700">Order type</label>
          <div className="flex gap-2 mt-1">
            {["Pickup", "Delivery"].map((t) => (
              <button
                key={t}
                onClick={() => setOrderType(t)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border ${
                  orderType === t ? "bg-orange-600 text-white border-orange-600" : "border-slate-200 text-slate-600"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bill */}
      <div className="bg-white rounded-2xl p-4 mt-4 space-y-2 text-sm">
        <Row label="Subtotal" value={inr(subtotal)} />
        <Row label="GST (5%)" value={inr(tax)} />
        <div className="border-t border-slate-100 pt-2 flex justify-between font-bold text-base">
          <span>Total</span>
          <span className="text-orange-600">{inr(total)}</span>
        </div>
      </div>

      <button
        onClick={() => placeMutation.mutate()}
        disabled={placeMutation.isPending}
        className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold shadow-md disabled:opacity-60"
      >
        {placeMutation.isPending ? "Placing order…" : `Place order · ${inr(total)}`}
      </button>
    </div>
  );
};

const Row = ({ label, value }) => (
  <div className="flex justify-between text-slate-600">
    <span>{label}</span>
    <span>{value}</span>
  </div>
);

export default CustomerCart;
