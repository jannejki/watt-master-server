import { IClientOptions } from "mqtt/*";
import * as fs from 'fs';

const MQTTConfig: IClientOptions = {
    host: process.env.MQTT_HOST,
    port: process.env.MQTT_PORT ? parseInt(process.env.MQTT_PORT) : undefined,
    username: process.env.MQTT_USER,
    password: process.env.MQTT_PWD,
    keepalive: 10,
    ca: fs.readFileSync("./src/certs/mosquitto.crt"),
    protocol: 'ssl', // Specify the SSL/TLS protocol

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