import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  signOutFailure,
  signOutStart,
  signOutSuccess,
} from "../app/user/userSlice";
import { toast } from "react-toastify";
import { LogOut } from "lucide-react";

const SignOut = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const confirmSignOut = () => {
    dispatch(signOutStart());
    setLoading(true);
    try {
      dispatch(signOutSuccess());
      navigate("/signin");
      toast.success("Signout successful!");
    } catch (error) {
      setLoading(false);
      dispatch(signOutFailure());
    } finally {
      setLoading(false);
    }
  };
  const handleSignOutClick = () => {
    const isConfirmed = window.confirm("Are you sure you want to sign out?");
    if (isConfirmed) {
      confirmSignOut();
    }
  };
  return (
    <>
      <button
        onClick={handleSignOutClick}
        className="flex items-center text-secondary hover:text-text transition duration-300"
        disabled={loading}
      >
        <LogOut className="mr-2" />
        {loading ? "Loading..." : "Sign Out"}
      </button>
    </>
  );
};

export default SignOut;
