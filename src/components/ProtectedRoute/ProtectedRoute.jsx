import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../../Context/UserContext";

const ProtectedRoute = ({ children }) => {
  const { user } = useUser();


  if (user?.token) {
    return children;
  }

  return <Navigate to="/login" />;
};

export default ProtectedRoute;
