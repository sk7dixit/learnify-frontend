import React from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const PayPalButton = () => {
  return (
    <PayPalScriptProvider options={{ "client-id": "YOUR_SANDBOX_CLIENT_ID", currency: "USD" }}>
      <PayPalButtons
        style={{ layout: "vertical" }}
        createOrder={async () => {
          // Call backend to create PayPal order
          const res = await fetch("http://localhost:5000/api/payments/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: "10.00" }) // Example $10
          });

          const order = await res.json();
          return order.id;
        }}
        onApprove={async (data) => {
          // Capture the order
          const res = await fetch(`http://localhost:5000/api/payments/capture-order/${data.orderID}`, {
            method: "POST",
          });

          const details = await res.json();
          alert("✅ Payment successful! " + JSON.stringify(details));
        }}
      />
    </PayPalScriptProvider>
  );
};

export default PayPalButton;
