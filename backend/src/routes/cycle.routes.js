import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { listCycles, getCurrentCycle, startCycle } from '../controllers/cycle.controller.js';

const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);
const r = Router();
r.use(requireAuth);
r.get('/', wrap(listCycles));
r.get('/current', wrap(getCurrentCycle));
r.post('/start', wrap(startCycle));
export default r;
