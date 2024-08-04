import React, { useEffect, useState } from 'react';
import Card from 'react-bootstrap/Card';
import Relay from './Relay';


export const DeviceStatus = Object.freeze({
    ONLINE: true,
    OFFLINE: false,
});

export default function Device(props) {
    const [networkStatus, setNetworkStatus] = useState(DeviceStatus.OFFLINE);
    const [networkTimeout, setNetworkTimeout] = useState(null);
    const [deviceTimeouted, setDeviceTimeouted] = useState(false);

    useEffect(() => {
        if (props.device.networkStatus) {
            setNetworkStatus(DeviceStatus.ONLINE);
            clearTimeout(networkTimeout);
            setNetworkTimeout(null);
            setDeviceTimeouted(false);
        } else {
            setNetworkStatus(DeviceStatus.OFFLINE);
        }

    }, [props.device, networkTimeout]);

    async function waitForStatusUpdate() {
        let timeout = setTimeout(() => {
            setNetworkStatus(DeviceStatus.OFFLINE);
            setDeviceTimeouted(true);
        }, 5000);

        setNetworkTimeout(timeout);
    }

    return (
        <Card className="my-3 text-center col-lg-6 m-auto">
            {props.device.online ? (
                <Card.Header className="text-success">Online</Card.Header>
            ) : <Card.Header className="text-danger">Offline</Card.Header>}
          
            <Card.Title>{props.device.name}</Card.Title>
            <Card.Body>
                {props.device.relays.map((relay) => (
                    <Relay
                        key={relay.relay}
                        relay={relay}
                        updateRelaySettings={props.updateRelaySettings}
                        deviceId={props.device.uuid}
                        networkStatus={props.device.online}
                        waitForStatusUpdate={waitForStatusUpdate}
                        timeouted={deviceTimeouted}
                    />
                ))}
            </Card.Body>
        </Card>
    );
}
