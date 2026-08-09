import React, { useEffect, useRef, useState } from "react";
import { RiDeleteBin2Fill } from "react-icons/ri";
import { FaNotesMedical } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { removeItem, incrementItem, decrementItem, updateItemNotes } from "../../redux/slices/cartSlice";

const CartInfo = () => {
  const cartData = useSelector((state) => state.cart);
  const scrolLRef = useRef();
  const dispatch = useDispatch();
  // Which cart lines have their notes input open.
  const [openNotes, setOpenNotes] = useState({});
  const toggleNotes = (id) =>
    setOpenNotes((prev) => ({ ...prev, [id]: !prev[id] }));

  useEffect(() => {
    if(scrolLRef.current){
      scrolLRef.current.scrollTo({
        top: scrolLRef.current.scrollHeight,
        behavior: "smooth"
      })
    }
  },[cartData]);

  const handleRemove = (itemId) => {
    dispatch(removeItem(itemId));
  }

  const handleIncrement = (itemId) => dispatch(incrementItem(itemId));
  const handleDecrement = (itemId) => dispatch(decrementItem(itemId));

  return (
    <div className="px-4 py-3 flex-1 flex flex-col min-h-0">
      <h1 className="text-lg text-slate-900 font-semibold tracking-wide">
        Order Details
      </h1>
      <div className="mt-4 overflow-y-auto scrollbar-hide flex-1" ref={scrolLRef} >
        {cartData.length === 0 ? (
          <p className="text-slate-500 text-sm flex justify-center items-center h-full text-center">Your cart is empty. Start adding items!</p>
        ) : cartData.map((item) => {
          return (
            <div key={item.id} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 mb-2">
              <div className="flex items-center justify-between">
                <h1 className="text-slate-900 font-semibold tracking-wide text-md">
                  {item.name}
                </h1>
                <p className="text-slate-900 text-md font-bold">₹{item.price}</p>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <RiDeleteBin2Fill
                    onClick={() => handleRemove(item.id)}
                    className="text-rose-500 hover:text-rose-600 cursor-pointer"
                    size={20}
                    aria-label="Remove item"
                  />
                  <FaNotesMedical
                    onClick={() => toggleNotes(item.id)}
                    className={`cursor-pointer ${
                      item.notes || openNotes[item.id]
                        ? "text-emerald-600"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                    size={20}
                    aria-label="Add note"
                  />
                </div>
                {/* Quantity stepper */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDecrement(item.id)}
                    disabled={item.quantity <= 1}
                    aria-label="Decrease quantity"
                    className="h-8 w-8 rounded-lg bg-white border border-slate-200 text-slate-700 text-lg font-semibold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    &minus;
                  </button>
                  <span className="w-8 text-center text-slate-900 font-semibold">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleIncrement(item.id)}
                    aria-label="Increase quantity"
                    className="h-8 w-8 rounded-lg bg-white border border-slate-200 text-slate-700 text-lg font-semibold hover:bg-slate-100"
                  >
                    &#43;
                  </button>
                </div>
              </div>
              {(openNotes[item.id] || item.notes) && (
                <input
                  type="text"
                  value={item.notes || ""}
                  onChange={(e) =>
                    dispatch(updateItemNotes({ id: item.id, notes: e.target.value }))
                  }
                  placeholder="Special instructions (e.g. no onion)"
                  className="mt-3 w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CartInfo;
