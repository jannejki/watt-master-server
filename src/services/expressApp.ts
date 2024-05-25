import express from 'express';

import morgan from 'morgan';
import passport from "passport";
import { Strategy as JwtStrategy } from "passport-jwt";
import path from 'path';
import bodyParser from "body-parser";
import loginRouter from '../routes/loginRoutes';
import cookieParser from "cookie-parser";
import cors from 'cors';
import deviceRouter from '../routes/deviceRoutes';

export default function createApp() {
    const app = express();

    app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))
    //  app.use(express.static(path.join(__dirname, '../../client', 'build')));
    app.use(bodyParser.json());
    app.use(cookieParser());
    // Cors is blocking the requests while developing, so we need to allow it with cors middleware
    let corsOptions = {
        origin: "http://localhost:3001",
        credentials: true,
    };

    app.use(cors(corsOptions));

    const jwtDecodeOptions = {
        jwtFromRequest: function (req: any) {

            // Your logic to extract the JWT from the request
            // For example, if the JWT is in a cookie named 'jwt':
            return req.cookies.authorization;
        },
        secretOrKey: process.env.JWT_SECRET as string,
        issuer: "accounts.examplesoft.com",
        audience: "yoursite.net",
    };

    passport.use(
        new JwtStrategy(jwtDecodeOptions, (payload, done) => {
            console.log("jwt payload", payload);
            return done(null, payload.data);
        }),
    );

    // send static files from client/build
    app.use(loginRouter);
    app.use(deviceRouter);
    
    app.use(express.static(path.join(__dirname, '../../client', 'build')));
    return app;
}