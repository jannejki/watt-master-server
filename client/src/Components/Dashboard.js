import React from 'react';
import { useAuth } from '../Contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";

export default function Dashboard() {
    const navigate = useNavigate();
    const { logout } = useAuth();

    async function handleLogout() {
        try {
            await logout();
            navigate('/login');
        } catch (error) {

        }
    }

    return (
        <div>
            <p>Dashboard</p>
            <Link to={"/self"}>self</Link>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
}