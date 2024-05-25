import { Router } from 'express';
import { login, logout } from '../controllers/authenticationController';
import passport from 'passport';
const loginRouter = Router();

loginRouter.post('/login', login);
loginRouter.post('/logout', logout);

loginRouter.get('/self',
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        if (req.user) {
            res.send(req.user);
        } else {
            res.status(401).end();
        }
    },
);

export default loginRouter;