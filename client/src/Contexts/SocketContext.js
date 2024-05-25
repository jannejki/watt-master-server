import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export function useSocket() {
    return useContext(SocketContext);
}

export function SocketProvider({ children, currentUser }) {
    const [socket, setSocket] = useState(null);

    useEffect(() => {

        if (currentUser) {
            const newSocket = io('http://localhost:3000', {
                // The client has a httpOnly cookie called authorization that contains the JWT token           
                withCredentials: true,
            });

            newSocket.on('connect', () => {
                console.log('connected to socket server');
            });

            newSocket.on('disconnect', () => {
                console.log('disconnected from socket server');
            });

            newSocket.on('message', (message) => {
                console.log('message received: ', message);
            });

            setSocket(newSocket);

            return () => {
                console.log("Disconnected from socket")
                newSocket.disconnect();
            };
        }
    }, [currentUser]);

    async function sendMessage(message) {
        socket.emit('message', message);
    }

    const value = {
        socket,
        sendMessage
    }

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
}