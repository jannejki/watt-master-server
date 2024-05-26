import React, { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import { useDevices } from '../Contexts/DeviceContext';
import Device from '../Components/Device';

export default function Dashboard({ messages }) {
    const { devices, updateRelaySettings } = useDevices();
    const [deviceElements, setDeviceElements] = useState(devices);

    // Initialize device elements on mount and when devices change
    useEffect(() => {
        setDeviceElements(devices);
    }, [devices]);

    // Handle new messages
useEffect(() => {
    if (messages.length > 0) {
        const latestMessage = messages[messages.length - 1];

        if (latestMessage && latestMessage.id) {
            setDeviceElements(prevDeviceElements => {
                return prevDeviceElements.map((device) => {
                    if (device.uuid === latestMessage.uuid) {
                        return latestMessage;
                    }
                    return device;
                });
            });
        } else {
            console.error("Latest message does not have the expected structure:", latestMessage);
        }
    }
}, [messages]);
    return (
        <Container fluid="xl" className="text-center">
            <h1>Devices</h1>
            {deviceElements.map(device => (
                <Device key={device.id} device={device} updateRelaySettings={updateRelaySettings} />
            ))}
        </Container>
    );
}
