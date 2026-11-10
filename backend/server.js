import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import authRoutes from './src/routes/auth.routes.js';
import userRoutes from './src/routes/user.routes.js';
import cycleRoutes from './src/routes/cycle.routes.js';
import logRoutes from './src/routes/log.routes.js';

for (const key of ['DATABASE_URL', 'JWT_SECRET', 'GOOGLE_CLIENT_ID', 'CLIENT_URL']) {
  if (!process.env[key]) {
    console.error(`Environment variable ${key} belum diisi (lihat .env.example).`);
    process.exit(1);
  }
}

const app = express();
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 50 }), authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cycles', cycleRoutes);
app.use('/api/logs', logRoutes);

app.use((req, res) =>
  res.status(404).json({ error: 'Endpoint tidak ditemukan.', method: req.method, originalUrl: req.originalUrl, url: req.url }));
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
});

if (!process.env.VERCEL) {
  const port = process.env.PORT || 4000;
  app.listen(port, () => console.log(`FemCare API berjalan di http://localhost:${port}`));
}

export default app;
