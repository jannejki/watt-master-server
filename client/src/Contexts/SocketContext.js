import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export function useSocket() {
    return useContext(SocketContext);
}

export function SocketProvider({ children, currentUser, onMessage }) {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (currentUser) {
            const newSocket = io('http://localhost:3000', {
                withCredentials: true,
            });

            newSocket.on('connect', () => {
                console.log('connected to socket server');
            });

            newSocket.on('disconnect', () => {
                console.log('disconnected from socket server');
            });

            newSocket.on('message', (message) => {
                if (onMessage) {
                    onMessage(message);
                }
            });

            setSocket(newSocket);

        }
    }, [currentUser, onMessage]);

    const sendMessage = (message) => {
        if (socket) {
            socket.emit('message', message);
        }
    };

    const value = {
        socket,
        sendMessage,
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
}