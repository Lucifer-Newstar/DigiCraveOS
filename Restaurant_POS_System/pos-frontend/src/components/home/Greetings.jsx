import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

const Greetings = () => {
  const userData = useSelector(state => state.user);
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${months[date.getMonth()]} ${String(date.getDate()).padStart(2, '0')}, ${date.getFullYear()}`;
  };

  const greeting = () => {
    const h = dateTime.getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const formatTime = (date) =>
    `${String(date.getHours()).padStart(2, "0")}:${String(
      date.getMinutes()
    ).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;

  return (
    <div className="flex justify-between items-center gap-4">
      <div>
        <h1 className="text-slate-900 text-2xl font-bold tracking-tight">
          {greeting()}, {userData.name || "there"}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Give your best service to customers today 😀
        </p>
      </div>
      <div className="text-right">
        <h1 className="text-slate-900 text-3xl font-bold tracking-tight tabular-nums">
          {formatTime(dateTime)}
        </h1>
        <p className="text-slate-500 text-sm">{formatDate(dateTime)}</p>
      </div>
    </div>
  );
};

export default Greetings;
