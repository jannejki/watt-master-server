import React, { useEffect, useState } from 'react';
import Card from 'react-bootstrap/Card';
import Relay from './Relay';




export default function Device({ device, updateRelaySettings }) {


    return (
        <Card className="my-3 text-center col-6 m-auto">
            <Card.Title>{device.name}</Card.Title>
            <Card.Body>
                {device.relays.map((relay) => (
                    <Relay
                        key={relay.relay}
                        relay={relay}
                        updateRelaySettings={updateRelaySettings}
                        deviceId={device.uuid}
                    />
                ))}
            </Card.Body>
        </Card>
    );
}
