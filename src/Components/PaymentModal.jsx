import React, { useState, useEffect } from 'react';
import assets from '../assets/assets';
import { createRazorpayOrder } from '../api';

const PaymentModal = ({ isOpen, onClose, onPaymentSuccess, amount, hotelName, bookingId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && bookingId) {
      handleRazorpayPayment();
    }
  }, [isOpen]);

  const handleRazorpayPayment = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Create order on backend
      const response = await createRazorpayOrder(bookingId);
      const order = JSON.parse(response.data); // Backend returns JSON string of Order

      // 2. Configure Razorpay options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Pavan Hotel ",
        description: `Booking for ${hotelName}`,
        order_id: order.id,
        handler: function (response) {
          // Payment successful
          onPaymentSuccess(response.razorpay_order_id || order.id);
        },
        prefill: {
          name: "",
          email: "",
          contact: ""
        },
        theme: {
          color: "#2563eb"
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
            onClose();
          }
        }
      };

      // 3. Open Razorpay
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setError(response.error.description);
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      console.error("Razorpay error:", err);
      setError(err.message || "Failed to initialize payment");
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="bg-primary p-4 text-white flex justify-between items-center">
          <h3 className="font-semibold text-lg">Secure Payment</h3>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="bg-gray-200 text-primary px-4 py-1 rounded-lg font-semibold hover:bg-gray-300 transition-all"
            >
              Cancel
            </button>
            <button onClick={onClose} className="hover:bg-white/20 rounded-full p-1 transition-colors">
              <img src={assets.closeIcon} alt="close" className="w-4 h-4 invert" />
            </button>
          </div>
        </div>

        <div className="p-8 flex flex-col items-center text-center">
          {loading ? (
            <div className="py-12 flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
              <h2 className="text-2xl font-bold text-blue-950 mb-2">Preparing Payment...</h2>
              <p className="text-gray-500">Please wait while we connect to Razorpay</p>
            </div>
          ) : error ? (
            <div className="py-12 flex flex-col items-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <span className="text-4xl">❌</span>
              </div>
              <h2 className="text-2xl font-bold text-red-600 mb-2">Payment Failed</h2>
              <p className="text-gray-600 mb-8">{error}</p>
              <button 
                onClick={handleRazorpayPayment}
                className="bg-primary text-white py-3 px-8 rounded-xl font-semibold shadow-lg hover:scale-[1.02] transition-all"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-blue-950 mb-2">Payment Initialized</h2>
              <p className="text-gray-500">Redirecting to Razorpay checkout...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
