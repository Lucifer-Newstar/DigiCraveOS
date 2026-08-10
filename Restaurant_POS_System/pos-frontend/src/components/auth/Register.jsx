import React, { useState } from "react";
import { register } from "../../https";
import { useMutation } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";

const Register = ({setIsRegister}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSelection = (selectedRole) => {
    setFormData({ ...formData, role: selectedRole });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    registerMutation.mutate(formData);
  };

  const registerMutation = useMutation({
    mutationFn: (reqData) => register(reqData),
    onSuccess: (res) => {
      const { data } = res;
      enqueueSnackbar(data.message, { variant: "success" });
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "",
      });
      
      setTimeout(() => {
        setIsRegister(false);
      }, 1500);
    },
    onError: (error) => {
      const { response } = error;
      const message = response.data.message;
      enqueueSnackbar(message, { variant: "error" });
    },
  });

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="pos-label">
            Employee Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter employee name"
            className="pos-input"
            required
          />
        </div>
        <div className="mb-4">
          <label className="pos-label">
            Employee Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter employee email"
            className="pos-input"
            required
          />
        </div>
        <div className="mb-4">
          <label className="pos-label">
            Employee Phone
          </label>
          <input
            type="number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter employee phone"
            className="pos-input"
            required
          />
        </div>
        <div className="mb-4">
          <label className="pos-label">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter password"
            className="pos-input"
            required
          />
        </div>
        <div className="mb-4">
          <label className="pos-label">
            Choose your role
          </label>

          <div className="grid grid-cols-2 gap-3 mt-2">
            {["Waiter", "Cashier", "Kitchen", "Admin"].map((role) => {
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleRoleSelection(role)}
                  className={`px-4 py-3 w-full rounded-xl text-sm font-semibold transition-colors ${
                    formData.role === role
                      ? "bg-emerald-600 text-white"
                      : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {role}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          className="pos-btn-primary w-full mt-6"
        >
          Sign up
        </button>
      </form>
    </div>
  );
};

export default Register;
