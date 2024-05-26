import React, { useEffect, useMemo, useRef, useState } from 'react';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import debounce from '../Utils/debounce';

export const RelayState = Object.freeze({
    ON: "on",
    OFF: "off",
    LOADING: "Ladataan...",
});

export const RelayMode = Object.freeze({
    AUTO: "auto",
    MANUAL: "manual",
    LOADING: "Ladataan...",
});


export default function Relay({ relay, updateRelaySettings, deviceId }) {
    const [state, setState] = useState(relay.state);
    const [mode, setMode] = useState(relay.mode);
    const [threshold, setThreshold] = useState(relay.threshold);
    const [loading, setLoading] = useState(false);

    const handleStateChange = () => {
        const newState = state === RelayState.ON ? RelayState.OFF : RelayState.ON;
        updateRelaySettings(deviceId, relay.relay, { state: newState });
        setState(RelayState.LOADING);
        setLoading(true);
    };

    const handleModeChange = () => {
        const newMode = mode === RelayMode.AUTO ? RelayMode.MANUAL : RelayMode.AUTO;
        updateRelaySettings(deviceId, relay.relay, { mode: newMode });
        setMode(RelayMode.LOADING);
        setLoading(true);
    };

    const sendRequest = () => {
        updateRelaySettings(deviceId, relay.relay, { threshold });
    };


    const ref = useRef(sendRequest);
    useEffect(() => {
        ref.current = sendRequest;
    }, [threshold]);

    const debouncedCallback = useMemo(() => {
        const func = () => {
            ref.current?.();
        };
        return debounce(func, 1000);
    }, []);


    const handleThresholdChange = (e) => {
        const newThreshold = e.target.value;
        setThreshold(newThreshold);
        debouncedCallback();
    };

    useEffect(() => {
        setState(relay.state);
        setMode(relay.mode);
        setThreshold(relay.threshold);
        setLoading(false);
    }, [relay]);

    return (
        <Row className="relay p-2 m-2" key={relay.relay}>
            <h2>Relay {relay.relay + 1}</h2>
            <Button
                className="col-lg-4 m-auto my-1"
                variant={state === RelayState.ON ? "success" : "light"}
                disabled={loading}
                onClick={handleStateChange}
            >
                {state}
            </Button>
            <Button
                className="col-lg-4 mx-auto my-1"
                variant={mode === RelayMode.AUTO ? "success" : "warning"}
                disabled={loading}
                onClick={handleModeChange}
            >
                {mode}
            </Button>
            <div className="col-12 d-flex justify-content-between">
                <label htmlFor={`threshold-${relay.relay}`} className="mx-auto">Threshold:</label>
                <input
                    type="number"
                    className="col-8 mx-auto"
                    id={`threshold-${relay.relay}`}
                    name="threshold"
                    disabled={loading}
                    value={threshold}
                    onChange={handleThresholdChange}
                />
            </div>
        </Row>
    );
}