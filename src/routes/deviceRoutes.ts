import { Router } from 'express';

import passport from 'passport';
import { getDevices } from '../controllers/deviceController';
const deviceRouter = Router();

deviceRouter.get('/api/devices', passport.authenticate("jwt", { session: false }), getDevices);


export default deviceRouter;