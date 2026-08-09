import React, { useState, useEffect } from "react";
import { MdTableBar, MdCategory } from "react-icons/md";
import { BiSolidDish } from "react-icons/bi";
import Metrics from "../components/dashboard/Metrics";
import RecentOrders from "../components/dashboard/RecentOrders";
import Modal from "../components/dashboard/Modal";
import MenuModal from "../components/dashboard/MenuModal";
import AiInsights from "../components/dashboard/AiInsights";

const buttons = [
  { label: "Add Table", icon: <MdTableBar />, action: "table" },
  { label: "Add Category", icon: <MdCategory />, action: "category" },
  { label: "Add Dishes", icon: <BiSolidDish />, action: "dishes" },
];

const tabs = ["Metrics", "Orders", "AI Insights", "Payments"];

const Dashboard = () => {

  useEffect(() => {
    document.title = "POS | Admin Dashboard"
  }, [])

  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  // "category" | "dishes" | null
  const [menuModalMode, setMenuModalMode] = useState(null);
  const [activeTab, setActiveTab] = useState("Metrics");

  const handleOpenModal = (action) => {
    if (action === "table") setIsTableModalOpen(true);
    if (action === "category") setMenuModalMode("category");
    if (action === "dishes") setMenuModalMode("dishes");
  };

  return (
    <div className="pos-page">
      <div className="pos-page-header">
        <div className="flex flex-wrap items-center gap-3">
          {buttons.map(({ label, icon, action }) => {
            return (
              <button
                onClick={() => handleOpenModal(action)}
                className="pos-btn-ghost"
              >
                {label} {icon}
              </button>
            );
          })}
        </div>

        <div className="inline-flex gap-1 bg-slate-100 p-1 rounded-xl">
          {tabs.map((tab) => {
            return (
              <button
                className={`pos-chip ${activeTab === tab ? "pos-chip-active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === "Metrics" && <Metrics />}
      {activeTab === "Orders" && <RecentOrders />}
      {activeTab === "AI Insights" && <AiInsights />}
      {activeTab === "Payments" &&
        <div className="pos-card p-6 text-slate-500">
          Payment Component Coming Soon
        </div>
      }

      {isTableModalOpen && <Modal setIsTableModalOpen={setIsTableModalOpen} />}
      {menuModalMode && (
        <MenuModal mode={menuModalMode} onClose={() => setMenuModalMode(null)} />
      )}
    </div>
  );
};

export default Dashboard;
