import { Device, DeviceFromDatabase, Relay } from "../typings/database/dto/Device.dto";

/**
 * @param relaysString - a string containing relay information. Must be like this: '{"(auto,off,$0.00)","(manual,on,$0.00)"}'. This is due the way database stores the information.
 * @returns {Relay[]} - an array of relays [{mode: 'auto' | 'manual', state: 'on' | 'off', threshold: number}
 */
function parseRelays(relaysString: string): Relay[] {
    let parsedRelayString = relaysString.replace(/[\{\}\"]/g, '');
    return parsedRelayString.split('),(').map((relay, i) => {

        relay = relay.replace(/\(|\)/g, '');
        let [mode, state, threshold] = relay.split(',');
        threshold = threshold.replace('$', '');
        return {
            relay: i,
            mode: mode as 'auto' | 'manual',
            state: state as 'on' | 'off',
            threshold: parseFloat(threshold),
            price: undefined
        }
    });
}

/**
 * @param device - a device object from the database
 * @returns {Device} - a device object with the relays parsed
 */
export function parseDevice(device: any): Device {
    const relays = parseRelays(device.relays);

    return {
        ...device,
        relays: relays,
    };
}


export function parseStatus(status: string): Relay {

    const params = new URLSearchParams(status);
    const relayStatus = Object.fromEntries(params.entries());

    if (!relayStatus.relay || !relayStatus.mode || !relayStatus.state || !relayStatus.threshold) throw new Error(`Invalid status message: ${status}. Found values from status messages: ${Object.keys(relayStatus).forEach(key => key + "= " + relayStatus[key])}`);

    if (isNaN(parseFloat(relayStatus.threshold))) throw new Error(`Invalid threshold value: ${relayStatus.threshold}`);
    if (isNaN(parseInt(relayStatus.relay))) throw new Error(`Invalid relay value: ${relayStatus.relay}`);
    if (relayStatus.mode !== 'auto' && relayStatus.mode !== 'manual') throw new Error(`Invalid mode value: ${relayStatus.mode}`);
    if (relayStatus.state !== 'on' && relayStatus.state !== 'off') throw new Error(`Invalid state value: ${relayStatus.state}`);

    return {
        relay: parseInt(relayStatus.relay),
        mode: relayStatus.mode as 'auto' | 'manual',
        state: relayStatus.state as 'on' | 'off',
        threshold: parseFloat(relayStatus.threshold),
        price: relayStatus.price ? parseFloat(relayStatus.price) : undefined,
    }

}