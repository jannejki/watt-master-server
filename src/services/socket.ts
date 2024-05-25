import { createServer } from "https";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io: Server;

declare module 'http' {
    export interface IncomingMessage {
        user?: any;
    }
}



export function initSocket(httpsServer: ReturnType<typeof createServer>) {
    if (!process.env.SOCKET_IO_PORT) throw new Error('Socket.io port is required!');
    io = new Server(httpsServer, {
        cors: {
            origin: "http://localhost:3001"
        }
    });

    io.engine.use((req: any, res: any, next: any) => {
        const isHandshake = req._query.sid === undefined;
        console.log('Cookies: ', req.cookies)

        if (!isHandshake) {
            return next();
        }

        const header = req.headers["authorization"];

        if (!header) {
            return next(new Error("no token"));
        }

        if (!header.startsWith("bearer ")) {
            return next(new Error("invalid token"));
        }

        const token = header.substring(7);

        jwt.verify(token, process.env.JWT_SECRET as string, (err: any, decoded: any) => {
            if (err) {
                return next(new Error("invalid token"));
            }
            req.user = decoded.data;
            next();
        });
    });

    io.on("connection", (socket) => {
        console.log(socket.request.user); // TODO get the user from here

        console.log("Client connected!");
    });

    let port: number = parseInt(process.env.SOCKET_IO_PORT);
    io.listen(port);
    console.log(`Socket.io server running on port: ${port}`);
}