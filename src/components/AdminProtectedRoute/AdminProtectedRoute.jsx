import React from "react";
import { Navigate } from "react-router-dom";
import { useAdmin } from "../../Context/AdminContext";

const AdminProtectedRoute = ({ children }) => {
    const { admin } = useAdmin();


    if (admin?.token) {
        return children;
    }

    return <Navigate to="/admin/login" />;
};

export default AdminProtectedRoute;
