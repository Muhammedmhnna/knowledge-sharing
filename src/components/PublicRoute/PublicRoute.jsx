import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../../Context/UserContext";


const PublicRoute = (props) => {
    const { user, isUserLoading } = useUser();



    if (!user?.token) {
        return props.children;
    } else {
        return <Navigate to={'/home'} />;
    }
};

export default PublicRoute;
