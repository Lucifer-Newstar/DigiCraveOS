import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import { FiHome, FiClipboard, FiGrid, FiPieChart, FiLogOut } from "react-icons/fi";
import logo from "../../assets/images/logo.png";
import { logout } from "../../https";
import { removeUser } from "../../redux/slices/userSlice";
import { getAvatarName } from "../../utils";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.user);

  const role = userData.role;

  // Role-based navigation (matches UML actors: Cashier/Waiter run the POS,
  // Kitchen works the KDS, Admin/Owner gets the dashboard).
  let navItems;
  if (role === "Kitchen") {
    navItems = [{ label: "Kitchen", icon: FiClipboard, path: "/kitchen" }];
  } else {
    navItems = [
      { label: "Home", icon: FiHome, path: "/" },
      { label: "Orders", icon: FiClipboard, path: "/orders" },
      { label: "Tables", icon: FiGrid, path: "/tables" },
    ];
    if (role === "Admin") {
      navItems.push({ label: "Dashboard", icon: FiPieChart, path: "/dashboard" });
    }
  }

  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const logoutMutation = useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      dispatch(removeUser());
      navigate("/auth");
    },
  });

  return (
    <aside className="w-20 lg:w-64 shrink-0 h-full bg-white border-r border-slate-200 flex flex-col">
      {/* Logo */}
      <div
        onClick={() => navigate("/")}
        className="flex items-center gap-3 px-5 h-20 border-b border-slate-100 cursor-pointer"
      >
        <img src={logo} className="h-9 w-9 rounded-lg" alt="Restro logo" />
        <span className="hidden lg:block text-xl font-bold tracking-tight text-slate-900">
          Restro
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map(({ label, icon: Icon, path }) => {
          const active = isActive(path);
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              className={`relative flex items-center gap-3 justify-center lg:justify-start px-3 min-h-[48px] rounded-xl text-sm font-semibold transition-all ${
                active
                  ? "bg-gradient-to-r from-emerald-50 to-emerald-50/30 text-emerald-700 shadow-[0_1px_3px_rgba(16,185,129,0.12)]"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-gradient-to-b from-emerald-400 to-emerald-600" />
              )}
              <Icon className="text-xl shrink-0" />
              <span className="hidden lg:block">{label}</span>
            </button>
          );
        })}
      </nav>

      {/* User + logout */}
      <div className="border-t border-slate-100 p-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 rounded-full bg-emerald-600 text-white flex items-center justify-center font-semibold">
            {getAvatarName(userData.name) || "U"}
          </div>
          <div className="hidden lg:block min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900 truncate">
              {userData.name || "User"}
            </p>
            <p className="text-xs text-slate-500 truncate">{userData.role || "Staff"}</p>
          </div>
          <button
            onClick={() => logoutMutation.mutate()}
            aria-label="Log out"
            className="hidden lg:inline-flex text-slate-400 hover:text-rose-600 transition-colors p-2 rounded-lg"
          >
            <FiLogOut className="text-xl" />
          </button>
        </div>
        <button
          onClick={() => logoutMutation.mutate()}
          aria-label="Log out"
          className="lg:hidden mt-2 w-full inline-flex justify-center text-slate-400 hover:text-rose-600 p-2 rounded-lg"
        >
          <FiLogOut className="text-xl" />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
