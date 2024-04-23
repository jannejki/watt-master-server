import { IClientOptions } from "mqtt/*";


const MQTTConfig: IClientOptions = {
    host: process.env.MQTT_HOST,
    port: process.env.MQTT_PORT ? parseInt(process.env.MQTT_PORT) : undefined,
    username: process.env.MQTT_USER,
    password: process.env.MQTT_PWD,
}


export default MQTTConfig;