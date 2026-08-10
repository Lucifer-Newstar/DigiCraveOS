import React, { useState } from "react";
import { FiSearch, FiBell, FiPlus } from "react-icons/fi";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Modal from "./Modal";
import { setCustomer } from "../../redux/slices/customerSlice";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [guestCount, setGuestCount] = useState(1);

  const increment = () => guestCount < 12 && setGuestCount((p) => p + 1);
  const decrement = () => guestCount > 1 && setGuestCount((p) => p - 1);

  const handleCreateOrder = () => {
    dispatch(setCustomer({ name, phone, guests: guestCount }));
    setIsModalOpen(false);
    navigate("/tables");
  };

  return (
    <header className="h-20 shrink-0 flex items-center justify-between gap-4 px-6 md:px-8 bg-white border-b border-slate-200">
      {/* Search */}
      <div className="flex items-center gap-3 bg-slate-100 rounded-xl px-4 h-11 w-full max-w-md">
        <FiSearch className="text-slate-400 text-lg shrink-0" />
        <input
          type="text"
          placeholder="Search orders, tables, dishes…"
          aria-label="Search"
          className="bg-transparent outline-none text-slate-800 placeholder:text-slate-400 w-full text-sm"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button aria-label="Notifications" className="pos-icon-btn relative">
          <FiBell className="text-lg" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emerald-500" />
        </button>
        <button onClick={() => setIsModalOpen(true)} className="pos-btn-primary">
          <FiPlus className="text-lg" />
          <span className="hidden sm:inline">New Order</span>
        </button>
      </div>

      {/* Create Order Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Order"
      >
        <div className="space-y-4">
          <div>
            <label className="pos-label">Customer Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              placeholder="Enter customer name"
              className="pos-input"
            />
          </div>
          <div>
            <label className="pos-label">Customer Phone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              placeholder="+91-9999999999"
              className="pos-input"
            />
          </div>
          <div>
            <label className="pos-label">Guests</label>
            <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-2">
              <button
                onClick={decrement}
                aria-label="Decrease guests"
                className="h-9 w-9 rounded-lg bg-slate-100 text-slate-700 text-xl font-semibold hover:bg-slate-200"
              >
                &minus;
              </button>
              <span className="text-slate-900 font-semibold">
                {guestCount} {guestCount === 1 ? "Person" : "People"}
              </span>
              <button
                onClick={increment}
                aria-label="Increase guests"
                className="h-9 w-9 rounded-lg bg-slate-100 text-slate-700 text-xl font-semibold hover:bg-slate-200"
              >
                &#43;
              </button>
            </div>
          </div>
          <button
            onClick={handleCreateOrder}
            disabled={!name}
            className="pos-btn-primary w-full mt-2"
          >
            Create Order
          </button>
        </div>
      </Modal>
    </header>
  );
};

export default Header;
