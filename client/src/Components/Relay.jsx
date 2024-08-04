import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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


export default function Relay(props) {
    const [state, setState] = useState(props.relay.state);
    const [mode, setMode] = useState(props.relay.mode);
    const [threshold, setThreshold] = useState(props.relay.threshold);
    const [loading, setLoading] = useState(false);

    const handleStateChange = () => {
        const newState = state === RelayState.ON ? RelayState.OFF : RelayState.ON;
        props.updateRelaySettings(props.deviceId, props.relay.relay, { state: newState });
        setState(RelayState.LOADING);
        setLoading(true);
        props.waitForStatusUpdate();
    };

    const handleModeChange = () => {
        const newMode = mode === RelayMode.AUTO ? RelayMode.MANUAL : RelayMode.AUTO;
        props.updateRelaySettings(props.deviceId, props.relay.relay, { mode: newMode });
        setMode(RelayMode.LOADING);
        setLoading(true);
        props.waitForStatusUpdate();
    };

    const sendRequest = useCallback(() => {
        props.updateRelaySettings(props.deviceId, props.relay.relay, { threshold });
        props.waitForStatusUpdate();
    }, [props, threshold]);

    useEffect(() => {
    }, [props.timeouted])

    const ref = useRef(sendRequest);
    useEffect(() => {
        ref.current = sendRequest;
    }, [sendRequest]);

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
        setState(props.relay.state);
        setMode(props.relay.mode);
        setThreshold(props.relay.threshold);
        setLoading(false);

    }, [props.relay]);

    useEffect(() => {
        setLoading(!props.networkStatus);
    }, [props.networkStatus]);

    return (
        <Row className="relay p-2 m-2" key={props.relay.relay}>
            <h2>Rele {props.relay.relay + 1}</h2>
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
                <label htmlFor={`threshold-${props.relay.relay}`} className="mx-auto">Threshold:</label>
                <input
                    type="number"
                    className="col-8 mx-auto"
                    id={`threshold-${props.relay.relay}`}
                    name="threshold"
                    disabled={loading}
                    value={threshold}
                    onChange={handleThresholdChange}
                />
            </div>
        </Row>
    );
}