
import { Request, Response } from "express-serve-static-core";
import knexInstance from "../config/knex";
import { parseDevice } from "../utils/parseDevice";


export async function getDevices(req: Request, res: Response) {
    try {
        console.log(req.user);
        let devices = await knexInstance("devices").where({ owner_id: req.user.id });
        devices = devices.map(parseDevice);

        res.status(200).json(devices);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}