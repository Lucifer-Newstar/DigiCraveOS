import React, { useEffect, useState } from "react";
import restaurant from "../assets/images/restaurant-img.jpg"
import logo from "../assets/images/logo.png"
import Register from "../components/auth/Register";
import Login from "../components/auth/Login";

const Auth = () => {

  useEffect(() => {
    document.title = "POS | Auth"
  }, [])

  const [isRegister, setIsRegister] = useState(false);

  return (
    <div className="flex min-h-screen w-full">
      {/* Left Section */}
      <div className="hidden md:flex w-1/2 relative items-center justify-center bg-cover">
        {/* BG Image */}
        <img className="w-full h-full object-cover" src={restaurant} alt="Restaurant Image" />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/30 to-transparent"></div>

        {/* Quote at bottom */}
        <blockquote className="absolute bottom-10 px-10 mb-6 text-2xl italic text-white leading-relaxed">
          "Serve customers the best food with prompt and friendly service in a
          welcoming atmosphere, and they’ll keep coming back."
          <br />
          <span className="block mt-4 text-base not-italic font-medium text-white/80">- Founder of Restro</span>
        </blockquote>
      </div>

      {/* Right Section */}
      <div className="w-full md:w-1/2 min-h-screen bg-white flex flex-col justify-center px-6 py-10 sm:px-10">
        <div className="w-full max-w-md mx-auto">
          <div className="flex flex-col items-center gap-2">
            <img src={logo} alt="Restro Logo" className="h-14 w-14 border-2 border-slate-200 rounded-full p-1" />
            <h1 className="text-lg font-semibold text-slate-900 tracking-wide">Restro</h1>
          </div>

          <span className="mx-auto -mt-2 mb-2 inline-block text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
            Staff Portal
          </span>

          <h2 className="text-3xl text-center mt-4 font-bold tracking-tight text-slate-900 mb-8">
            {isRegister ? "Employee Registration" : "Employee Login"}
          </h2>

          {/* Components */}
          {isRegister ? <Register setIsRegister={setIsRegister} /> : <Login />}


          <div className="flex justify-center mt-6">
            <p className="text-sm text-slate-500">
              {isRegister ? "Already have an account? " : "Don't have an account? "}
              <a onClick={() => setIsRegister(!isRegister)} className="text-emerald-600 font-semibold hover:underline" href="#">
                {isRegister ? "Sign in" : "Sign up"}
              </a>
            </p>
          </div>

          <div className="flex justify-center mt-4 border-t border-slate-100 pt-4">
            <p className="text-sm text-slate-500">
              Are you a customer?{" "}
              <a href="/customer/login" className="text-orange-600 font-semibold hover:underline">
                Order online here →
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
