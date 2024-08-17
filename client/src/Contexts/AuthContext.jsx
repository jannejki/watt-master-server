import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);

    async function login(email, password) {
        const response = await fetch(process.env.REACT_APP_API_BASE_URL + '/login', {
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
            return { success: true, user: currentUser, message: null }; // Indicate login success
        } else {
            let data = await response.json();
            if (response.status === 401) {
                return { success: false, user: null, message: data.message }; // Indicate login success
            } else {
                return { success: false, user: null, message: data.message }; // Indicate login success
            }
        }
    }

    async function logout() {
        const response = await fetch(process.env.REACT_APP_API_BASE_URL + '/logout', {
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

            try {

                // Check session storage or any other method to fetch the user
                const response = await fetch(process.env.REACT_APP_API_BASE_URL + '/self', {
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
            } catch (error) {
                console.error("AuthContext error: ", error);
            }
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