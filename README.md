# 🌤️ ClimaNow — Weather App

Uma aplicação web moderna e intuitiva para consultar o clima em tempo real com interface elegante e funcionalidades avançadas.

---

## 📋 Sobre o Projeto

**ClimaNow** é um aplicativo de previsão do tempo construído com tecnologias web modernas. Oferece:

- 🌍 Consulta de clima em qualquer cidade do mundo
- 📍 Geolocalização automática
- 📊 Previsão por hora e por dia
- 🗺️ Mapa interativo com dados climáticos
- ⏱️ Timelapse de temperatura horária
- ⭐ Sistema de cidades favoritas
- 🎨 Tema claro/escuro com fundo dinâmico
- 📱 Design responsivo (mobile-first)

---

## ✨ Funcionalidades Principais

### 🔍 Busca de Cidades
- Digite o nome de qualquer cidade para buscar o clima atual
- Suporta autocompletar e validação
- Exibe temperatura, sensação térmica e condições climáticas

### 📍 Geolocalização
- Detecta automaticamente sua localização
- Carrega o clima da sua região com um clique
- Requer permissão de localização do navegador

### ⭐ Favoritos
- Salve cidades frequentes para acesso rápido
- Gerencie lista de favoritos
- Dados salvos no `localStorage`

### ⏰ Previsão Horária
- Visualize as próximas 9 horas de previsão
- Mostra temperatura, ícone climático e chance de chuva
- Destaque da hora atual ("Agora")

### 📅 Previsão Diária
- Temperaturas máximas e mínimas dos próximos 5 dias
- Descrição do clima e probabilidade de chuva
- Ícones visuais para cada condição

### 🗺️ Mapa Interativo
- Mapa em tempo real usando Leaflet
- Camada de temperatura do OpenWeatherMap
- Marcador na localização consultada

### ⏱️ Timelapse de Temperatura
- Animação das temperaturas ao longo do dia
- Controles de play/pause
- Slider para navegar manualmente
- Atualização em tempo real da hora e temperatura

### 🎨 Tema Dinâmico
- Fundo que muda conforme a condição climática
- Tema claro e escuro customizáveis
- Glassmorphism design com blur effects

---

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Uso |
|-----------|-----|
| **HTML5** | Estrutura semântica |
| **CSS3** | Estilo com variáveis CSS, flexbox, grid |
| **JavaScript (ES6+)** | Lógica e interatividade |
| **Leaflet** | Mapa interativo |
| **OpenWeatherMap API** | Dados climáticos em tempo real |
| **LocalStorage** | Persistência de favoritos e tema |

---

## 🚀 Como Usar

### 1. **Clonar o Repositório**
```bash
git clone https://github.com/rebecapereirarehb/ClimaNow.git
cd ClimaNow
```

### 2. **Abrir no Navegador**
```bash
# Basta abrir o arquivo index.html
open index.html
```

Ou use um servidor local:
```bash
python -m http.server 8000
# Acesse: http://localhost:8000
```

### 3. **Configurar API Key**

1. Acesse [OpenWeatherMap](https://openweathermap.org/api)
2. Crie uma conta gratuita
3. Gere uma API Key
4. Edite `script.js` e substitua:
   ```javascript
   const API_KEY = '3e283ad17d6fdf3ec643837613c94443';
   ```
   Pela sua chave.

---

## 📖 Estrutura do Projeto

```
ClimaNow/
├── index.html          # HTML principal
├── style.css           # Estilos da aplicação
├── script.js           # Lógica JavaScript
├── README.md           # Este arquivo
└── assets/             # (Opcional) Imagens/ícones
```

### **index.html**
- Estrutura semântica com seções bem definidas
- Integra Leaflet CSS e script
- Referencia style.css e script.js

### **style.css**
- Variáveis CSS customizáveis (cores, espaçamento, fontes)
- Design responsivo com media queries
- Animações e transições suaves
- Tema claro/escuro via `data-theme`

### **script.js**
- Gerenciamento de estado global
- Integração com APIs (weather, forecast, onecall)
- Renderização dinâmica de UI
- Manipulação do mapa Leaflet
- Timelapse e animações

---

## 🎯 Recursos de API

### Endpoints Utilizados

| Endpoint | Descrição |
|----------|-----------|
| `/weather` | Clima atual |
| `/forecast` | Previsão de 5 dias (3h) |
| `/onecall` | Dados horários e por hora (1h) |

Todos os endpoints usam:
- `units=metric` (temperaturas em °C)
- `lang=pt_br` (idioma português)

---

## 🎨 Customização

### Alterar Cores
Edite as variáveis em `style.css`:
```css
:root {
  --accent: #60a5fa;           /* Cor principal (azul) */
  --bg-deep: #080c18;          /* Fundo escuro */
  --bg-card: rgba(...);        /* Fundo dos cards */
  /* ... mais variáveis */
}
```

### Alterar Fonte
```css
--font-display: 'Bebas Neue', sans-serif;  /* Títulos */
--font-body: 'Outfit', sans-serif;         /* Corpo */
```

### Alterar Limite de Favoritismo
Em `script.js`, ajuste quanto favoritos são salvos modificando a renderização.

---

## 🐛 Possíveis Problemas

### "API Key inválida"
- Verifique se a chave foi gerada no OpenWeatherMap
- Aguarde até 1 hora para propagação da chave
- Confirme que não há espaços extras em `script.js`

### Mapa não aparece
- Verifique conexão com internet (Leaflet precisa carregar tiles)
- Confira se há espaço suficiente no container `.weather-map`

### Geolocalização não funciona
- Navegador requer HTTPS ou localhost
- Permita acesso à localização quando solicitado
- Alguns navegadores bloqueiam por padrão

---

## 📱 Responsividade

- ✅ Desktop (1200px+)
- ✅ Tablet (768px - 1200px)
- ✅ Mobile (até 768px)
- ✅ Ultra-mini (até 380px)

---

## 🔐 Segurança

- API Key está configurada no código (não ideal para produção)
- Para produção, use backend proxy ou variáveis de ambiente
- Dados de favoritos são salvos localmente (não enviados a servidores)

---

## 📈 Melhorias Futuras

- [ ] PWA (Progressive Web App) para offline
- [ ] Múltiplos idiomas
- [ ] Alertas climáticos
- [ ] Histórico de buscas
- [ ] Integração com calendário
- [ ] Notificações push

---

## 📄 Licença

Este projeto é de código aberto e disponível para uso pessoal e educacional.

---

## 👤 Autor

**Rebeca Pereira**  
GitHub: [@rebecapereirarehb](https://github.com/rebecapereirarehb)

---

## 🤝 Contribuições

Sugestões e melhorias são bem-vindas! Sinta-se à vontade para:
- Reportar bugs
- Sugerir nuevas funcionalidades
- Abrir pull requests

---

**Desenvolvido com ❤️ para aqueles que amam dados climáticos precisos.**