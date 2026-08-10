import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { customerLogin, customerRegister } from "../../https";
import { setCustomer } from "../../redux/slices/customerAuthSlice";

// Guest storefront auth — deliberately different look from the staff login
// (warm amber/orange "diner" theme vs. the staff emerald POS theme).
const CustomerAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "" });

  useEffect(() => {
    document.title = "DigiCrave · Order Online";
  }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const authMutation = useMutation({
    mutationFn: (payload) =>
      mode === "login" ? customerLogin(payload) : customerRegister(payload),
    onSuccess: (res) => {
      dispatch(setCustomer(res.data.data));
      enqueueSnackbar(res.data.message || "Welcome!", { variant: "success" });
      navigate("/customer");
    },
    onError: (err) =>
      enqueueSnackbar(err?.response?.data?.message || "Something went wrong", {
        variant: "error",
      }),
  });

  const submit = (e) => {
    e.preventDefault();
    if (mode === "login") {
      authMutation.mutate({ email: form.email, password: form.password });
    } else {
      authMutation.mutate(form);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-6">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-3xl shadow-lg">
            🍽️
          </div>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
            DigiCrave
          </h1>
          <p className="text-slate-500 text-sm">Order your favourites online</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-7">
          {/* Tabs */}
          <div className="flex bg-amber-50 rounded-xl p-1 mb-6">
            {["login", "register"].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition ${
                  mode === m
                    ? "bg-white text-orange-600 shadow"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {m === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "register" && (
              <>
                <Field label="Full name" name="name" value={form.name} onChange={onChange} placeholder="Ravi Kumar" required />
                <Field label="Phone" name="phone" value={form.phone} onChange={onChange} placeholder="10-digit number" required />
              </>
            )}
            <Field label="Email" name="email" type="email" value={form.email} onChange={onChange} placeholder="you@email.com" required />
            <Field label="Password" name="password" type="password" value={form.password} onChange={onChange} placeholder="••••••••" required />

            <button
              type="submit"
              disabled={authMutation.isPending}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold shadow-md hover:from-amber-600 hover:to-orange-700 transition disabled:opacity-60"
            >
              {authMutation.isPending
                ? "Please wait…"
                : mode === "login"
                ? "Sign In"
                : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            {mode === "login" ? "New here? " : "Already have an account? "}
            <button
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="text-orange-600 font-semibold hover:underline"
            >
              {mode === "login" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>

        {/* Staff link */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Restaurant staff?{" "}
          <a href="/auth" className="underline hover:text-slate-600">
            Go to the staff portal
          </a>
        </p>
      </div>
    </div>
  );
};

const Field = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
    <input
      {...props}
      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
    />
  </div>
);

export default CustomerAuth;
