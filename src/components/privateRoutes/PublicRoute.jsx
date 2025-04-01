import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const PublicRoute = () => {
  const { currentUser } = useSelector((state) => state.user);
  const isAuthenticated = !!currentUser;

  return isAuthenticated ? <Navigate to="/" /> : <Outlet />;
};

export default PublicRoute;
