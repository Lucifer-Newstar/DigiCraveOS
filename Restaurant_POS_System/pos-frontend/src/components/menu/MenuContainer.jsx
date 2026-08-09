import React, { useState } from "react";
import { menus } from "../../constants";
import { GrRadialSelected } from "react-icons/gr";
import { FaShoppingCart } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { addItems } from "../../redux/slices/cartSlice";


const MenuContainer = () => {
  const [selected, setSelected] = useState(menus[0]);
  const [itemCount, setItemCount] = useState(0);
  const [itemId, setItemId] = useState();
  const dispatch = useDispatch();

  const increment = (id) => {
    setItemId(id);
    if (itemCount >= 4) return;
    setItemCount((prev) => prev + 1);
  };

  const decrement = (id) => {
    setItemId(id);
    if (itemCount <= 0) return;
    setItemCount((prev) => prev - 1);
  };

  const handleAddToCart = (item) => {
    if(itemCount === 0) return;

    const {name, price} = item;
    const newObj = { id: new Date(), name, pricePerQuantity: price, quantity: itemCount, price: price * itemCount };

    dispatch(addItems(newObj));
    setItemCount(0);
  }


  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
        {menus.map((menu) => {
          const isActive = selected.id === menu.id;
          return (
            <button
              key={menu.id}
              type="button"
              aria-pressed={isActive}
              className={`flex flex-col items-start justify-between p-4 rounded-2xl h-[100px] text-left transition-all border ${
                isActive
                  ? "bg-emerald-600 border-emerald-600 text-white shadow-md"
                  : "pos-card pos-card-hover text-slate-900 hover:bg-slate-50"
              }`}
              onClick={() => {
                setSelected(menu);
                setItemId(0);
                setItemCount(0);
              }}
            >
              <div className="flex items-center justify-between w-full">
                <h1 className="text-lg font-semibold">
                  {menu.icon} {menu.name}
                </h1>
                {isActive && (
                  <GrRadialSelected className="text-white" size={20} />
                )}
              </div>
              <p
                className={`text-sm font-semibold ${
                  isActive ? "text-emerald-50" : "text-slate-500"
                }`}
              >
                {menu.items.length} Items
              </p>
            </button>
          );
        })}
      </div>

      <hr className="border-slate-200 my-6" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
        {selected?.items.map((item) => {
          return (
            <div
              key={item.id}
              className="pos-card pos-card-hover flex flex-col items-start justify-between p-4 h-[150px]"
            >
              <div className="flex items-start justify-between w-full">
                <h1 className="text-slate-900 text-lg font-semibold">
                  {item.name}
                </h1>
                <button
                  onClick={() => handleAddToCart(item)}
                  aria-label={`Add ${item.name} to cart`}
                  className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 h-11 w-11 flex items-center justify-center rounded-xl transition-colors"
                >
                  <FaShoppingCart size={18} />
                </button>
              </div>
              <div className="flex items-center justify-between w-full">
                <p className="text-slate-900 text-xl font-bold">
                  ₹{item.price}
                </p>
                <div className="flex items-center justify-between bg-slate-100 px-3 py-2 rounded-xl gap-4">
                  <button
                    onClick={() => decrement(item.id)}
                    aria-label="Decrease quantity"
                    className="text-emerald-600 hover:text-emerald-700 text-2xl w-8 h-8 flex items-center justify-center"
                  >
                    &minus;
                  </button>
                  <span className="text-slate-900 font-semibold min-w-[1ch] text-center">
                    {itemId == item.id ? itemCount : "0"}
                  </span>
                  <button
                    onClick={() => increment(item.id)}
                    aria-label="Increase quantity"
                    className="text-emerald-600 hover:text-emerald-700 text-2xl w-8 h-8 flex items-center justify-center"
                  >
                    &#43;
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default MenuContainer;
