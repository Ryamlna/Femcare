import { Router } from 'express';
import { googleLogin, logout } from '../controllers/auth.controller.js';

const r = Router();
r.post('/google', (req, res, next) => googleLogin(req, res).catch(next));
r.post('/logout', logout);
export default r;
