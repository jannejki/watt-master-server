import cron from 'node-cron';
import { sendMQTTMessage } from '../services/MQTT';

/**
 * @brief Fetches the current price of electricity from the Porssisähkö API
 * @returns {Promise<number>} - the current price of electricity
 */
export async function getCurrentPrice(): Promise<number> {
    try {
        let date = new Date().toISOString().split('T')[0];
        let hour = new Date().getHours();
        let response = await fetch(`https://api.porssisahko.net/v1/price.json?date=${date}&hour=${hour}`);
        
        if (response.status != 200) {
            throw new Error("Error fetching price");
        }

        let data = await response.json();
        return data.price;
    } catch (error: any) {
        throw error;
    }
}

/**
 * @brief Starts the price updater service.
 * @note If in development mode, the price is updated every 10 seconds and the value is randomly generated. If in production mode, the price is updated every hour.
 * @return {void}
 */
export default function startPriceUpdater(): void {
    if (process.env.NODE_ENV == 'DEV') {
        setInterval(devPriceUpdater, 1000 * 60 * 10);
    } else if (process.env.NODE_ENV == 'PROD') {
        cron.schedule('5 * * * *', priceUpdater);
    }
}


//=================================================//
//         Helper functions for priceUpdater       //
//=================================================//
/**
 * @brief Sends the current price to the MQTT broker
 * @returns {Promise<void>}
 */
async function priceUpdater(): Promise<void> {
    try {
        let currentPrice = await getCurrentPrice();
        let message = `hour0=${currentPrice}`;
        sendMQTTMessage('electric/price', message);
        // Publish the price to the MQTT broker
    } catch (error: any) {
        if (error instanceof Error) {
            console.error(`Error: ${error.message}`);
        } else {
            console.error("Random error: ", error);
        }
    }
}

/**
 * @brief Sends a random price between -1.0 - +20.00 to the MQTT broker
 */
async function devPriceUpdater(): Promise<void> {
    const min = -1.00;
    const  max = 20.00;

    let price = Math.random() * max - min;
    price = Math.round(price * 100) / 100;
    let message = `hour0=${price}`;
    sendMQTTMessage('electric/price', message);
}
