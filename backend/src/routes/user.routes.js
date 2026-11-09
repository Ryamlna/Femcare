import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getMe, deleteMe } from '../controllers/user.controller.js';

const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);
const r = Router();
r.use(requireAuth);
r.get('/me', wrap(getMe));
r.delete('/me', wrap(deleteMe));
export default r;
