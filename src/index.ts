import dotenv from 'dotenv';
dotenv.config();

import MQTTConfig from "./config/MQTT";
import { startMQTTClient } from "./services/MQTT";
import startPriceUpdater from './utils/priceUpdater';
(() => {

    //=================================================//
    //          MQTT client configuration              //
    //=================================================//
    if (!MQTTConfig.port) {
        throw new Error('MQTT port is required');
    }
    if (!MQTTConfig.host) {
        throw new Error('MQTT host is required');
    }
    if (!MQTTConfig.username) {
        throw new Error('MQTT username is required');
    }
    if (!MQTTConfig.password) {
        throw new Error('MQTT password is required');
    }
    startMQTTClient(MQTTConfig);

    //=================================================//
    //          Price updater configuration             //
    //=================================================//
    startPriceUpdater();
})();