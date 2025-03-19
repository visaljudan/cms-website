import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { NavLink } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    setError(""); // Clear error when typing
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Simple email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email) {
      setError("Email is required.");
      return;
    }
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Simulate sending reset link and show modal
    setMessage(
      "If this email is registered, you will receive a password reset link shortly."
    );
    setShowModal(true);
    setEmail(""); // Clear the email field
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg"
      >
        <h2 className="text-2xl font-bold text-center">Forgot Password?</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="email"
              name="email"
              value={email}
              onChange={handleChange}
              placeholder="Enter your email address"
              className="w-full p-3 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {error && <p className="text-red-500 text-xs">{error}</p>}
          </div>
          {message && <p className="text-green-500 text-xs">{message}</p>}
          <button
            type="submit"
            className="w-full p-3 text-white bg-primary rounded-lg hover:bg-primary-dark transition-all"
          >
            Send Reset Link
          </button>
          <div className="text-center text-sm text-gray-600">
            <NavLink to="/signin" className="text-primary hover:underline">
              Back to Sign In
            </NavLink>
          </div>
        </form>
      </motion.div>

      {/* Modal for success message */}
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50"
        >
          <motion.div
            initial={{ y: "-100px" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white p-8 rounded-xl shadow-lg w-96 text-center"
          >
            <h3 className="text-xl font-semibold mb-4">
              Password Reset Link Sent!
            </h3>
            <p className="text-gray-600 mb-6">
              If this email is registered, you will receive a password reset
              link shortly.
            </p>
            <NavLink
              to="/signin"
              className="w-full p-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all"
            >
              Done
            </NavLink>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default ForgotPassword;
