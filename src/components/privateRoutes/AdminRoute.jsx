import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const AdminRoute = () => {
  const { currentUser } = useSelector((state) => state.user);
  const isAuthenticated = !!currentUser;
  const isAdmin = currentUser?.data?.user?.roleId?.slug === "admin";

  return isAuthenticated && isAdmin ? <Outlet /> : <Navigate to="/" />;
};

export default AdminRoute;
