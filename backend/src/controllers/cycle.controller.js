import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { toUTCDate, addDays, todayUTC } from '../utils/dates.js';

export async function listCycles(req, res) {
  const cycles = await prisma.cycle.findMany({
    where: { userId: req.userId },
    orderBy: { startDate: 'desc' },
    include: { _count: { select: { logs: true } } },
  });
  res.json({ cycles });
}

export async function getCurrentCycle(req, res) {
  const cycle = await prisma.cycle.findFirst({
    where: { userId: req.userId, isActive: true },
    orderBy: { startDate: 'desc' },
  });
  res.json({ cycle });
}

// POST /api/cycles/start { startDate? } - menandai hari pertama haid baru
export async function startCycle(req, res) {
  const parsed = z.object({ startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional() }).safeParse(req.body ?? {});
  if (!parsed.success) return res.status(400).json({ error: 'Format tanggal harus YYYY-MM-DD.' });
  const start = parsed.data.startDate ? toUTCDate(parsed.data.startDate) : todayUTC();

  const cycle = await prisma.$transaction(async (tx) => {
    await tx.cycle.updateMany({
      where: { userId: req.userId, isActive: true },
      data: { isActive: false, endDate: addDays(start, -1) },
    });
    return tx.cycle.create({ data: { userId: req.userId, startDate: start } });
  });
  res.status(201).json({ cycle });
}
