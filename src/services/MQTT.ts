import mqtt from 'mqtt';

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
function handleMessage(topic: string, message: Buffer): void {
    if (newDevicePattern.test(topic)) {
        console.log("New device connected: ", message.toString());
        return; // no need to process further
    }

    if (commandPattern.test(topic)) {
        console.log("Command received: ", message.toString());
        return; // no need to process further
    }

    if (statusPattern.test(topic)) {
        console.log("Status received: ", message.toString());
        return; // no need to process further
    }

    if (pricePattern.test(topic)) {
        console.log("Price received: ", message.toString());
        return; // no need to process further
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



