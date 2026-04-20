import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

import connectDB from './src/config/db.js';
import authRoutes from './src/routes/authRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import teamRoutes from './src/routes/teamRoutes.js';
import registrationRoutes from './src/routes/registrationRoutes.js';
import tournamentRoutes from './src/routes/tournamentRoutes.js';
import matchRoutes from './src/routes/matchRoutes.js'; // ✅ KEEP

// Fix __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ✅ Load env FIRST
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Connect DB
connectDB();

// ✅ Middlewares
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Static uploads (clean version)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Backend is running' });
});

// ✅ Routes (MERGED ALL)
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/matches', matchRoutes); // ✅ FROM feature branch

// ✅ Error handling
app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);

  res.status(err.statusCode || 500).json({
    message: err.message || 'Internal server error',
  });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});