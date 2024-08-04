import React, { useState } from 'react';
import { useAuth } from './Contexts/AuthContext';
import { SocketProvider } from './Contexts/SocketContext';
import { DeviceProvider } from './Contexts/DeviceContext';
import Dashboard from './Pages/Dashboard';
import Navigation from './Components/Navbar';

function AppContent() {
    const { currentUser } = useAuth();
    const [messages, setMessages] = useState([]);
    const [price, setPrice] = useState(undefined);

    const deviceUpdate = (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
        // You can add additional logic here to handle the message, e.g., update devices
    };

    const priceUpdate = (message) => {
        setPrice(message.hour0);
        console.log("Setting price to: ", message.hour0);
        // You can add additional logic here to handle the message, e.g., update prices
    }

    return (
        <SocketProvider currentUser={currentUser} onDeviceUpdate={deviceUpdate} onPriceUpdate={priceUpdate}>
            <Navigation price={price} />
            <DeviceProvider>
                <Dashboard messages={messages} />
            </DeviceProvider>
        </SocketProvider>
    );
}

export default AppContent;