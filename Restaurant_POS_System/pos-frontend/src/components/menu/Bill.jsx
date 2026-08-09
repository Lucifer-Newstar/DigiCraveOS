import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTotalPrice } from "../../redux/slices/cartSlice";
import {
  addOrder,
  createOrderRazorpay,
  updateTable,
  verifyPaymentRazorpay,
} from "../../https/index";
import { enqueueSnackbar } from "notistack";
import { useMutation } from "@tanstack/react-query";
import { removeAllItems } from "../../redux/slices/cartSlice";
import { removeCustomer } from "../../redux/slices/customerSlice";
import Invoice from "../invoice/Invoice";

// Total GST rate (%). Split equally into CGST + SGST for Indian invoicing.
const GST_RATE = 5;

function loadScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

const Bill = () => {
  const dispatch = useDispatch();

  const customerData = useSelector((state) => state.customer);
  const cartData = useSelector((state) => state.cart);
  const subtotal = useSelector(getTotalPrice);

  const [discountType, setDiscountType] = useState("percent"); // 'percent' | 'flat'
  const [discountValue, setDiscountValue] = useState("");

  // Bill math: discount applies to subtotal, GST applies to the discounted amount.
  const discount =
    discountType === "percent"
      ? (subtotal * (Number(discountValue) || 0)) / 100
      : Math.min(Number(discountValue) || 0, subtotal);
  const taxable = Math.max(subtotal - discount, 0);
  const cgst = (taxable * (GST_RATE / 2)) / 100;
  const sgst = (taxable * (GST_RATE / 2)) / 100;
  const tax = cgst + sgst;
  const totalPriceWithTax = taxable + tax;

  const [paymentMethod, setPaymentMethod] = useState();
  const [showInvoice, setShowInvoice] = useState(false);
  const [orderInfo, setOrderInfo] = useState();

  // Assemble the order payload; `extra` carries optional paymentData.
  const buildOrderData = (extra = {}) => ({
    customerDetails: {
      name: customerData.customerName,
      phone: customerData.customerPhone,
      guests: customerData.guests,
    },
    orderStatus: "In Progress",
    bills: {
      total: subtotal,
      tax: tax,
      totalWithTax: totalPriceWithTax,
      discount: discount,
      cgst: cgst,
      sgst: sgst,
    },
    items: cartData,
    table: customerData.table.tableId,
    paymentMethod: paymentMethod,
    ...extra,
  });

  const handlePlaceOrder = async () => {
    // Guards
    if (cartData.length === 0) {
      enqueueSnackbar("Cart is empty. Add items before placing an order!", {
        variant: "warning",
      });
      return;
    }

    if (!customerData.table?.tableId) {
      enqueueSnackbar("Please select a table first!", { variant: "warning" });
      return;
    }

    if (!paymentMethod) {
      enqueueSnackbar("Please select a payment method!", {
        variant: "warning",
      });
      return;
    }

    if (paymentMethod === "Online") {
      // load the script
      try {
        const res = await loadScript(
          "https://checkout.razorpay.com/v1/checkout.js"
        );

        if (!res) {
          enqueueSnackbar("Razorpay SDK failed to load. Are you online?", {
            variant: "warning",
          });
          return;
        }

        // create order

        const reqData = {
          amount: Number(totalPriceWithTax),
        };

        const { data } = await createOrderRazorpay(reqData);

        const options = {
          key: `${import.meta.env.VITE_RAZORPAY_KEY_ID}`,
          amount: data.order.amount,
          currency: data.order.currency,
          name: "RESTRO",
          description: "Secure Payment for Your Meal",
          order_id: data.order.id,
          handler: async function (response) {
            const verification = await verifyPaymentRazorpay(response);
            console.log(verification);
            enqueueSnackbar(verification.data.message, { variant: "success" });

            // Place the order
            const orderData = buildOrderData({
              paymentData: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
              },
            });

            setTimeout(() => {
              orderMutation.mutate(orderData);
            }, 1500);
          },
          prefill: {
            name: customerData.customerName,
            email: "",
            contact: customerData.customerPhone,
          },
          theme: { color: "#025cca" },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (error) {
        console.log(error);
        enqueueSnackbar("Payment Failed!", {
          variant: "error",
        });
      }
    } else {
      // Cash — place the order directly
      orderMutation.mutate(buildOrderData());
    }
  };

  const orderMutation = useMutation({
    mutationFn: (reqData) => addOrder(reqData),
    onSuccess: (resData) => {
      const { data } = resData.data;
      console.log(data);

      setOrderInfo(data);

      // Update Table
      const tableData = {
        status: "Booked",
        orderId: data._id,
        tableId: data.table,
      };

      setTimeout(() => {
        tableUpdateMutation.mutate(tableData);
      }, 1500);

      enqueueSnackbar("Order Placed!", {
        variant: "success",
      });
      setShowInvoice(true);
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const tableUpdateMutation = useMutation({
    mutationFn: (reqData) => updateTable(reqData),
    onSuccess: (resData) => {
      console.log(resData);
      dispatch(removeCustomer());
      dispatch(removeAllItems());
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const Row = ({ label, value, strong, negative }) => (
    <div className="flex items-center justify-between px-5 mt-2">
      <p className={`text-xs font-medium ${strong ? "text-slate-900" : "text-slate-500"}`}>
        {label}
      </p>
      <h1 className={`text-md ${strong ? "font-bold text-slate-900" : "font-semibold text-slate-700"}`}>
        {negative ? "−" : ""}₹{Math.abs(value).toFixed(2)}
      </h1>
    </div>
  );

  return (
    <>
      {/* Discount control */}
      <div className="px-5 mt-4">
        <label className="pos-label">Discount</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            placeholder="0"
            className="pos-input flex-1 py-2"
          />
          <div className="inline-flex rounded-xl border border-slate-200 overflow-hidden">
            <button
              onClick={() => setDiscountType("percent")}
              className={`px-3 min-h-[40px] text-sm font-semibold ${
                discountType === "percent"
                  ? "bg-emerald-600 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              %
            </button>
            <button
              onClick={() => setDiscountType("flat")}
              className={`px-3 min-h-[40px] text-sm font-semibold ${
                discountType === "flat"
                  ? "bg-emerald-600 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              ₹
            </button>
          </div>
        </div>
      </div>

      {/* Totals */}
      <div className="mt-3">
        <div className="flex items-center justify-between px-5 mt-2">
          <p className="text-xs text-slate-500 font-medium">
            Items({cartData.length})
          </p>
          <h1 className="text-slate-900 text-md font-bold">₹{subtotal.toFixed(2)}</h1>
        </div>
        {discount > 0 && (
          <Row
            label={`Discount${discountType === "percent" ? ` (${Number(discountValue) || 0}%)` : ""}`}
            value={discount}
            negative
          />
        )}
        <Row label={`CGST (${GST_RATE / 2}%)`} value={cgst} />
        <Row label={`SGST (${GST_RATE / 2}%)`} value={sgst} />
        <div className="border-t border-slate-200 mx-5 mt-3" />
        <Row label="Grand Total" value={totalPriceWithTax} strong />
      </div>

      {/* Payment method */}
      <div className="flex items-center gap-3 px-5 mt-4">
        <button
          onClick={() => setPaymentMethod("Cash")}
          className={`px-4 min-h-[44px] w-full rounded-xl font-semibold border transition-colors ${
            paymentMethod === "Cash"
              ? "bg-emerald-600 border-emerald-600 text-white"
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          Cash
        </button>
        <button
          onClick={() => setPaymentMethod("Online")}
          className={`px-4 min-h-[44px] w-full rounded-xl font-semibold border transition-colors ${
            paymentMethod === "Online"
              ? "bg-emerald-600 border-emerald-600 text-white"
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          Online
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 px-5 mt-4 mb-5">
        <button
          onClick={() => setShowInvoice(true)}
          disabled={!orderInfo}
          className="pos-btn-ghost w-full"
        >
          Print Receipt
        </button>
        <button
          onClick={handlePlaceOrder}
          disabled={cartData.length === 0}
          className="pos-btn-primary w-full"
        >
          Place Order
        </button>
      </div>

      {showInvoice && (
        <Invoice orderInfo={orderInfo} setShowInvoice={setShowInvoice} />
      )}
    </>
  );
};

export default Bill;
