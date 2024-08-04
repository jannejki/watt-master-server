
import { Request, Response } from "express-serve-static-core";
import jwt from "jsonwebtoken";
import knexInstance from "../config/knex";
import bcrypt from "bcrypt";

export async function login(req: Request, res: Response) {

    let found = await knexInstance("users").where({ email: req.body.username }).first();
    if (!found) {
        res.status(401).json({message:"Väärä käyttäjätunnus tai salasana!"});
        return;
    }

    if (found.status == 'disabled') {
        res.status(401).json({message:"Käyttäjätili on disabloitu!"});
        return;
    }

    const match = await bcrypt.compare(req.body.password, found.password);

    if (!match) {
        res.status(401).json({message:"Väärä käyttäjätunnus tai salasana!"});
        return;
    }


    const user = {
        id: found.id,
        username: found.email,
    };

    const token = jwt.sign(
        {
            data: user,
        },
        process.env.JWT_SECRET as string,
        {
            issuer: "accounts.examplesoft.com",
            audience: "yoursite.net",
            expiresIn: "1h",
        },
    );

    res.cookie('authorization', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        priority: 'high',
     //   expires: new Date(Date.now() + 3600000),
    });

    res.status(200).json({ user });

}

export function logout(req: Request, res: Response) {
    res.clearCookie("authorization", { path: '/', domain: 'localhost', sameSite: 'none', secure: true });
    res.status(200).end();
}