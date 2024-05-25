import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../Contexts/AuthContext';
import { DeviceProvider } from "../Contexts/DeviceContext";
export default function PrivateRoute({ children }) {
    const { currentUser, loadingUser } = useAuth();

    if (loadingUser) return <p>Loading...</p>;

    return currentUser ? <DeviceProvider>{children}</DeviceProvider> : <Navigate to="/login" replace />;
};