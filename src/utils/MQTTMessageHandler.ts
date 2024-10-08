import knexInstance from "../config/knex";
import { sendMQTTMessage } from "../services/MQTT";
import { sendMessageToClient } from "../services/socket";
import { Device, Relay, RelayCommand } from "../typings/database/dto/Device.dto";
import { parseDevice, parseStatus } from "./parseDevice";
import { getCurrentPrice } from "./priceUpdater";

const MQTTMessageHandler = {

    /**
     * @brief Handles a new device connecting to the MQTT broker
     * @param uuid - the device that has connected to the MQTT broker
     */
    async newDevice(uuid: string): Promise<void> {
        const foundDeviceData = await knexInstance('devices').select('*').where('uuid', uuid).first();

        if (foundDeviceData) {
            let device = parseDevice(foundDeviceData);

            let result = await knexInstance('devices').where('uuid', uuid).update({ online: true });
            let updated = await knexInstance('devices').select('*').where('uuid', uuid).first();

            // send a command to the device to turn on the relay
            if (!process.env.MQTT_COMMAND_TOPIC) throw new Error("MQTT_TOPIC not set");

            let topic = process.env.MQTT_COMMAND_TOPIC.replace("<uuid>", device.uuid);
            let currentPrice = await getCurrentPrice();

            device.relays.forEach((relay, i) => {
                let message = `relay=${i}&mode=${relay.mode}${relay.mode == 'manual' ? `&state=${relay.state}` : ''}&threshold=${relay.threshold}&price=${currentPrice}`;
                sendMQTTMessage(topic, message);
            });
        }
    },


    /**
     * @brief Checks if the status message is from a known device and checks if the relay has changed. If it has, updates the database
     * @param uuid the UUID of the device that has sent the status message
     * @param message the status message from the device
     * @returns {Promise<void>}
     */
    async status(uuid: string, message: string): Promise<void> {
        // Parse the uuid from the topic
        try {
            const foundDeviceData = await knexInstance('devices').select('*').where({ uuid }).first();
            if (!foundDeviceData) throw new Error(`Status message from unknown device: ${message}`);

            let device = parseDevice(foundDeviceData);
            let relay = parseStatus(message.toString());


            let updateQuery = `
UPDATE devices
SET relays[${relay.relay + 1}] = ('${relay.mode}', '${relay.state}', ${relay.threshold}),
    online = true
WHERE uuid = '${uuid}'
`;

            // Execute the raw SQL query
            await knexInstance.raw(updateQuery);

            let updatedDeviceData = await knexInstance('devices').select('*').where({ uuid }).first();
            if (!updatedDeviceData) throw new Error(`Device not found: ${uuid}`);
            updatedDeviceData = parseDevice(updatedDeviceData);
            sendMessageToClient(device.owner_id, updatedDeviceData);

        } catch (error) {
            console.error(error);
        }
    },

    async sendCommand(uuid: string, command: RelayCommand): Promise<void> {
        const foundDeviceData = await knexInstance('devices').select('*').where({ uuid }).first();
        if (!foundDeviceData) throw new Error(`Status message from unknown device: ${uuid}`);

        let device = parseDevice(foundDeviceData);
        if (!device) throw new Error(`Device not found: ${uuid}`);
        if (!process.env.MQTT_COMMAND_TOPIC) throw new Error("MQTT_TOPIC not set");
        let topic = process.env.MQTT_COMMAND_TOPIC.replace("<uuid>", device.uuid);

        let message = `relay=${command.relay}`;
        message += command.mode ? `&mode=${command.mode}` : '';
        message += command.state ? `&state=${command.state}` : '';
        message += command.threshold ? `&threshold=${command.threshold}` : '';
  
        sendMQTTMessage(topic, message);
    },

    async deviceLastWill(uuid: string): Promise<void> {
        try {
            let device = await knexInstance('devices').select('*').where('uuid', uuid).first();

            if (!device) throw new Error(`Device not found: ${uuid}`);
            await knexInstance('devices').where('uuid', uuid).update({ online: false });

            let updatedDeviceData = await knexInstance('devices').select('*').where({ uuid }).first();
            let parsedDevice = parseDevice(updatedDeviceData);
            sendMessageToClient(device.owner_id, parsedDevice);

        } catch (error) {
            console.error(error);
        }
    },
}

export default MQTTMessageHandler;


//=================================================//
//         Helper functions for MQTTMessageHandler  //
//=================================================//

/**
 * @brief checks if relay has changed. Compares a single relay object against the device object's relay
 * @param device {Device} - the device object
 * @param relay  {Relay} - the relay object
 * @returns {Boolean} - true if the relay has changed, false otherwise
 */
function relayHasChanged(device: Device, relay: Relay): boolean {
    return device.relays[relay.relay]?.mode != relay.mode
        || device.relays[relay.relay]?.state != relay.state
        || device.relays[relay.relay]?.threshold != relay.threshold;
}