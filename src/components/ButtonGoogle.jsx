import React, { useState } from "react";
import { auth, provider, signInWithPopup } from "../firebase";
import api from "../api/axiosConfig";
import { signInSuccess } from "../app/user/userSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useRoleHook } from "../hooks/useRoleHook";

const ButtonGoogle = ({ onSuccess, onError }) => {
  const [error, setError] = useState();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { roles } = useRoleHook();
  const roleUser = roles?.data?.find((role) => role.slug === "user");
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      console.log(result.user);
      const response = await api.post("/v1/auth/google", {
        username: result.user.displayName,
        email: result.user.email,
        avatar: result.user.photoURL,
        roleId: roleUser?._id,
      });
      const data = response.data;
      dispatch(signInSuccess(data));
      navigate("/");
    } catch (error) {
      setError(error.message || "Fail to continue with google account.");
    }
  };

  return (
    <>
      <button
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center p-3 text-third border border-primary bg-primary hover:bg-third hover:text-primary font-bold rounded-xl transition-all"
        aria-label="Continue with Google"
      >
        <img
          src="https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/dark/google-color.png"
          alt="Google"
          className="w-5 h-5 mr-2"
        />
        Continue with Google
      </button>
      {error && <p className="text-red-500 text-xs text-center">{error}</p>}
    </>
  );
};

export default ButtonGoogle;
