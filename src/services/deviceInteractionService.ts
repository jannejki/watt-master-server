import knexInstance from "../config/knex";
import { Device } from "../typings/database/dto/Device.dto";
import { sendMQTTMessage } from "./MQTT";
import { PING_TOPIC } from "../config/MQTT";

const deviceInteractionService = {
    pingDevice: async (device: Device) => {
        let topic = PING_TOPIC.replace("<uuid>", device.uuid);
        sendMQTTMessage(topic, "status");

    },

    pingAllDevicesOfUser: async (userId: number) => {
        // Get all devices of the user from the database
        const devices = await knexInstance("devices").where({ owner_id: userId });

        // Send a ping to each device
        for (const device of devices) {
            await deviceInteractionService.pingDevice(device);
        }
    }
}

export default deviceInteractionService;