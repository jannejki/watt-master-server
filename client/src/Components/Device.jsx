import React from 'react';
import Card from 'react-bootstrap/Card';
import Relay from './Relay';

export default function Device({ device, onRelayChange }) {
    return (
        <Card className="my-3 text-center col-6 m-auto" key={device.id}>
            <Card.Title>{device.name}</Card.Title>
            <Card.Body>
                {device.relays.map((relay) => (
                    <Relay 
                        key={relay.relay} 
                        relay={relay} 
                        onRelayChange={onRelayChange} 
                        deviceId={device.uuid}
                    />
                ))}
            </Card.Body>
        </Card >
    );
}
