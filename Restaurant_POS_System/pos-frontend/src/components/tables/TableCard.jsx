import React from "react";
import { useNavigate } from "react-router-dom";
import { getAvatarName, getBgColor } from "../../utils"
import { useDispatch } from "react-redux";
import { updateTable } from "../../redux/slices/customerSlice";
import { FaLongArrowAltRight } from "react-icons/fa";

const TableCard = ({id, name, status, initials, seats}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleClick = (name) => {
    if(status === "Booked") return;

    const table = { tableId: id, tableNo: name }
    dispatch(updateTable({table}))
    navigate(`/menu`);
  };

  return (
    <div onClick={() => handleClick(name)} key={id} className="pos-card pos-card-hover p-4 cursor-pointer">
      <div className="flex items-center justify-between px-1">
        <h1 className="text-slate-900 text-xl font-semibold">Table <FaLongArrowAltRight className="text-slate-400 ml-2 inline" /> {name}</h1>
        <span className={`pos-badge ${status === "Booked" ? "pos-badge-amber" : "pos-badge-green"}`}>
          {status}
        </span>
      </div>
      <div className="flex items-center justify-center mt-5 mb-8">
        <h1 className={`rounded-full h-16 w-16 flex items-center justify-center text-xl font-bold ${initials ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-400"}`}>{getAvatarName(initials) || "N/A"}</h1>
      </div>
      <p className="text-slate-500 text-xs">Seats: <span className="text-slate-900 font-medium">{seats}</span></p>
    </div>
  );
};

export default TableCard;
