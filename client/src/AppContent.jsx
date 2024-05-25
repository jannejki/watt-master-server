import React, { useState } from 'react';
import { useAuth } from './Contexts/AuthContext';
import { SocketProvider } from './Contexts/SocketContext';
import { DeviceProvider } from './Contexts/DeviceContext';
import Dashboard from './Pages/Dashboard';

function AppContent() {
    const { currentUser } = useAuth();
    const [messages, setMessages] = useState([]);

    const handleMessage = (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
        // You can add additional logic here to handle the message, e.g., update devices
    };

    return (
        <SocketProvider currentUser={currentUser} onMessage={handleMessage}>
            <DeviceProvider>
                <Dashboard messages={messages} />
            </DeviceProvider>
        </SocketProvider>
    );
}

export default AppContent;