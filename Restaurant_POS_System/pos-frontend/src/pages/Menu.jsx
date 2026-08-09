import React, { useEffect } from "react";
import { MdRestaurantMenu } from "react-icons/md";
import MenuContainer from "../components/menu/MenuContainer";
import CustomerInfo from "../components/menu/CustomerInfo";
import CartInfo from "../components/menu/CartInfo";
import Bill from "../components/menu/Bill";
import { useSelector } from "react-redux";

const Menu = () => {

    useEffect(() => {
      document.title = "POS | Menu"
    }, [])

  const customerData = useSelector((state) => state.customer);

  return (
    <section className="pos-page flex gap-6">
      {/* Left Div */}
      <div className="flex-[3] min-w-0">
        <div className="pos-page-header">
          <div>
            <h1 className="pos-title">Menu</h1>
            <p className="pos-subtitle">Select items to build the order</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <MdRestaurantMenu className="text-2xl" />
            </div>
            <div className="flex flex-col items-start">
              <h2 className="text-sm text-slate-900 font-semibold tracking-wide">
                {customerData.customerName || "Customer Name"}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Table : {customerData.table?.tableNo || "N/A"}
              </p>
            </div>
          </div>
        </div>

        <MenuContainer />
      </div>
      {/* Right Div */}
      <div className="flex-[1] min-w-[320px] pos-card flex flex-col h-[calc(100vh-8rem)] overflow-hidden">
        {/* Customer Info */}
        <CustomerInfo />
        <hr className="border-slate-200" />
        {/* Cart Items */}
        <CartInfo />
        <hr className="border-slate-200" />
        {/* Bills */}
        <Bill />
      </div>
    </section>
  );
};

export default Menu;
