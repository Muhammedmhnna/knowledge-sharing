import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../../Context/UserContext";

const PublicRoute = (props) => {
    const { user, isUserLoading } = useUser();

    if (isUserLoading) {
        return <div>Loading...</div>; // أو Spinner هنا
    }

    if (!user?.token) {
        return props.children;
    }

    return <Navigate to="/home" replace />;
};

export default PublicRoute;
