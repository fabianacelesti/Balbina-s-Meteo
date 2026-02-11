// =========================
// ELEMENTI DOM
// =========================
const welcomeScreen = document.querySelector(".welcome-screen");
const searchContainer = document.querySelector(".search-container");
const searchInput = document.querySelector(".welcome-search .search-input");
const searchInputTop = document.querySelector(".search-input-top");
const quickButtons = document.querySelectorAll(".quick-btn");

const weatherCard = document.querySelector(".weather-card");
const loadingContainer = document.querySelector(".loading-container");
const errorContainer = document.querySelector(".error-container");

// Location
const locationName = document.querySelector(".location-name");

// Temperature
const tempMain = document.querySelector(".temp-main");
const tempCondition = document.querySelector(".temp-condition");
const tempRange = document.querySelector(".temp-range");

// Hourly
const hourlyDescription = document.querySelector(".hourly-description");
const hourlyForecast = document.querySelector(".hourly-forecast");

// Forecast list
const forecastList = document.querySelector(".forecast-list");

// Details
const windSpeed = document.querySelector(".wind-speed");
const humidityValue = document.querySelector(".humidity-value");
const feelsValue = document.querySelector(".feels-value");
const visibilityValue = document.querySelector(".visibility-value");
const pressureValue = document.querySelector(".pressure-value");
const uvValue = document.querySelector(".uv-value");
const uvDescription = document.querySelector(".uv-description");
const sunriseValue = document.querySelector(".sunrise-value");
const sunsetValue = document.querySelector(".sunset-value");
const sunPosition = document.querySelector(".sun-position");

// Video
const videoElement = document.querySelector(".weather-video source");
const videoPlayer = document.querySelector(".weather-video");

// =========================
// CONFIG API
// =========================
const API_KEY = "60d1be78a985ca40d2a2645d670cb44e"; 
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";
const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";

// =========================
// EMOJI METEO
// =========================
const weatherEmojis = {
  clear: "☀️",
  clouds: "☁️",
  rain: "🌧️",
  drizzle: "🌦️",
  snow: "❄️",
  mist: "🌫️",
  fog: "🌫️",
  thunderstorm: "⛈️"
};

// =========================
// GET EMOJI
// =========================
function getWeatherEmoji(weatherMain) {
  const main = weatherMain.toLowerCase();
  if (main.includes("clear")) return weatherEmojis.clear;
  if (main.includes("cloud")) return weatherEmojis.clouds;
  if (main.includes("rain")) return weatherEmojis.rain;
  if (main.includes("drizzle")) return weatherEmojis.drizzle;
  if (main.includes("snow")) return weatherEmojis.snow;
  if (main.includes("thunder")) return weatherEmojis.thunderstorm;
  return weatherEmojis.mist;
}

// =========================
// AGGIORNA VIDEO
// =========================
function updateVideo(weatherMain) {
  let videoSrc = "";
  
  if (weatherMain.includes("clear")) {
    videoSrc = "videos/sunny.mp4";
  } else if (weatherMain.includes("cloud")) {
    videoSrc = "videos/cloudy.mp4";
  } else if (weatherMain.includes("rain") || weatherMain.includes("drizzle")) {
    videoSrc = "videos/rainy.mp4";
  } else if (weatherMain.includes("snow")) {
    videoSrc = "videos/snowy.mp4";
  } else {
    videoSrc = "videos/mist.mp4";
  }
  
  const currentSrc = videoElement.getAttribute("src");
  if (currentSrc !== videoSrc) {
    videoElement.src = videoSrc;
    videoPlayer.load();
    videoPlayer.play().catch(err => console.log("Autoplay:", err));
  }
}

// =========================
// CAPITALIZZA
// =========================
function capitalize(str) {
  return str
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// =========================
// DESCRIZIONE VENTO
// =========================
function getWindDescription(speed) {
  if (speed < 5) return "Calma";
  if (speed < 12) return "Brezza leggera";
  if (speed < 20) return "Brezza";
  if (speed < 30) return "Vento moderato";
  return "Vento forte";
}

// =========================
// DESCRIZIONE UV
// =========================
function getUVDescription(uv) {
  if (uv <= 2) return "Basso";
  if (uv <= 5) return "Moderato";
  if (uv <= 7) return "Alto";
  if (uv <= 10) return "Molto alto";
  return "Estremo";
}

// =========================
// FORMATTA ORA
// =========================
function formatTime(timestamp, timezone) {
  const date = new Date((timestamp + timezone) * 1000);
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

// =========================
// CALCOLA POSIZIONE SOLE
// =========================
function calculateSunPosition(sunrise, sunset, timezone) {
  const now = Date.now() / 1000;
  const sunriseTime = sunrise;
  const sunsetTime = sunset;
  
  if (now < sunriseTime) {
    // Prima dell'alba - sole a sinistra
    return 10;
  } else if (now > sunsetTime) {
    // Dopo il tramonto - sole a destra
    return 90;
  } else {
    // Durante il giorno - calcola posizione
    const dayProgress = (now - sunriseTime) / (sunsetTime - sunriseTime);
    return 10 + (dayProgress * 80);
  }
}

// =========================
// FETCH METEO
// =========================
async function fetchWeather(city) {
  // Reset UI
  weatherCard.classList.add("hidden");
  errorContainer.classList.add("hidden");
  loadingContainer.classList.remove("hidden");
  
  // Nascondi welcome screen e mostra search bar
  welcomeScreen.classList.add("hidden");
  searchContainer.classList.remove("hidden");

  try {
    const response = await fetch(
      `${BASE_URL}?q=${city}&units=metric&lang=it&appid=${API_KEY}`
    );

    if (!response.ok) throw new Error("Città non trovata");

    const data = await response.json();

    // Update location
    locationName.textContent = data.name;

    // Update temperature
    const temp = Math.round(data.main.temp);
    const tempMax = Math.round(data.main.temp_max);
    const tempMin = Math.round(data.main.temp_min);
    
    tempMain.textContent = `${temp}°`;
    tempCondition.textContent = capitalize(data.weather[0].description);
    tempRange.textContent = `MAX: ${tempMax}° MIN: ${tempMin}°`;

    // Update details
    const wind = Math.round(data.wind.speed * 3.6);
    windSpeed.textContent = `${wind} km/h`;
    document.querySelector(".detail-subtitle").textContent = getWindDescription(wind);
    
    humidityValue.textContent = `${data.main.humidity}%`;
    feelsValue.textContent = `${Math.round(data.main.feels_like)}°`;
    
    const visibility = data.visibility ? (data.visibility / 1000).toFixed(1) : "10";
    visibilityValue.textContent = `${visibility} km`;

    // Pressione
    const pressure = data.main.pressure;
    pressureValue.textContent = `${pressure} hPa`;
    
    // UV Index (simulato - l'API base non lo fornisce)
    const uvIndex = Math.floor(Math.random() * 8) + 1;
    uvValue.textContent = uvIndex;
    uvDescription.textContent = getUVDescription(uvIndex);

    // Alba e Tramonto
    const timezone = data.timezone;
    const sunrise = formatTime(data.sys.sunrise, timezone);
    const sunset = formatTime(data.sys.sunset, timezone);
    sunriseValue.textContent = sunrise;
    sunsetValue.textContent = sunset;
    
    // Posizione del sole nell'arco
    const sunPosX = calculateSunPosition(data.sys.sunrise, data.sys.sunset, timezone);
    sunPosition.setAttribute('cx', sunPosX);
    
    // Calcola l'altezza del sole (arco parabolico)
    const normalizedX = (sunPosX - 10) / 80;
    const sunPosY = 45 - (Math.sin(normalizedX * Math.PI) * 40);
    sunPosition.setAttribute('cy', sunPosY);

    // Update video
    const weatherMain = data.weather[0].main.toLowerCase();
    updateVideo(weatherMain);

    // Hourly description
    hourlyDescription.textContent = `${capitalize(data.weather[0].description)} per tutto il giorno. Folate di vento fino a ${wind} km/h.`;

    // Fetch forecast
    await fetchForecast(city);

    weatherCard.classList.remove("hidden");

  } catch (error) {
    errorContainer.querySelector(".error-message").textContent = error.message;
    errorContainer.classList.remove("hidden");
  } finally {
    loadingContainer.classList.add("hidden");
  }
}

// =========================
// FETCH FORECAST
// =========================
async function fetchForecast(city) {
  try {
    const response = await fetch(
      `${FORECAST_URL}?q=${city}&units=metric&lang=it&appid=${API_KEY}`
    );

    if (!response.ok) throw new Error("Previsioni non disponibili");

    const data = await response.json();

    // HOURLY FORECAST (prossime 6 ore)
    hourlyForecast.innerHTML = "";
    const hourlyData = data.list.slice(0, 6);
    
    hourlyData.forEach((item, index) => {
      const date = new Date(item.dt_txt);
      const hour = index === 0 ? "Ora" : date.getHours() + ":00";
      const emoji = getWeatherEmoji(item.weather[0].main);
      const temp = Math.round(item.main.temp);
      
      const hourlyItem = document.createElement("div");
      hourlyItem.className = "hourly-item";
      hourlyItem.innerHTML = `
        <div class="hourly-time">${hour}</div>
        <div class="hourly-icon">${emoji}</div>
        <div class="hourly-temp">${temp}°</div>
      `;
      hourlyForecast.appendChild(hourlyItem);
    });

    // DAILY FORECAST (10 giorni)
    forecastList.innerHTML = "";
    const dailyTemps = {};
    
    data.list.forEach(item => {
      const date = new Date(item.dt_txt);
      const dayKey = date.toLocaleDateString("it-IT");
      
      if (!dailyTemps[dayKey]) {
        dailyTemps[dayKey] = {
          date: date,
          temps: [],
          weather: item.weather[0].main
        };
      }
      dailyTemps[dayKey].temps.push(item.main.temp);
    });

    Object.values(dailyTemps).slice(0, 10).forEach((day, index) => {
      const dayName = index === 0 
        ? "Oggi" 
        : day.date.toLocaleDateString("it-IT", { weekday: "short" });
      
      const tempLow = Math.round(Math.min(...day.temps));
      const tempHigh = Math.round(Math.max(...day.temps));
      const emoji = getWeatherEmoji(day.weather);
      
      const forecastDay = document.createElement("div");
      forecastDay.className = "forecast-day";
      forecastDay.innerHTML = `
        <div class="forecast-day-name">${capitalize(dayName)}</div>
        <div class="forecast-icon">${emoji}</div>
        <div class="forecast-bar"></div>
        <div class="forecast-temps">
          <span class="forecast-temp-low">${tempLow}°</span>
          <span class="forecast-temp-high">${tempHigh}°</span>
        </div>
      `;
      forecastList.appendChild(forecastDay);
    });

  } catch (err) {
    console.error("Errore forecast:", err);
  }
}

// =========================
// EVENTI
// =========================

// Welcome screen search
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const city = searchInput.value.trim();
    if (city) {
      fetchWeather(city);
      searchInput.value = "";
    }
  }
});

// Top search bar (dopo la ricerca)
searchInputTop.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const city = searchInputTop.value.trim();
    if (city) {
      fetchWeather(city);
      searchInputTop.value = "";
      searchInputTop.blur();
    }
  }
});

// Quick city buttons
quickButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const city = btn.dataset.city;
    fetchWeather(city);
  });
});

// Default video on load (senza meteo)
videoElement.src = "videos/cloudy.mp4";
videoPlayer.load();
videoPlayer.play().catch(err => console.log("Autoplay:", err));