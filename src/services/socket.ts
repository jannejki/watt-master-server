import { createServer } from "https";
import { Server } from "socket.io";
import jwt, { JwtPayload } from "jsonwebtoken";
import knexInstance from "../config/knex";
import MQTTMessageHandler from "../utils/MQTTMessageHandler";
import { Device, RelayCommand } from "../typings/database/dto/Device.dto";
import corsSettings from "../config/cors";
import deviceInteractionService from "./deviceInteractionService";
import { getCurrentPrice } from "../utils/priceUpdater";

let io: Server;

declare module 'http' {
    export interface IncomingMessage {
        user?: any;
    }
}

function extractAuthorizationCookieFromSocket(socket: any): JwtPayload | undefined {
    const cookie = socket.handshake.headers.cookie;
    if (!cookie) {
        console.error("No cookie provided");
        return;
    }
    const token: string | undefined = cookie.split(';').find((cookie: string) => cookie.trim().startsWith('authorization='))?.split('=')[1];

    if (!token) {
        console.error("No token provided");
        return;
    }

    const decoded: JwtPayload | string = jwt.verify(token, process.env.JWT_SECRET as string);
    if (typeof decoded === 'string') {
        console.error(decoded);
        socket.disconnect(true);
        return;
    }
    if (!decoded || !decoded.data || !decoded.data.id) {
        console.error("Invalid token or no user ID provided");
        return;
    }

    return decoded;
}

// Function to send a message to a specific room
export function sendMessageToClient(userID: number, device: Device) {
    let room = `user:${userID}`;
    io.to(room).emit("deviceUpdate", device);
}


export function initSocket(httpsServer: ReturnType<typeof createServer>) {
    if (!process.env.SOCKET_IO_PORT) throw new Error('Socket.io port is required!');
    io = new Server(httpsServer, {
        cors: corsSettings
    });

    io.engine.use((req: any, res: any, next: any) => {
        const isHandshake = req._query.sid === undefined;

        console.log("io.engine.use called!");
        if (!isHandshake) {
            console.log("Not handshake")
            return next();
        }

        const header = req.headers["cookie"];

        if (!header) {
            console.log("no header")
            return next(new Error("no token"));
        }

        console.log("bearer?")
        if (!header.startsWith("authorization=")) {
            console.log("no bearer")
            return next(new Error("invalid token"));
        }

        const token = header.substring(14);

        console.log("valid token?")
        jwt.verify(token, process.env.JWT_SECRET as string, (err: any, decoded: any) => {
            if (err) {
                return next(new Error("invalid token"));
            }
            console.log("token is valid")
            req.user = decoded.data;
            next();
        });
    });


    io.on("connection", async (socket) => {
        try {

            const decoded = extractAuthorizationCookieFromSocket(socket);
            if (!decoded) {
                socket.disconnect(true);
                return;
            }

            let user = await knexInstance("users").where({ id: decoded.data.id }).first();
            if (!user) {
                console.error("User not found");
                socket.disconnect(true);
                return;
            }

            if (user.email !== decoded.data.username) {
                console.error("User email does not match the token!");
                socket.disconnect(true);
                return;
            }

            socket.join(`user:${user.id}`)
            deviceInteractionService.pingAllDevicesOfUser(user.id);
            let price = await getCurrentPrice();
            console.log(price);
            socket.emit("electric/price", { hour0: price });

        } catch (error) {
            console.error(error);
            socket.disconnect(true);
            return;
        }

        socket.on("deviceCommand", async (msg) => {
            try {
                let token = extractAuthorizationCookieFromSocket(socket);
                if (!token) {
                    socket.disconnect(true);
                    return;
                }

                let user = await knexInstance("users").where({ id: token.data.id }).first();
                let devices = await knexInstance("devices").where({ owner_id: user.id });

                if (!devices) {
                    console.error("No devices found for user!");
                    return;
                }

                let device = devices.find((device) => device.uuid === msg.deviceID);

                if (!device) {
                    console.error("Device not found!");
                    return;
                }

                console.log(msg.settings);
                let command: RelayCommand = { ...msg.settings, relay: msg.relayID };

                // send MQTT message to the device
                MQTTMessageHandler.sendCommand(device.uuid, command);


                // Update the jwt token to keep the user logged in
                const newToken = jwt.sign(
                    {
                        data: {
                            id: user.id,
                            username: user.email,
                        },
                    },
                    process.env.JWT_SECRET as string,
                    {
                        issuer: "accounts.examplesoft.com",
                        audience: "yoursite.net",
                        expiresIn: "1h",
                    },
                );
                // Set the token to the "authorization" cookie
                socket.handshake.headers.cookie = `authorization=${newToken}`;

            } catch (error) {
                console.error(error);
            }
        });

    });
}