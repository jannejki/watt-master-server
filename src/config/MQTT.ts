import { IClientOptions } from "mqtt/*";
import * as fs from 'fs';

if (process.env.MQTT_CERT == undefined) {
    new Error("MQTT CERT NOT FOUND!");
}


const MQTTConfig: IClientOptions = {
    host: process.env.MQTT_HOST,
    port: process.env.MQTT_PORT ? parseInt(process.env.MQTT_PORT) : undefined,
    username: process.env.MQTT_USER,
    password: process.env.MQTT_PWD,
    keepalive: 10,
    ca: fs.readFileSync(process.env.MQTT_CERT || "not found"),
    protocol: 'ssl', // Specify the SSL/TLS protocol,
    will: {
        topic: `server/disconnect`,
        payload: Buffer.from("disconnect"),
        qos: 1,  // Adjust QoS level based on your preference
        retain: false  // Set to true if you want the broker to retain the message
    }
}

// Regex patterns for different topics
export const TOPIC_NEW_DEVICE_PATTERN = /^device\/new$/;
export const TOPIC_COMMAND_PATTERN = /^device\/(.+)\/command$/;
export const TOPIC_STATUS_PATTERN = /^device\/(.+)\/status$/;
export const TOPIC_PRICE_PATTERN = /^electric\/price$/;
export const TOPIC_PING_PATTERN = /^device\/(.+)\/ping$/;
export const TOPIC_DEVICE_LAST_WILL_PATTERN = /^device\/(.+)\/disconnect$/;


export const PING_TOPIC = "device/<uuid>/ping";

export default MQTTConfig;