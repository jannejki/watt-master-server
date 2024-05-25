import React from 'react';
import Container from 'react-bootstrap/Container';
import { useDevices } from '../Contexts/DeviceContext';
import Device from '../Components/Device';

export default function Dashboard() {
    const { devices, relayUpdate } = useDevices();


    return (
        <Container fluid="xl" className="text-center">
            <h1>Laitteet</h1>
            {devices.map(device => (
                <Device key={device.id} device={device} onRelayChange={relayUpdate} />
            ))}
        </Container>
    );
}