import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addReservation, getReservations, updateReservation } from "../https";
import { toArray } from "../utils/index";

const Reservations = () => {
  const client = useQueryClient();
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({ guestName: "", phone: "", date: "", time: "", partySize: 2 });
  useEffect(() => { document.title = "POS | Reservations"; }, []);
  const { data, isLoading } = useQuery({ queryKey: ["reservations", page], queryFn: () => getReservations({ page, limit: 25 }) });
  const create = useMutation({ mutationFn: addReservation, onSuccess: () => { setForm({ guestName: "", phone: "", date: "", time: "", partySize: 2 }); client.invalidateQueries({ queryKey: ["reservations"] }); } });
  const update = useMutation({ mutationFn: updateReservation, onSuccess: () => client.invalidateQueries({ queryKey: ["reservations"] }) });
  const reservations = toArray(data);
  return <section className="pos-page"><div className="pos-page-header"><div><h1 className="pos-title">Reservations</h1><p className="pos-subtitle">Bookings and simple waitlist management</p></div></div>
    <div className="pos-card p-4 mb-4"><form className="grid grid-cols-2 md:grid-cols-6 gap-2" onSubmit={(e) => { e.preventDefault(); create.mutate({ ...form, partySize: Number(form.partySize) }); }}>
      {[['guestName','Guest name'],['phone','Phone'],['date','Date'],['time','Time'],['partySize','Guests']].map(([key, label]) => <input key={key} className="pos-input" required placeholder={label} type={key === 'date' ? 'date' : key === 'partySize' ? 'number' : key === 'time' ? 'time' : 'text'} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />)}
      <button className="pos-btn-primary" disabled={create.isPending}>Add reservation</button></form></div>
    <div className="pos-card overflow-hidden">{isLoading ? <p className="p-6">Loading...</p> : <table className="w-full text-sm"><thead><tr className="text-left bg-slate-50"><th className="p-3">Guest</th><th>Date</th><th>Time</th><th>Guests</th><th>Status</th><th /></tr></thead><tbody>{reservations.map((item) => <tr key={item._id} className="border-t"><td className="p-3">{item.guestName}<span className="block text-xs text-slate-500">{item.phone}</span></td><td>{item.date}</td><td>{item.time}</td><td>{item.partySize}</td><td>{item.status}</td><td><select className="pos-input" value={item.status} onChange={(e) => update.mutate({ id: item._id, status: e.target.value })}>{['Pending','Confirmed','Seated','Completed','Cancelled','No Show'].map((status) => <option key={status}>{status}</option>)}</select></td></tr>)}</tbody></table>}</div>
    <div className="flex items-center justify-between gap-3 mt-3 text-sm"><span className="text-slate-500">Page {data?.data?.pagination?.page || page} of {data?.data?.pagination?.pages || 1} · {data?.data?.pagination?.total || reservations.length} reservations</span><div className="flex gap-2"><button className="pos-btn-ghost" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Previous</button><button className="pos-btn-ghost" disabled={page >= (data?.data?.pagination?.pages || 1)} onClick={() => setPage((current) => current + 1)}>Next</button></div></div>
  </section>;
};
export default Reservations;
