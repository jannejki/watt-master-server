import mqtt from 'mqtt';
import MQTTMessageHandler from '../utils/MQTTMessageHandler';
import { TOPIC_NEW_DEVICE_PATTERN, TOPIC_COMMAND_PATTERN, TOPIC_STATUS_PATTERN, TOPIC_PRICE_PATTERN, TOPIC_DEVICE_LAST_WILL_PATTERN } from '../config/MQTT';
//======================================================//
//                    variables                         //
//======================================================//
// The MQTT Client that connects to the MQTT broker
let client: mqtt.MqttClient;


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
        if (TOPIC_NEW_DEVICE_PATTERN.test(topic)) {
            MQTTMessageHandler.newDevice(message.toString());
            return; // no need to process further
        }

        if (TOPIC_COMMAND_PATTERN.test(topic)) {
            //    console.log("Command received: ", message.toString());
            return; // no need to process further
        }


        if (TOPIC_STATUS_PATTERN.test(topic)) {
            let uuid = topic.match(TOPIC_STATUS_PATTERN)?.[1];
            if (!uuid) throw new Error("UUID not found in topic");
            MQTTMessageHandler.status(uuid, message.toString());
            return; // no need to process further
        }

        if (TOPIC_PRICE_PATTERN.test(topic)) {
            //   console.log("Price received: ", message.toString());
            return; // no need to process further

        }

        if(TOPIC_DEVICE_LAST_WILL_PATTERN.test(topic)){
            let uuid = topic.match(TOPIC_DEVICE_LAST_WILL_PATTERN)?.[1];
            if (!uuid) throw new Error("UUID not found in topic");
            MQTTMessageHandler.deviceLastWill(uuid);
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
 * Create and start the MQTT client.
 * @param config - MQTT client configuration.
 * @returns MQTT client instance.
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

    if (client && client.connected) {
        client.publish(topic, message);
        success = true;
        console.log(`Message sent to ${topic}: ${message}`);
    } else {
        console.error("Can't send messages, MQTT client is not connected!");
    }

    return success;
}