import React, { useState } from "react";
import { motion } from "framer-motion";
import { IoMdClose } from "react-icons/io";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { addCategory, addDish, getCategories } from "../../https";

const ICONS = ["🍲", "🍛", "🍹", "🍜", "🍰", "🍕", "🍺", "🥗", "🍔", "🌮", "☕", "🍣"];
const COLORS = [
  "#b73e3e",
  "#5b45b0",
  "#7f167f",
  "#735f32",
  "#1d2569",
  "#285430",
  "#0f766e",
  "#be123c",
];

// mode = "category" | "dishes"
const MenuModal = ({ mode = "category", onClose }) => {
  const queryClient = useQueryClient();
  const isCategory = mode === "category";

  const [category, setCategory] = useState({
    name: "",
    icon: ICONS[0],
    bgColor: COLORS[0],
  });
  const [dish, setDish] = useState({
    name: "",
    price: "",
    category: "",
    image: "",
  });

  const { data: catRes } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    enabled: !isCategory,
  });
  const categories = catRes?.data?.data || [];

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["categories"] });
    queryClient.invalidateQueries({ queryKey: ["menu"] });
  };

  const catMutation = useMutation({
    mutationFn: (data) => addCategory(data),
    onSuccess: (res) => {
      enqueueSnackbar(res.data.message, { variant: "success" });
      invalidate();
      onClose();
    },
    onError: (err) =>
      enqueueSnackbar(err?.response?.data?.message || "Failed to add category", {
        variant: "error",
      }),
  });

  const dishMutation = useMutation({
    mutationFn: (data) => addDish(data),
    onSuccess: (res) => {
      enqueueSnackbar(res.data.message, { variant: "success" });
      invalidate();
      onClose();
    },
    onError: (err) =>
      enqueueSnackbar(err?.response?.data?.message || "Failed to add dish", {
        variant: "error",
      }),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isCategory) {
      if (!category.name.trim()) return;
      catMutation.mutate(category);
    } else {
      if (!dish.name.trim() || dish.price === "" || !dish.category) {
        enqueueSnackbar("Name, price and category are required.", {
          variant: "warning",
        });
        return;
      }
      dishMutation.mutate({ ...dish, price: Number(dish.price) });
    }
  };

  const pending = catMutation.isPending || dishMutation.isPending;

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="pos-card p-6 w-full max-w-md"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-slate-900 text-xl font-semibold">
            {isCategory ? "Add Category" : "Add Dish"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-rose-500"
            aria-label="Close modal"
          >
            <IoMdClose size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {isCategory ? (
            <>
              <div>
                <label className="pos-label">Category Name</label>
                <input
                  type="text"
                  value={category.name}
                  onChange={(e) =>
                    setCategory((p) => ({ ...p, name: e.target.value }))
                  }
                  className="pos-input"
                  placeholder="e.g. Starters"
                  required
                />
              </div>

              <div>
                <label className="pos-label">Icon</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {ICONS.map((ic) => (
                    <button
                      type="button"
                      key={ic}
                      onClick={() => setCategory((p) => ({ ...p, icon: ic }))}
                      className={`h-9 w-9 rounded-lg text-lg flex items-center justify-center border transition ${
                        category.icon === ic
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="pos-label">Color</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {COLORS.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setCategory((p) => ({ ...p, bgColor: c }))}
                      style={{ backgroundColor: c }}
                      className={`h-8 w-8 rounded-full border-2 transition ${
                        category.bgColor === c
                          ? "border-slate-900 scale-110"
                          : "border-transparent"
                      }`}
                      aria-label={`color ${c}`}
                    />
                  ))}
                </div>
              </div>

              <div
                className="rounded-xl p-4 mt-2 flex items-center gap-3 text-white"
                style={{ backgroundColor: category.bgColor }}
              >
                <span className="text-2xl">{category.icon}</span>
                <span className="font-semibold">
                  {category.name || "Category preview"}
                </span>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="pos-label">Dish Name</label>
                <input
                  type="text"
                  value={dish.name}
                  onChange={(e) => setDish((p) => ({ ...p, name: e.target.value }))}
                  className="pos-input"
                  placeholder="e.g. Paneer Tikka"
                  required
                />
              </div>
              <div>
                <label className="pos-label">Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={dish.price}
                  onChange={(e) => setDish((p) => ({ ...p, price: e.target.value }))}
                  className="pos-input"
                  placeholder="e.g. 280"
                  required
                />
              </div>
              <div>
                <label className="pos-label">Category</label>
                <select
                  value={dish.category}
                  onChange={(e) =>
                    setDish((p) => ({ ...p, category: e.target.value }))
                  }
                  className="pos-input"
                  required
                >
                  <option value="">Select a category…</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>
                {categories.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    No categories yet — add a category first.
                  </p>
                )}
              </div>
              <div>
                <label className="pos-label">Image URL (optional)</label>
                <input
                  type="text"
                  value={dish.image}
                  onChange={(e) => setDish((p) => ({ ...p, image: e.target.value }))}
                  className="pos-input"
                  placeholder="https://…"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={pending}
            className="pos-btn-primary w-full mt-4 disabled:opacity-50"
          >
            {pending ? "Saving…" : isCategory ? "Add Category" : "Add Dish"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default MenuModal;
