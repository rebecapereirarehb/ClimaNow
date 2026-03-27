import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

if (!API_KEY) {
  console.error('❌ API_KEY não configurada em .env');
  process.exit(1);
}

// Middlewares
app.use(cors());
app.use(express.static('.')); // Serve arquivos estáticos

// Proxy para weather (tempo atual)
app.get('/api/weather', async (req, res) => {
  const { q, lat, lon } = req.query;

  try {
    let url = `${BASE_URL}/weather?appid=${API_KEY}&units=metric&lang=pt_br`;

    if (q) {
      url += `&q=${encodeURIComponent(q)}`;
    } else if (lat && lon) {
      url += `&lat=${lat}&lon=${lon}`;
    } else {
      return res.status(400).json({ error: 'Parâmetro q (city) ou lat/lon obrigatório' });
    }

    const response = await fetch(url);
    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json(error);
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Erro ao buscar weather:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Proxy para forecast (previsão 5 dias)
app.get('/api/forecast', async (req, res) => {
  const { q, lat, lon } = req.query;

  try {
    let url = `${BASE_URL}/forecast?appid=${API_KEY}&units=metric&lang=pt_br`;

    if (q) {
      url += `&q=${encodeURIComponent(q)}`;
    } else if (lat && lon) {
      url += `&lat=${lat}&lon=${lon}`;
    } else {
      return res.status(400).json({ error: 'Parâmetro q (city) ou lat/lon obrigatório' });
    }

    const response = await fetch(url);
    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json(error);
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Erro ao buscar forecast:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Proxy para onecall (previsão por hora + visuais)
app.get('/api/onecall', async (req, res) => {
  const { lat, lon } = req.query;

  try {
    if (!lat || !lon) {
      return res.status(400).json({ error: 'Parâmetros lat e lon obrigatórios' });
    }

    const url = `${BASE_URL}/onecall?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=pt_br&exclude=minutely,daily,alerts`;

    const response = await fetch(url);
    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json(error);
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Erro ao buscar onecall:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', apiKeyConfigured: !!API_KEY });
});

app.listen(PORT, () => {
  console.log(`✅ Server rodando em http://localhost:${PORT}`);
});
