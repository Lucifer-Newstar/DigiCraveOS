import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import { FiShoppingBag, FiUser, FiClock, FiGrid, FiLogOut } from "react-icons/fi";
import { customerLogout } from "../../https";
import { clearCustomer } from "../../redux/slices/customerAuthSlice";
import { clearGuestCart, guestCartCount } from "../../redux/slices/guestCartSlice";

const CustomerLayout = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const customer = useSelector((s) => s.customerAuth);
  const cartCount = useSelector(guestCartCount);

  const logoutMutation = useMutation({
    mutationFn: () => customerLogout(),
    onSuccess: () => {
      dispatch(clearCustomer());
      dispatch(clearGuestCart());
      navigate("/customer/login");
    },
  });

  const nav = [
    { to: "/customer", label: "Menu", icon: FiGrid, end: true },
    { to: "/customer/orders", label: "My Orders", icon: FiClock },
    { to: "/customer/profile", label: "Profile", icon: FiUser },
  ];

  return (
    <div className="min-h-screen bg-amber-50/40">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-amber-100">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate("/customer")}
            className="flex items-center gap-2"
          >
            <span className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-lg">
              🍽️
            </span>
            <span className="font-extrabold text-slate-900 text-lg">DigiCrave</span>
          </button>

          <div className="flex items-center gap-1">
            {nav.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? "bg-orange-100 text-orange-700"
                      : "text-slate-600 hover:bg-slate-100"
                  }`
                }
              >
                <Icon /> {label}
              </NavLink>
            ))}

            {/* Cart */}
            <button
              onClick={() => navigate("/customer/cart")}
              className="relative inline-flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100"
              aria-label="Cart"
            >
              <FiShoppingBag />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-orange-600 text-white text-xs flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => logoutMutation.mutate()}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50"
              aria-label="Log out"
            >
              <FiLogOut />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <main className="max-w-5xl mx-auto px-4 py-6 pb-24 sm:pb-6">{children}</main>

      <nav className="sm:hidden fixed bottom-0 inset-x-0 bg-white border-t border-amber-100 flex justify-around py-2 z-30">
        {nav.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center text-xs gap-0.5 px-3 py-1 ${
                isActive ? "text-orange-600" : "text-slate-500"
              }`
            }
          >
            <Icon className="text-lg" /> {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default CustomerLayout;
