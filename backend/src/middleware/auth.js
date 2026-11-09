import jwt from 'jsonwebtoken';

export const COOKIE_NAME = 'fc_token';

export function requireAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: 'Belum masuk.' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch {
    res.status(401).json({ error: 'Sesi berakhir. Silakan masuk kembali.' });
  }
}
