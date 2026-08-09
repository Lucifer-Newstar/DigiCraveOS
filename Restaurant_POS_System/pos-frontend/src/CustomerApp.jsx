import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import useCustomerAuth from "./hooks/useCustomerAuth";
import CustomerAuth from "./pages/customer/CustomerAuth";
import CustomerLayout from "./components/customer/CustomerLayout";
import CustomerMenu from "./pages/customer/CustomerMenu";
import CustomerCart from "./pages/customer/CustomerCart";
import CustomerOrders from "./pages/customer/CustomerOrders";
import CustomerProfile from "./pages/customer/CustomerProfile";
import FullScreenLoader from "./components/shared/FullScreenLoader";

// Guards a customer route: redirect to the customer login when not signed in.
function CustomerProtected({ children }) {
  const { isAuth } = useSelector((s) => s.customerAuth);
  if (!isAuth) return <Navigate to="/customer/login" replace />;
  return <CustomerLayout>{children}</CustomerLayout>;
}

// The entire Guest storefront, mounted under /customer/*.
export default function CustomerApp() {
  const isLoading = useCustomerAuth();
  const { isAuth } = useSelector((s) => s.customerAuth);

  if (isLoading) return <FullScreenLoader />;

  return (
    <Routes>
      <Route
        path="login"
        element={isAuth ? <Navigate to="/customer" replace /> : <CustomerAuth />}
      />
      <Route path="" element={<CustomerProtected><CustomerMenu /></CustomerProtected>} />
      <Route path="cart" element={<CustomerProtected><CustomerCart /></CustomerProtected>} />
      <Route path="orders" element={<CustomerProtected><CustomerOrders /></CustomerProtected>} />
      <Route path="profile" element={<CustomerProtected><CustomerProfile /></CustomerProtected>} />
      <Route path="*" element={<Navigate to="/customer" replace />} />
    </Routes>
  );
}
