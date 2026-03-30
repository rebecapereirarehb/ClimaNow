import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.static('.'));

const API_KEY = process.env.API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// ─────────────────────────────
// Weather atual
// ─────────────────────────────
app.get('/api/weather', async (req, res) => {
  const { q, lat, lon } = req.query;

  const url = q
    ? `${BASE_URL}/weather?q=${q}&appid=${API_KEY}&units=metric&lang=pt_br`
    : `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=pt_br`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// ─────────────────────────────
// Forecast (5 dias)
// ─────────────────────────────
app.get('/api/forecast', async (req, res) => {
  const { q, lat, lon } = req.query;

  const url = q
    ? `${BASE_URL}/forecast?q=${q}&appid=${API_KEY}&units=metric&lang=pt_br`
    : `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=pt_br`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// ─────────────────────────────
// One Call (VERSÃO NOVA 3.0)
// ─────────────────────────────
app.get('/api/onecall', async (req, res) => {
  const { lat, lon } = req.query;

  const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=pt_br`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// ─────────────────────────────
// MAPA (CORREÇÃO PRINCIPAL)
// ─────────────────────────────
app.get('/api/map', (req, res) => {
  const { z, x, y } = req.query;

  const url = `https://tile.openweathermap.org/map/temp_new/${z}/${x}/${y}.png?appid=${API_KEY}`;

  res.redirect(url);
});

// ─────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});