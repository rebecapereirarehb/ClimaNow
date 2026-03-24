/* ============================================
   CLIMA — Weather App  |  script.js
   ============================================
   🔑 CONFIGURAÇÃO:
   Substitua 'YOUR_API_KEY_HERE' pela sua chave
   gratuita do OpenWeatherMap:
   https://openweathermap.org/api
   ============================================ */

const API_KEY  = 'd8511ecb1d01386d7fe343f1a4a0b702';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

/* ─────────────────────────────────────────────
   Estado global
───────────────────────────────────────────── */
let currentCityName    = null;   // nome da API (ex: "London")
let currentCityDisplay = null;   // nome + país (ex: "London, GB")
let favorites          = JSON.parse(localStorage.getItem('weather-favorites') || '[]');
let isDark             = localStorage.getItem('weather-theme') !== 'light';

/* ─────────────────────────────────────────────
   Referências DOM
───────────────────────────────────────────── */
const $  = id => document.getElementById(id);
const searchInput      = $('search-input');
const btnSearch        = $('btn-search');
const btnLocation      = $('btn-location');
const btnTheme         = $('btn-theme');
const themeIcon        = $('theme-icon');
const btnFavToggle     = $('btn-favorites-toggle');
const favoritesPanel   = $('favorites-panel');
const favoritesList    = $('favorites-list');
const favoritesEmpty   = $('favorites-empty');
const btnSaveFav       = $('btn-save-favorite');
const favIcon          = $('fav-icon');
const apiBanner        = $('api-banner');
const bgLayer          = $('bg-layer');
const loadingEl        = $('loading');
const errorEl          = $('error-state');
const errorMsg         = $('error-message');
const weatherContent   = $('weather-content');
const emptyState       = $('empty-state');

/* ─────────────────────────────────────────────
   Inicialização
───────────────────────────────────────────── */
(function init() {
  // Banner se API key não foi configurada
  if (API_KEY === 'YOUR_API_KEY_HERE') {
    apiBanner.classList.remove('hidden');
  }

  // Tema
  applyTheme();

  // Renderiza favoritos na lista
  renderFavorites();
})();

/* ─────────────────────────────────────────────
   Tema Claro / Escuro
───────────────────────────────────────────── */
function applyTheme() {
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  themeIcon.textContent = isDark ? '☾' : '☀';
}

btnTheme.addEventListener('click', () => {
  isDark = !isDark;
  localStorage.setItem('weather-theme', isDark ? 'dark' : 'light');
  applyTheme();
});

/* ─────────────────────────────────────────────
   Painel de Favoritos
───────────────────────────────────────────── */
btnFavToggle.addEventListener('click', () => {
  favoritesPanel.classList.toggle('hidden');
  if (!favoritesPanel.classList.contains('hidden')) {
    renderFavorites();
  }
});

btnSaveFav.addEventListener('click', () => {
  if (!currentCityName) return;

  const idx = favorites.indexOf(currentCityName);
  if (idx === -1) {
    favorites.push(currentCityName);
  } else {
    favorites.splice(idx, 1);
  }

  localStorage.setItem('weather-favorites', JSON.stringify(favorites));
  updateFavButton();
  renderFavorites();
});

function renderFavorites() {
  if (favorites.length === 0) {
    favoritesEmpty.classList.remove('hidden');
    favoritesList.innerHTML = '';
    return;
  }

  favoritesEmpty.classList.add('hidden');
  favoritesList.innerHTML = favorites
    .map(city => `
      <div class="fav-item">
        <button class="fav-city-btn" onclick="fetchWeather('${escapeAttr(city)}')">${escapeHtml(city)}</button>
        <button class="fav-remove-btn" onclick="removeFavorite('${escapeAttr(city)}')">✕</button>
      </div>
    `)
    .join('');
}

window.removeFavorite = city => {
  favorites = favorites.filter(c => c !== city);
  localStorage.setItem('weather-favorites', JSON.stringify(favorites));
  renderFavorites();
  if (currentCityName === city) updateFavButton();
};

function updateFavButton() {
  const isFav = favorites.includes(currentCityName);
  favIcon.textContent = isFav ? '★' : '☆';
  btnSaveFav.classList.toggle('saved', isFav);
}

/* ─────────────────────────────────────────────
   Busca por nome de cidade
───────────────────────────────────────────── */
btnSearch.addEventListener('click', () => {
  const city = searchInput.value.trim();
  if (city) fetchWeather(city);
});

searchInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const city = searchInput.value.trim();
    if (city) fetchWeather(city);
  }
});

/* ─────────────────────────────────────────────
   Geolocalização
───────────────────────────────────────────── */
btnLocation.addEventListener('click', () => {
  if (!navigator.geolocation) {
    showError('Geolocalização não é suportada neste navegador.');
    return;
  }
  showLoading();
  navigator.geolocation.getCurrentPosition(
    pos => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
    ()  => showError('Não foi possível obter sua localização. Verifique as permissões do navegador.')
  );
});

/* ─────────────────────────────────────────────
   Fetch — por nome
───────────────────────────────────────────── */
window.fetchWeather = async city => {
  showLoading();
  try {
    const [currentRes, forecastRes] = await Promise.all([
      fetch(`${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=pt_br`),
      fetch(`${BASE_URL}/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=pt_br`)
    ]);

    handleApiErrors(currentRes);

    const current  = await currentRes.json();
    const forecast = await forecastRes.json();

    currentCityName    = current.name;
    currentCityDisplay = `${current.name}, ${current.sys.country}`;
    searchInput.value  = current.name;

    renderUI(current, forecast);
    showWeather();
    updateFavButton();
    favoritesPanel.classList.add('hidden');
  } catch (err) {
    showError(err.message || 'Ocorreu um erro inesperado.');
  }
};

/* ─────────────────────────────────────────────
   Fetch — por coordenadas
───────────────────────────────────────────── */
async function fetchWeatherByCoords(lat, lon) {
  try {
    const [currentRes, forecastRes] = await Promise.all([
      fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=pt_br`),
      fetch(`${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=pt_br`)
    ]);

    handleApiErrors(currentRes);

    const current  = await currentRes.json();
    const forecast = await forecastRes.json();

    currentCityName    = current.name;
    currentCityDisplay = `${current.name}, ${current.sys.country}`;
    searchInput.value  = current.name;

    renderUI(current, forecast);
    showWeather();
    updateFavButton();
  } catch (err) {
    showError(err.message || 'Ocorreu um erro inesperado.');
  }
}

/* ─────────────────────────────────────────────
   Tratamento de erros da API
───────────────────────────────────────────── */
function handleApiErrors(res) {
  if (res.ok) return;
  if (res.status === 401) throw new Error('API Key inválida. Configure sua chave no arquivo script.js');
  if (res.status === 404) throw new Error('Cidade não encontrada. Verifique o nome e tente novamente.');
  throw new Error(`Erro ao buscar dados (código ${res.status}). Tente novamente.`);
}

/* ─────────────────────────────────────────────
   Renderização da UI
───────────────────────────────────────────── */
function renderUI(current, forecast) {
  // ── Informações básicas ──────────────────
  $('city-name').textContent   = currentCityDisplay;
  $('country-date').textContent = formatDate(new Date(current.dt * 1000));

  // ── Temperatura ──────────────────────────
  $('temperature').textContent  = Math.round(current.main.temp);
  $('feels-like').textContent   = `Sensação térmica: ${Math.round(current.main.feels_like)}°C`;

  // ── Ícone e descrição ────────────────────
  const iconCode = current.weather[0].icon;
  const iconEl   = $('weather-icon');
  iconEl.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  iconEl.alt = current.weather[0].description;
  $('weather-desc').textContent = capitalize(current.weather[0].description);

  // ── Cards de estatísticas ────────────────
  $('humidity').textContent   = `${current.main.humidity}%`;
  $('wind').textContent       = `${(current.wind.speed * 3.6).toFixed(1)} km/h`;
  $('pressure').textContent   = `${current.main.pressure} hPa`;
  $('clouds').textContent     = `${current.clouds.all}%`;

  const rainVol = current.rain?.['1h'] ?? current.rain?.['3h'] ?? 0;
  $('rain').textContent = `${rainVol.toFixed(1)} mm`;

  const visKm = current.visibility != null
    ? (current.visibility / 1000).toFixed(1) + ' km'
    : 'N/D';
  $('visibility').textContent = visKm;

  // ── Fundo dinâmico ───────────────────────
  updateBackground(current.weather[0].id, iconCode);

  // ── Previsão por hora ────────────────────
  renderHourly(forecast.list.slice(0, 9));

  // ── Previsão por dia ─────────────────────
  renderDaily(forecast.list);
}

/* ─────────────────────────────────────────────
   Previsão — próximas horas
───────────────────────────────────────────── */
function renderHourly(list) {
  const container = $('hourly-carousel');
  const now       = Date.now() / 1000;

  container.innerHTML = list.map((item, idx) => {
    const date = new Date(item.dt * 1000);
    const hhmm = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const temp  = Math.round(item.main.temp);
    const icon  = item.weather[0].icon;
    const pop   = Math.round((item.pop ?? 0) * 100);
    const isNow = idx === 0;

    return `
      <div class="hourly-card ${isNow ? 'highlight' : ''}">
        <span class="h-time">${isNow ? 'Agora' : hhmm}</span>
        <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${item.weather[0].description}" class="h-icon" />
        <span class="h-temp">${temp}°</span>
        ${pop > 10 ? `<span class="h-pop">💧 ${pop}%</span>` : '<span class="h-pop" style="visibility:hidden">.</span>'}
      </div>`;
  }).join('');
}

/* ─────────────────────────────────────────────
   Previsão — próximos dias
───────────────────────────────────────────── */
function renderDaily(list) {
  // Agrupa entradas por dia
  const days = {};
  list.forEach(item => {
    const date = new Date(item.dt * 1000);
    const key  = date.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit'
    });
    if (!days[key]) days[key] = { temps: [], icons: [], pops: [], descs: [] };
    days[key].temps.push(item.main.temp);
    days[key].icons.push(item.weather[0].icon);
    days[key].pops.push(item.pop ?? 0);
    days[key].descs.push(item.weather[0].description);
  });

  // Remove o dia atual e pega os próximos 5
  const entries = Object.entries(days).slice(1, 6);

  $('daily-list').innerHTML = entries.map(([day, data]) => {
    const min  = Math.round(Math.min(...data.temps));
    const max  = Math.round(Math.max(...data.temps));
    const mid  = Math.floor(data.icons.length / 2);
    const icon = data.icons[mid];
    const desc = capitalize(data.descs[mid]);
    const pop  = Math.round(Math.max(...data.pops) * 100);

    return `
      <div class="daily-card">
        <span class="d-day">${day}</span>
        <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${desc}" class="d-icon" />
        <span class="d-desc">${desc}</span>
        <div class="d-temps">
          <span class="d-max">${max}°</span>
          <span class="d-sep">·</span>
          <span class="d-min">${min}°</span>
        </div>
        ${pop > 10 ? `<span class="d-pop">💧 ${pop}%</span>` : '<span class="d-pop"></span>'}
      </div>`;
  }).join('');
}

/* ─────────────────────────────────────────────
   Fundo dinâmico por condição climática
───────────────────────────────────────────── */
function updateBackground(conditionId, icon) {
  const isNight = icon.endsWith('n');
  let gradient, accent;

  if (conditionId >= 200 && conditionId < 300) {
    // Tempestade
    gradient = 'linear-gradient(145deg, #120922 0%, #2a1147 45%, #0e0818 100%)';
    accent   = '#b392f0';

  } else if (conditionId >= 300 && conditionId < 400) {
    // Garoa
    gradient = 'linear-gradient(145deg, #0d2030 0%, #1a3a55 50%, #0d2030 100%)';
    accent   = '#7ec8fa';

  } else if (conditionId >= 500 && conditionId < 600) {
    // Chuva
    gradient = 'linear-gradient(145deg, #081929 0%, #0f2e4c 45%, #051220 100%)';
    accent   = '#3b96e0';

  } else if (conditionId >= 600 && conditionId < 700) {
    // Neve
    gradient = 'linear-gradient(145deg, #c4d4e8 0%, #9db8d2 40%, #d8e6f0 100%)';
    accent   = '#5d9ec2';

  } else if (conditionId >= 700 && conditionId < 800) {
    // Neblina / névoa
    gradient = 'linear-gradient(145deg, #1e2530 0%, #3a4455 50%, #1e2530 100%)';
    accent   = '#a0b4c8';

  } else if (conditionId === 800) {
    // Céu limpo
    if (isNight) {
      gradient = 'linear-gradient(145deg, #060818 0%, #0d1535 45%, #060c20 100%)';
      accent   = '#9b8fee';
    } else {
      gradient = 'linear-gradient(145deg, #c45a10 0%, #e08020 40%, #d46010 100%)';
      accent   = '#fcd34d';
    }

  } else {
    // Nublado
    if (isNight) {
      gradient = 'linear-gradient(145deg, #10151e 0%, #1c2840 45%, #0e1620 100%)';
      accent   = '#74b9ff';
    } else {
      gradient = 'linear-gradient(145deg, #2e4a70 0%, #4a6e9e 45%, #2e4a70 100%)';
      accent   = '#90c4f0';
    }
  }

  bgLayer.style.background = gradient;
  document.documentElement.style.setProperty('--accent', accent);
  document.documentElement.style.setProperty('--accent-glow', hexToRgba(accent, 0.18));
}

/* ─────────────────────────────────────────────
   Controle de estados visuais
───────────────────────────────────────────── */
function showLoading() {
  loadingEl.classList.remove('hidden');
  errorEl.classList.add('hidden');
  weatherContent.classList.add('hidden');
  emptyState.classList.add('hidden');
}

function showError(msg) {
  loadingEl.classList.add('hidden');
  errorEl.classList.remove('hidden');
  weatherContent.classList.add('hidden');
  emptyState.classList.add('hidden');
  errorMsg.textContent = msg;
}

function showWeather() {
  loadingEl.classList.add('hidden');
  errorEl.classList.add('hidden');
  weatherContent.classList.remove('hidden');
  emptyState.classList.add('hidden');
}

$('btn-retry').addEventListener('click', () => {
  errorEl.classList.add('hidden');
  emptyState.classList.remove('hidden');
});

/* ─────────────────────────────────────────────
   Utilitários
───────────────────────────────────────────── */
function formatDate(date) {
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day:     '2-digit',
    month:   'long',
    year:    'numeric'
  });
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function escapeAttr(str) {
  return str.replace(/'/g, "\\'");
}

function hexToRgba(hex, alpha) {
  // Aceita #rgb ou #rrggbb
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const r = parseInt(c.slice(0,2), 16);
  const g = parseInt(c.slice(2,4), 16);
  const b = parseInt(c.slice(4,6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
