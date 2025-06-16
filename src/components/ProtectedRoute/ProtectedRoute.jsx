import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../../Context/UserContext";

const ProtectedRoute = ({ children }) => {
  const { user } = useUser();

  // إذا كان التحميل لا يزال جارياً (user لم يتم التحقق منه بعد)
  if (user === undefined) {
    return null; // أو عرض spinner تحميل
  }

  // إذا كان هناك مستخدم مسجل دخوله
  if (user?.token) {
    return children;
  }

  // إذا لم يكن مسجل دخول
  return <Navigate to="/login" replace />;
};

export default ProtectedRoute; // تصدير افتراضي