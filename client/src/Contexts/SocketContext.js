import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export function useSocket() {
    return useContext(SocketContext);
}

export function SocketProvider({ children, currentUser, onDeviceUpdate }) {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (!socket && currentUser) {
            const newSocket = io('http://localhost:3000', {
                withCredentials: true,
            });
            setSocket(newSocket);


            newSocket.on('connect', () => {
                console.log('connected to socket server');
            });

            newSocket.on('disconnect', () => {
                console.log('disconnected from socket server');
            });

            newSocket.on('deviceUpdate', (message) => {
                if (onDeviceUpdate) {
                    onDeviceUpdate(message);
                }
            });
        }
    }, [currentUser, onDeviceUpdate, socket]);

    const sendCommand = (message) => {
        if (socket) {
            socket.emit('deviceCommand', message);
        }
    };

    const value = {
        socket,
        sendCommand,
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
}