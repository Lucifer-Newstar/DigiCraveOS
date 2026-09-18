import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addIngredient, getInventory } from "../https";
import { toArray } from "../utils/index";

const Inventory = () => {
  const client = useQueryClient();
  const [form, setForm] = useState({ name: "", unit: "kg", stock: "", reorderLevel: "" });
  useEffect(() => { document.title = "POS | Inventory"; }, []);
  const { data, isLoading } = useQuery({ queryKey: ["inventory"], queryFn: getInventory });
  const add = useMutation({ mutationFn: addIngredient, onSuccess: () => { setForm({ name: "", unit: "kg", stock: "", reorderLevel: "" }); client.invalidateQueries({ queryKey: ["inventory"] }); } });
  const ingredients = toArray(data?.data?.ingredients || data?.ingredients);
  return <section className="pos-page"><div className="pos-page-header"><div><h1 className="pos-title">Inventory</h1><p className="pos-subtitle">Ingredients and low-stock levels</p></div></div>
    <div className="pos-card p-4 mb-4"><form className="grid grid-cols-2 md:grid-cols-5 gap-2" onSubmit={(e) => { e.preventDefault(); add.mutate({ ...form, stock: Number(form.stock), reorderLevel: Number(form.reorderLevel) }); }}>
      {[["name","Ingredient"],["unit","Unit"],["stock","Stock"],["reorderLevel","Reorder level"]].map(([key, label]) => <input key={key} className="pos-input" required={key !== "reorderLevel"} placeholder={label} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />)}
      <button className="pos-btn-primary" disabled={add.isPending}>Add ingredient</button></form></div>
    <div className="pos-card overflow-hidden">{isLoading ? <p className="p-6">Loading...</p> : <table className="w-full text-sm"><thead><tr className="text-left bg-slate-50"><th className="p-3">Ingredient</th><th>Unit</th><th>Stock</th><th>Reorder level</th><th>Status</th></tr></thead><tbody>{ingredients.map((item) => <tr key={item._id} className="border-t"><td className="p-3 font-medium">{item.name}</td><td>{item.unit}</td><td>{item.stock}</td><td>{item.reorderLevel}</td><td className={item.stock <= item.reorderLevel ? "text-red-600 font-semibold" : "text-green-600"}>{item.stock <= item.reorderLevel ? "Low" : "OK"}</td></tr>)}</tbody></table>}</div>
  </section>;
};
export default Inventory;
