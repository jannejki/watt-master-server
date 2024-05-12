import mqtt from 'mqtt';
import knexInstance from '../config/knex';
import { parseDevice, parseStatus } from '../utils/parseDevice';
import { getCurrentPrice } from '../utils/priceUpdater';
import { Device, Relay } from '../typings/database/dto/Device.dto';

//======================================================//
//                    variables                         //
//======================================================//
// The MQTT Client that connects to the MQTT broker
let client: mqtt.MqttClient;

// Regex patterns for different topics
//FIXME: maybe these should be in the MQTT.ts config file?
const newDevicePattern = /^device\/new$/;
const commandPattern = /^device\/(.+)\/command$/;
const statusPattern = /^device\/(.+)\/status$/;
const pricePattern = /^electric\/price$/;


//======================================================//
//                     Functions                        //
//======================================================//
/**
 * @brief Handle incoming messages
 * @param topic - the topic of the message
 * @param message - the message
 * @returns {void}
 */
async function handleMessage(topic: string, message: Buffer): Promise<void> {
    try {
        if (newDevicePattern.test(topic)) {
            const foundDeviceData = await knexInstance('devices').select('*').where('uuid', message.toString()).first();

            if (foundDeviceData) {
                let device = parseDevice(foundDeviceData);
                console.log("New device connected: ", device.uuid);

                // send a command to the device to turn on the relay
                if (!process.env.MQTT_COMMAND_TOPIC) throw new Error("MQTT_TOPIC not set");

                let topic = process.env.MQTT_COMMAND_TOPIC.replace("<uuid>", device.uuid);
                let currentPrice = await getCurrentPrice();

                device.relays.forEach((relay, i) => {
                    let message = `relay=${i}&mode=${relay.mode}${relay.mode == 'manual' ? `&state=${relay.state}` : ''}&threshold=${relay.threshold}&price=${currentPrice}`;
                    sendMQTTMessage(topic, message);
                });
            }
            return; // no need to process further
        }

        if (commandPattern.test(topic)) {
        //    console.log("Command received: ", message.toString());
            return; // no need to process further
        }


        if (statusPattern.test(topic)) {
            // Parse the uuid from the topic
            let uuid = topic.match(statusPattern)?.[1];

            const foundDeviceData = await knexInstance('devices').select('*').where({ uuid }).first();
            if (!foundDeviceData) throw new Error(`Status message from unknown device: ${message.toString()}`);

            let device = parseDevice(foundDeviceData);
            let relay = parseStatus(message.toString());

            if (relayHasChanged(device, relay) == false) return;

            // Postgresql arrays start from 1, not 0 so we need to add 1 to the relay number
            let updateQuery = `
            UPDATE devices
            SET relays[${relay.relay + 1}] = ('${relay.mode}', '${relay.state}', ${relay.threshold})
            WHERE uuid = '${uuid}'
        `;

            // Execute the raw SQL query
            await knexInstance.raw(updateQuery);
            return; // no need to process further
        }

        if (pricePattern.test(topic)) {
            //   console.log("Price received: ", message.toString());
            return; // no need to process further
        }

    } catch (error: any) {
        if (error instanceof Error) {
            console.error(`Error: ${error.message}`);

        } else {
            console.error("Random error: ", error);
        }
    }
}

/**
 * 
 * @param config -  the configuration for the MQTT client
 * @returns {mqtt.MqttClient} - the MQTT client
 */
export function startMQTTClient(config: mqtt.IClientOptions): mqtt.MqttClient {
    client = mqtt.connect(config);

    client.on('connect', () => {
        console.log(`MQTT connected to ${config.host}:${config.port} as '${config.username}'`);
        // subscribe to all topics
        client.subscribe('#', (err) => {
            if (err) {
                console.error('MQTT error:', err);
            }
        });
    });

    client.on('error', (error) => {
        console.error('MQTT error:', error);
    });

    client.on('close', () => {
        console.log('MQTT disconnected');
    });

    client.on('offline', () => {
        console.log('MQTT offline');
    });

    client.on('reconnect', () => {
        console.log('MQTT reconnecting');
    });


    /**
     * Handle incoming messages.
     */
    client.on('message', (topic: string, message: Buffer) => {
        handleMessage(topic, message);
    });


    return client;
}


/**
 * 
 * @param topic Topic where the message will be sent
 * @param message The message to be sent
 * @returns {boolean} true if mqtt client is connected to the broker, false otherwise
 */
export function sendMQTTMessage(topic: string, message: string): Boolean {
    let success: Boolean = false;

    if (client.connected) {
        client.publish(topic, message);
        success = true;
        console.log(`Message sent to ${topic}: ${message}`);
    }

    return success;
}


/**
 * @brief checks if relay has changed. Compares a single relay object against the device object's relay
 * @param device {Device} - the device object
 * @param relay  {Relay} - the relay object
 * @returns {Boolean} - true if the relay has changed, false otherwise
 */
function relayHasChanged(device: Device, relay: Relay): boolean {
    return device.relays[relay.relay]?.mode == relay.mode
        && device.relays[relay.relay]?.state == relay.state
        && device.relays[relay.relay]?.threshold == relay.threshold;
}