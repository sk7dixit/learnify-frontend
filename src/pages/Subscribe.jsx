import React from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import api from "../services/api"; // *** FIX: Import the configured api instance
import { useAuth } from '../context/AuthContext';

// It's best practice to load this from environment variables
const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;

function Subscribe() {
  const { user, updateUserProfile } = useAuth();
  const [message, setMessage] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [selectedPlan, setSelectedPlan] = React.useState("monthly");
  const [planAmount, setPlanAmount] = React.useState(null);

  const plans = [
    { id: "weekly", name: "Weekly", price: 5.00, display: "$5", duration: "7 days" },
    { id: "monthly", name: "Monthly", price: 15.00, display: "$15", duration: "30 days" },
    { id: "semester", name: "Semester", price: 60.00, display: "$60", duration: "180 days" },
  ];

  React.useEffect(() => {
    const currentPlan = plans.find(p => p.id === selectedPlan);
    setPlanAmount(currentPlan ? currentPlan.price.toFixed(2) : null);
  }, [selectedPlan]);

  if (!user?.is_subscription_enabled) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-4">
        <h2 className="text-2xl font-bold mb-4 text-yellow-300">Subscriptions Temporarily Disabled</h2>
        <p className="text-gray-300">The site administrator is not accepting new subscriptions at this time.</p>
      </div>
    );
  }

  const createOrder = async () => {
    setMessage("");
    if (!selectedPlan || !planAmount) {
      setMessage("Please select a valid plan.");
      return Promise.reject(new Error("Plan not selected"));
    }
    try {
      // *** FIX: Use the 'api' instance which automatically adds the auth token
      const response = await api.post("/payments/create-order", {
        plan: selectedPlan,
        amount: planAmount
      });
      return response.data.id;
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to create PayPal order.";
      setMessage(`❌ ${errorMsg}`);
      return Promise.reject(err);
    }
  };

  const onApprove = async (data) => {
    setMessage("Processing payment...");
    setLoading(true);
    try {
      // *** FIX: Use the 'api' instance
      const response = await api.post(`/payments/capture-order/${data.orderID}`);
      if (response.data.status === 'COMPLETED') {
        setMessage("✅ Payment successful! Your subscription is now active.");
        // Refresh user profile to get new subscription status
        const profileRes = await api.get("/users/profile");
        updateUserProfile(profileRes.data);
      } else {
        setMessage(`⚠️ Payment status: ${response.data.status}. Please contact support.`);
      }
    } catch (err) {
      setMessage(err.response?.data?.error || "Payment failed. Please contact support.");
    } finally {
      setLoading(false);
    }
  };

  const onError = (err) => {
    setMessage("❌ An error occurred with the PayPal transaction.");
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="bg-gray-800 border border-cyan-500 rounded-xl p-8 shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-cyan-400">Choose a Plan</h2>
        <div className="grid grid-cols-3 gap-4 mb-8">
          {plans.map((plan) => (
            <div key={plan.id} onClick={() => setSelectedPlan(plan.id)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all text-center ${selectedPlan === plan.id ? "border-cyan-400 scale-105 bg-gray-700" : "border-gray-600 hover:border-gray-500"}`}>
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <p className="text-lg font-semibold text-purple-400">{plan.display}</p>
            </div>
          ))}
        </div>
        {selectedPlan && planAmount && (
          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-xl font-bold mb-4 text-center">Pay with PayPal</h3>
            <p className="text-center text-gray-400 mb-4">Total Due: <span className="text-cyan-400 font-bold">${planAmount}</span></p>
            <PayPalScriptProvider options={{ "client-id": PAYPAL_CLIENT_ID, currency: "USD" }}>
              <PayPalButtons style={{ layout: "vertical" }} disabled={loading} forceReRender={[selectedPlan, planAmount]}
                createOrder={createOrder} onApprove={onApprove} onError={onError} />
            </PayPalScriptProvider>
          </div>
        )}
        {message && <p className={`mt-6 text-center font-medium ${message.startsWith('✅') ? 'text-green-400' : 'text-red-400'}`}>{message}</p>}
      </div>
    </div>
  );
}

export default Subscribe;
