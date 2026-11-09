import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { toUTCDate, addDays, diffDays, todayUTC } from '../utils/dates.js';
import { detectPainAlert } from '../utils/alerts.js';

const logSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  isMenstruating: z.boolean().default(false),
  bleedingVolume: z.enum(['LIGHT', 'MEDIUM', 'HEAVY']).nullable().optional(),
  painScale: z.number().int().min(0).max(10).default(0),
  symptoms: z.array(z.string().max(60)).max(20).default([]),
  mood: z.string().max(30).nullable().optional(),
  sleepHours: z.number().min(0).max(24).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
});

// Haid yang dicatat >= 15 hari sejak awal siklus aktif dianggap awal siklus baru.
const NEW_CYCLE_MIN_GAP_DAYS = 15;

async function resolveCycle(userId, date, isMenstruating) {
  let cycle = await prisma.cycle.findFirst({
    where: { userId, startDate: { lte: date } },
    orderBy: { startDate: 'desc' },
  });

  if (!cycle) {
    const anyCycle = await prisma.cycle.findFirst({ where: { userId } });
    return prisma.cycle.create({ data: { userId, startDate: date, isActive: !anyCycle } });
  }

  if (cycle.isActive && isMenstruating && diffDays(date, cycle.startDate) >= NEW_CYCLE_MIN_GAP_DAYS) {
    const [, created] = await prisma.$transaction([
      prisma.cycle.update({ where: { id: cycle.id }, data: { isActive: false, endDate: addDays(date, -1) } }),
      prisma.cycle.create({ data: { userId, startDate: date } }),
    ]);
    cycle = created;
  }
  return cycle;
}

// GET /api/logs?days=120
export async function listLogs(req, res) {
  const days = Math.min(Math.max(Number(req.query.days) || 90, 1), 730);
  const since = addDays(todayUTC(), -days);
  const logs = await prisma.dailyLog.findMany({
    where: { cycle: { userId: req.userId }, date: { gte: since } },
    orderBy: { date: 'asc' },
  });
  res.json({ logs });
}

// POST /api/logs  (upsert per tanggal)
export async function upsertLog(req, res) {
  const parsed = logSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Data tidak valid.', details: parsed.error.flatten() });

  const d = parsed.data;
  const date = toUTCDate(d.date);
  if (date > addDays(todayUTC(), 1)) return res.status(400).json({ error: 'Tanggal tidak boleh di masa depan.' });

  const cycle = await resolveCycle(req.userId, date, d.isMenstruating);
  const data = {
    isMenstruating: d.isMenstruating,
    bleedingVolume: d.isMenstruating ? d.bleedingVolume ?? null : null,
    painScale: d.painScale,
    symptoms: d.symptoms,
    mood: d.mood ?? null,
    sleepHours: d.sleepHours ?? null,
    notes: d.notes ?? null,
  };

  const log = await prisma.dailyLog.upsert({
    where: { cycleId_date: { cycleId: cycle.id, date } },
    update: data,
    create: { ...data, cycleId: cycle.id, date },
  });
  res.status(201).json({ log });
}

// GET /api/logs/alert -> Smart Alert (painScale > 8 selama 3 hari berturut-turut)
export async function getPainAlert(req, res) {
  const since = addDays(todayUTC(), -14);
  const logs = await prisma.dailyLog.findMany({
    where: { cycle: { userId: req.userId }, date: { gte: since } },
    select: { date: true, painScale: true },
  });
  res.json({ alert: detectPainAlert(logs, 8, 3) });
}
