import React from 'react'

const MiniCard = ({ title, icon, number, footerNum }) => {
  const isEarnings = title === "Total Earnings";
  return (
    <div className='pos-card flex-1 p-5'>
      <div className='flex items-start justify-between'>
        <h1 className='text-slate-500 text-sm font-medium'>{title}</h1>
        <span
          className={`${
            isEarnings ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
          } p-3 rounded-xl text-xl`}
        >
          {icon}
        </span>
      </div>
      <div>
        <h1 className='text-slate-900 text-3xl font-bold mt-4 tracking-tight'>
          {isEarnings
            ? `₹${Number(number).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
            : number}
        </h1>
        {footerNum != null && (
          <p className='text-slate-500 text-sm mt-2'>
            <span className='text-emerald-600 font-semibold'>{footerNum}%</span> than yesterday
          </p>
        )}
      </div>
    </div>
  )
}

export default MiniCard
