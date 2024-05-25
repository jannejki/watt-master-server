import dotenv from 'dotenv';
dotenv.config();

import MQTTConfig from "./config/MQTT";
import { startMQTTClient } from "./services/MQTT";
import startPriceUpdater from './utils/priceUpdater';
import createApp from './services/expressApp';
import http from 'http';
import https, { ServerOptions } from 'https';
import fs from 'fs';
import { initSocket } from './services/socket';
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


    //=================================================//
    //               Express HTTP app                  //
    //=================================================//
    const app = createApp();

    if (!process.env.SSL_KEY_PATH || !process.env.SSL_SERT_PATH) throw new Error('HTTPS key and cert path are required!');
    const httpsServerOptions: ServerOptions = {
        key: fs.readFileSync(process.env.SSL_KEY_PATH),
        cert: fs.readFileSync(process.env.SSL_SERT_PATH),
    };

    const httpsServer = https.createServer(httpsServerOptions, app).listen(process.env.HTTPS_PORT || 3001, () => {
        console.log(`HTTPS-server is running on port ${process.env.HTTPS_PORT || 3001}`);
    });

    http.createServer((req, res) => {
        res.writeHead(301, { 'Location': `https://localhost:${process.env.HTTPS_PORT || 3000}` });
        res.end();
    }).listen(process.env.HTTP_PORT || 3000, () => {
        console.log(`HTTP requests are redirected to HTTPS server on port ${process.env.HTTP_PORT || 3000}`);
    });

    //=================================================//
    //               Socket.io server                  //
    //=================================================//
    initSocket(httpsServer);
})();