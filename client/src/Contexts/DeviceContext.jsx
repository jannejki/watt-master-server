import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSocket } from './SocketContext';

const DeviceContext = createContext();

export function useDevices() {
    return useContext(DeviceContext);
}

export function DeviceProvider({ children }) {
    const [devices, setDevices] = useState([]);
    const [loadingDevices, setLoadingDevices] = useState(true);
    const { sendMessage } = useSocket();
    useEffect(() => {
        // Check if the user is already logged in
        async function getDevices() {
            try {

                const response = await fetch('https://localhost/api/devices', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });
                if (response.status !== 200) {
                    throw new Error('Virhe haetteassa laitteita!');
                }

                const devices = await response.json();
                setDevices(devices);
            } catch (error) {
                console.error(error);
            } finally {
                setLoadingDevices(false);
            }
        }

        getDevices();
    }, []);

    async function relayUpdate(deviceID, relayID, settings) {
        sendMessage({ deviceID, relayID, settings });
    }

    const value = {
        devices,
        loadingDevices,
        relayUpdate,
    };

    return (
        <DeviceContext.Provider value={value}>
            {children}
        </DeviceContext.Provider>
    );
}