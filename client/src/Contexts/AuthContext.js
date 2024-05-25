import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);

    async function login(email, password) {
        console.log(email, password);
        const response = await fetch('https://localhost:443/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: email, password: password }),
            credentials: 'include', // Include cookies in the request
        });

        if (response.ok) {
            const data = await response.json();
            setCurrentUser(data); // Update currentUser state
            return true; // Indicate login success
        } else {
            return false; // Indicate login failure
        }
    }

    async function logout() {
        const response = await fetch('https://localhost:443/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Include cookies in the request
        });
        if (response.ok) {
            setCurrentUser(null); // Update currentUser state
        } else {
            alert("Logout failed!");
        }

    }


    useEffect(() => {
        // Check if the user is already logged in
        async function checkAuth() {

            // Check session storage or any other method to fetch the user
            const response = await fetch('https://localhost:443/self', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Include cookies in the request
            });

            if (!response.ok) {
                setLoadingUser(false);
                return;
            }

            const user = await response.json();
            if (user) {
                setCurrentUser(user);
            }
            setLoadingUser(false);
        }

        checkAuth();
    }, []);


    const value = {
        currentUser,
        login,
        logout,
        loadingUser
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}