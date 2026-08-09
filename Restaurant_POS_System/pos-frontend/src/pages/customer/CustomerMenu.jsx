import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { enqueueSnackbar } from "notistack";
import { getCustomerMenu } from "../../https";
import { toArray } from "../../utils";
import { addGuestItem, guestCartCount, guestCartTotal } from "../../redux/slices/guestCartSlice";

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const CustomerMenu = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartCount = useSelector(guestCartCount);
  const cartTotal = useSelector(guestCartTotal);
  const [activeCat, setActiveCat] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["customer-menu"],
    queryFn: getCustomerMenu,
  });

  const menu = useMemo(() => {
    const cats = toArray(data);
    return cats.filter((c) => (c.items || []).length > 0);
  }, [data]);

  const selected = menu.find((c) => c._id === activeCat) || menu[0];

  const add = (dish) => {
    if (dish.isAvailable === false) return;
    dispatch(addGuestItem(dish));
    enqueueSnackbar(`${dish.name} added`, { variant: "success" });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900">Our Menu</h1>
        <p className="text-slate-500 text-sm">Pick your favourites and order in a tap.</p>
      </div>

      {isLoading ? (
        <p className="text-slate-400">Loading menu…</p>
      ) : menu.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-slate-500">
          The menu is being set up. Please check back soon!
        </div>
      ) : (
        <>
          {/* Category chips */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
            {menu.map((c) => {
              const active = (selected?._id) === c._id;
              return (
                <button
                  key={c._id}
                  onClick={() => setActiveCat(c._id)}
                  className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition ${
                    active
                      ? "bg-orange-600 text-white border-orange-600"
                      : "bg-white text-slate-600 border-slate-200 hover:border-orange-300"
                  }`}
                >
                  {c.icon} {c.name}
                </button>
              );
            })}
          </div>

          {/* Dishes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {selected?.items.map((dish) => (
              <div
                key={dish._id || dish.id}
                className="bg-white rounded-2xl p-4 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-slate-900">{dish.name}</h3>
                    <span className="text-orange-600 font-bold whitespace-nowrap">
                      {inr(dish.price)}
                    </span>
                  </div>
                  {dish.isAvailable === false && (
                    <span className="inline-block mt-2 text-xs text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                      Unavailable
                    </span>
                  )}
                </div>
                <button
                  onClick={() => add(dish)}
                  disabled={dish.isAvailable === false}
                  className="mt-4 w-full py-2 rounded-xl bg-amber-100 text-orange-700 font-semibold hover:bg-amber-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add to cart
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Sticky cart bar */}
      {cartCount > 0 && (
        <button
          onClick={() => navigate("/customer/cart")}
          className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 bg-orange-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-orange-700"
        >
          <span className="font-semibold">{cartCount} item{cartCount > 1 ? "s" : ""}</span>
          <span className="opacity-80">·</span>
          <span className="font-bold">{inr(cartTotal)}</span>
          <span className="ml-1">View cart →</span>
        </button>
      )}
    </div>
  );
};

export default CustomerMenu;
