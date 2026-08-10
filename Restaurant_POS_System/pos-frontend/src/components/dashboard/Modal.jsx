import React, { useState } from "react";
import { motion } from "framer-motion";
import { IoMdClose } from "react-icons/io";
import { useMutation } from "@tanstack/react-query";
import { addTable } from "../../https";
import { enqueueSnackbar } from "notistack"

const Modal = ({ setIsTableModalOpen }) => {
  const [tableData, setTableData] = useState({
    tableNo: "",
    seats: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTableData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    tableMutation.mutate(tableData);
  };

  const handleCloseModal = () => {
    setIsTableModalOpen(false);
  };

  const tableMutation = useMutation({
    mutationFn: (reqData) => addTable(reqData),
    onSuccess: (res) => {
        setIsTableModalOpen(false);
        const { data } = res;
        enqueueSnackbar(data.message, { variant: "success" })
    },
    onError: (error) => {
        const { data } = error.response;
        enqueueSnackbar(data.message, { variant: "error" })
    }
  })


  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="pos-card p-6 w-96"
      >
        {/* Modal Header */}

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-slate-900 text-xl font-semibold">Add Table</h2>
          <button
            onClick={handleCloseModal}
            className="text-slate-400 hover:text-rose-500"
            aria-label="Close modal"
          >
            <IoMdClose size={24} />
          </button>
        </div>

        {/* Modal Body */}

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div>
            <label className="pos-label">
              Table Number
            </label>
            <input
              type="number"
              name="tableNo"
              value={tableData.tableNo}
              onChange={handleInputChange}
              className="pos-input"
              required
            />
          </div>
          <div>
            <label className="pos-label">
              Number of Seats
            </label>
            <input
              type="number"
              name="seats"
              value={tableData.seats}
              onChange={handleInputChange}
              className="pos-input"
              required
            />
          </div>

          <button
            type="submit"
            className="pos-btn-primary w-full mt-6"
          >
            Add Table
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Modal;
