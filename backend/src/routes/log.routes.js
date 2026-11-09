import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { listLogs, upsertLog, getPainAlert } from '../controllers/log.controller.js';

const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);
const r = Router();
r.use(requireAuth);
r.get('/alert', wrap(getPainAlert));
r.get('/', wrap(listLogs));
r.post('/', wrap(upsertLog));
export default r;
