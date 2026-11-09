import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../lib/prisma.js';
import { COOKIE_NAME } from '../middleware/auth.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const publicUser = (u) => ({ id: u.id, email: u.email, name: u.name });

function issueSession(res, user) {
  const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', // jalankan frontend & API di site yang sama (subdomain) saat produksi
    maxAge: WEEK_MS,
  });
}

// POST /api/auth/google  { credential: <Google ID token> }
export async function googleLogin(req, res) {
  const { credential } = req.body ?? {};
  if (!credential) return res.status(400).json({ error: 'Token Google tidak ada.' });

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch {
    return res.status(401).json({ error: 'Token Google tidak valid.' });
  }

  if (!payload?.email || !payload.email_verified) {
    return res.status(401).json({ error: 'Email Google belum terverifikasi.' });
  }

  const { sub: googleId, email, name } = payload;

  let user = await prisma.user.findUnique({ where: { googleId } });
  if (!user) {
    const existing = await prisma.user.findUnique({ where: { email } });
    user = existing
      ? await prisma.user.update({ where: { id: existing.id }, data: { googleId } })
      : await prisma.user.create({ data: { email, googleId, name: name || email.split('@')[0] } });
  }

  issueSession(res, user);
  res.json({ user: publicUser(user) });
}

export function logout(_req, res) {
  res.clearCookie(COOKIE_NAME);
  res.json({ ok: true });
}
