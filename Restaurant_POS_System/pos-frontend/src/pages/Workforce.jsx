import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { closeShift, getShifts, getWorkforceIntelligence, getWorkforceSummary, startShift } from "../https";
import { toArray } from "../utils";

const Workforce = () => {
  const client = useQueryClient();
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({ staff: "", hourlyRate: 0, notes: "" });
  useEffect(() => { document.title = "POS | Workforce"; }, []);
  const shifts = useQuery({ queryKey: ["shifts", page], queryFn: () => getShifts({ page, limit: 25 }) });
  const summary = useQuery({ queryKey: ["workforce-summary"], queryFn: getWorkforceSummary });
  const intelligence = useQuery({ queryKey: ["workforce-intelligence"], queryFn: getWorkforceIntelligence });
  const intelligenceData = intelligence.data?.data?.data || {};
  const start = useMutation({ mutationFn: startShift, onSuccess: () => { setForm({ staff: "", hourlyRate: 0, notes: "" }); client.invalidateQueries({ queryKey: ["shifts"] }); client.invalidateQueries({ queryKey: ["workforce-summary"] }); } });
  const close = useMutation({ mutationFn: closeShift, onSuccess: () => { client.invalidateQueries({ queryKey: ["shifts"] }); client.invalidateQueries({ queryKey: ["workforce-summary"] }); } });
  const rows = toArray(shifts.data);
  const summaries = toArray(summary.data);
  return <section className="pos-page"><div className="pos-page-header"><div><h1 className="pos-title">Shifts and Payroll</h1><p className="pos-subtitle">Attendance and basic pay estimates</p></div></div>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">{[["Open shifts", intelligenceData.openShifts || 0], ["Estimated liability", `₹${Number(intelligenceData.estimatedLiability || 0).toFixed(2)}`], ["Roles covered", Object.keys(intelligenceData.byRole || {}).length]].map(([label, value]) => <div className="pos-card p-4" key={label}><p className="text-xs text-slate-500">{label}</p><p className="text-xl font-bold mt-1">{value}</p></div>)}</div>
    <div className="pos-card p-4 mb-4"><form className="grid grid-cols-1 md:grid-cols-4 gap-2" onSubmit={(e) => { e.preventDefault(); start.mutate({ ...form, hourlyRate: Number(form.hourlyRate) }); }}><input className="pos-input" required placeholder="Staff user id" value={form.staff} onChange={(e) => setForm({ ...form, staff: e.target.value })} /><input className="pos-input" type="number" min="0" placeholder="Hourly rate" value={form.hourlyRate} onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })} /><input className="pos-input" placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /><button className="pos-btn-primary">Start shift</button></form></div>
    <div className="pos-card p-4 mb-4"><h2 className="font-bold mb-3">Payroll summary</h2><div className="grid grid-cols-1 md:grid-cols-3 gap-3">{summaries.map((item) => <div key={item.staff?._id} className="rounded-xl bg-slate-50 p-3"><p className="font-semibold">{item.staff?.name || "Staff"}</p><p className="text-sm text-slate-500">{item.minutes} minutes</p><p className="text-emerald-700 font-bold">₹{item.estimatedPay.toFixed(2)}</p></div>)}</div></div>
    <div className="pos-card overflow-hidden"><table className="w-full text-sm"><thead><tr className="text-left bg-slate-50"><th className="p-3">Staff</th><th>Started</th><th>Status</th><th /></tr></thead><tbody>{rows.map((shift) => <tr key={shift._id} className="border-t"><td className="p-3">{shift.staff?.name || "Staff"}</td><td>{new Date(shift.startedAt).toLocaleString("en-IN")}</td><td>{shift.status}</td><td>{shift.status === "Open" && <button className="pos-btn-ghost" onClick={() => close.mutate({ id: shift._id, breakMinutes: 0 })}>Close shift</button>}</td></tr>)}</tbody></table></div>
    <div className="flex items-center justify-between gap-3 mt-3 text-sm"><span className="text-slate-500">Page {shifts.data?.pagination?.page || page} of {shifts.data?.pagination?.pages || 1} · {shifts.data?.pagination?.total || rows.length} shifts</span><div className="flex gap-2"><button className="pos-btn-ghost" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Previous</button><button className="pos-btn-ghost" disabled={page >= (shifts.data?.pagination?.pages || 1)} onClick={() => setPage((current) => current + 1)}>Next</button></div></div>
  </section>;
};
export default Workforce;
