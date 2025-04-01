import React, { useState } from "react";
import { motion } from "framer-motion";
import { Lock, User, EyeOff, Eye } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import {
  signInFailure,
  signInStart,
  signInSuccess,
} from "../../app/user/userSlice";
import api from "../../api/axiosConfig";
import { useDispatch } from "react-redux";
import ScrollToTop from "../../components/ScrollToTop";
import ButtonGoogle from "../../components/ButtonGoogle";

const SignInPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ usernameOrEmail: "", password: "" });
  const [errors, setErrors] = useState({ usernameOrEmail: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateForm = () => {
    let formErrors = { ...errors };
    let isValid = true;

    if (!form.usernameOrEmail) {
      formErrors.usernameOrEmail = "Username or Email is required.";
      isValid = false;
    }
    if (!form.password) {
      formErrors.password = "Password is required.";
      isValid = false;
    }

    setErrors(formErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        setLoading(true);
        dispatch(signInStart());
        const response = await api.post("/v1/auth/signin", form);
        const data = response.data;
        dispatch(signInSuccess(data));
        navigate("/");
      } catch (error) {
        const errorMessage =
          error?.response?.data?.message || "An unexpected error occurred.";
        setErrors({
          ...errors,
          form: errorMessage,
        });
        dispatch(signInFailure(errorMessage));
      } finally {
        setLoading(false);
      }
    } else {
      console.log("Form has errors. Fix them first.");
    }
  };

  return (
    <MainLayout>
      <ScrollToTop />
      <div className="flex items-center justify-center h-fit my-4">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-xl"
        >
          <h2 className="text-2xl font-bold text-center text-primary cursor-default">
            Sign In
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-4 text-primary" size={20} />
              <input
                type="text"
                name="usernameOrEmail"
                value={form.usernameOrEmail}
                onChange={handleChange}
                placeholder="Username or Email"
                className="w-full p-3 pl-10 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-hidden"
              />
              {errors.usernameOrEmail && (
                <p className="text-red-500 text-xs my-2">
                  {errors.usernameOrEmail}
                </p>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-4 text-primary" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full p-3 pl-10 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-hidden"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-4 text-primary"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {errors.password && (
                <p className="text-red-500 text-xs my-2">{errors.password}</p>
              )}
            </div>
            <div className="text-right">
              <NavLink
                to="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot Password?
              </NavLink>
            </div>
            <button
              type="submit"
              className="w-full p-3 text-white bg-primary rounded-lg hover:bg-primary-dark transition-all"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
            {errors.form && (
              <p className="text-red-500 text-xs text-center">{errors.form}</p>
            )}
            <div className="text-center text-sm text-gray-600">
              Or continue with
            </div>
            <ButtonGoogle />
            <div className="text-center mt-4">
              <p className="text-sm">
                <span>Don't have an account? </span>
                <NavLink to="/signup" className="text-primary hover:underline">
                  Sign Up
                </NavLink>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default SignInPage;
