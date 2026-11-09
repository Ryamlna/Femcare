import { prisma } from '../lib/prisma.js';
import { COOKIE_NAME } from '../middleware/auth.js';

export async function getMe(req, res) {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, email: true, name: true, createdAt: true },
  });
  if (!user) return res.status(401).json({ error: 'Pengguna tidak ditemukan.' });
  res.json({ user });
}

// Hapus akun beserta seluruh siklus & log (onDelete: Cascade).
export async function deleteMe(req, res) {
  await prisma.user.delete({ where: { id: req.userId } });
  res.clearCookie(COOKIE_NAME);
  res.json({ ok: true });
}
