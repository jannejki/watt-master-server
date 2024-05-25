import React from 'react';
import { useAuth } from '../Contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Self() {
    const navigate = useNavigate();
    const { logout } = useAuth();

    async function handleLogout() {
        try {
            await logout();
            navigate('/login');
        } catch (error) {

        }
    }

    async function getSelfData() {
        const response = await fetch('https://localhost:443/self', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            // set cookie
            credentials: 'include',
        });

        if (response.ok) {
            const data = await response.json();
            console.log(data);
        } else {
            console.log("Error");
        }
    }

    return (
        <div>
            <p>Minä</p>
            <Link to={"/"}>dashboard</Link>
            <button onClick={getSelfData}>Self data</button>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
}