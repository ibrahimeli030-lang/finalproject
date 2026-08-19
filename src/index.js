const input = document.getElementById("cityInput");
const btn = document.getElementById("searchBtn");
const locateBtn = document.getElementById("locateBtn");
const result = document.getElementById("result");
const forecastEl = document.getElementById("forecast");

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Maps Open-Meteo weather codes to a human description + icon key.
// Source of truth: https://open-meteo.com/en/docs (WMO weather codes)
function decodeWeather(code) {
  const map = {
    0: ["clear sky", "sun"],
    1: ["mainly clear", "sun-cloud"],
    2: ["partly cloudy", "sun-cloud"],
    3: ["overcast clouds", "cloud"],
    45: ["fog", "fog"],
    48: ["depositing rime fog", "fog"],
    51: ["light drizzle", "rain"],
    53: ["moderate drizzle", "rain"],
    55: ["dense drizzle", "rain"],
    56: ["light freezing drizzle", "rain"],
    57: ["dense freezing drizzle", "rain"],
    61: ["slight rain", "rain"],
    63: ["moderate rain", "rain"],
    65: ["heavy rain", "rain"],
    66: ["light freezing rain", "rain"],
    67: ["heavy freezing rain", "rain"],
    71: ["slight snow fall", "snow"],
    73: ["moderate snow fall", "snow"],
    75: ["heavy snow fall", "snow"],
    77: ["snow grains", "snow"],
    80: ["slight rain showers", "rain"],
    81: ["moderate rain showers", "rain"],
    82: ["violent rain showers", "rain"],
    85: ["slight snow showers", "snow"],
    86: ["heavy snow showers", "snow"],
    95: ["thunderstorm", "storm"],
    96: ["thunderstorm with hail", "storm"],
    99: ["thunderstorm with heavy hail", "storm"],
  };
  return map[code] || ["unknown", "cloud"];
}

function iconSVG(key) {
  // Shared layered-cloud base used across variants, in the same soft
  // blue/gray palette, so all icons read as one consistent family.
  const cloudBack = `<path d="M40 30c7 0 12.5 5.3 13 12 6 1 10 5.7 10 11.4C63 60.2 57.6 65 51 65H19c-7 0-13-5.5-13-12.8 0-6.2 4.4-11.4 10.4-12.5C16.9 32 22.8 27 30 27c4 0 7.6 1.5 10 4z" fill="#C7D2ED"/>`;
  const cloudFront = `<path d="M38 34c6 0 10.8 4.6 11.2 10.4C54.5 45.3 58 49.6 58 54.6 58 60.3 53.2 65 47.3 65H21c-6.6 0-12-5.2-12-11.7 0-5.7 4.1-10.5 9.6-11.5C20 35.3 25.2 31 31.4 31c3.4 0 6.4 1.3 8.6 3.4z" fill="#EAEFF9"/>`;
  const sunBadge = `<circle cx="19" cy="18" r="10" fill="#FDB813"/>
      <g stroke="#FDB813" stroke-width="2.6" stroke-linecap="round">
        <line x1="19" y1="1" x2="19" y2="6"/><line x1="19" y1="30" x2="19" y2="35"/>
        <line x1="2" y1="18" x2="7" y2="18"/><line x1="31" y1="18" x2="36" y2="18"/>
        <line x1="7.5" y1="6.5" x2="11" y2="10"/><line x1="27" y1="26" x2="30.5" y2="29.5"/>
        <line x1="30.5" y1="6.5" x2="27" y2="10"/><line x1="11" y1="26" x2="7.5" y2="29.5"/>
      </g>`;
  const rainDrops = `<g stroke="#5B9BD5" stroke-width="3" stroke-linecap="round">
        <line x1="24" y1="58" x2="21" y2="66"/>
        <line x1="35" y1="58" x2="32" y2="66"/>
        <line x1="46" y1="58" x2="43" y2="66"/>
      </g>`;
  const snowDots = `<g fill="#8FB6E0">
        <circle cx="24" cy="61" r="2.6"/><circle cx="35" cy="65" r="2.6"/><circle cx="46" cy="61" r="2.6"/>
      </g>`;
  const bolt = `<polygon points="35,50 26,64 33,64 29,74 44,56 36,56" fill="#FDB813"/>`;
  const fogLines = `<g stroke="#B9C0CF" stroke-width="4" stroke-linecap="round">
        <line x1="8" y1="26" x2="56" y2="26"/>
        <line x1="4" y1="38" x2="60" y2="38"/>
        <line x1="8" y1="50" x2="56" y2="50"/>
      </g>`;

  const icons = {
    sun: `<svg class="icon" viewBox="0 0 64 64"><circle cx="32" cy="32" r="16" fill="#FDB813"/>
      <g stroke="#FDB813" stroke-width="4" stroke-linecap="round">
        <line x1="32" y1="2" x2="32" y2="10"/><line x1="32" y1="54" x2="32" y2="62"/>
        <line x1="2" y1="32" x2="10" y2="32"/><line x1="54" y1="32" x2="62" y2="32"/>
        <line x1="10.5" y1="10.5" x2="16" y2="16"/><line x1="48" y1="48" x2="53.5" y2="53.5"/>
        <line x1="53.5" y1="10.5" x2="48" y2="16"/><line x1="16" y1="48" x2="10.5" y2="53.5"/>
      </g></svg>`,
    "sun-cloud": `<svg class="icon" viewBox="0 0 64 64">${sunBadge}${cloudBack}${cloudFront}</svg>`,
    cloud: `<svg class="icon" viewBox="0 0 64 64">${cloudBack}${cloudFront}</svg>`,
    rain: `<svg class="icon" viewBox="0 0 64 64">${sunBadge}${cloudBack}${cloudFront}${rainDrops}</svg>`,
    snow: `<svg class="icon" viewBox="0 0 64 64">${cloudBack}${cloudFront}${snowDots}</svg>`,
    storm: `<svg class="icon" viewBox="0 0 64 64">${cloudBack}${cloudFront}${bolt}</svg>`,
    fog: `<svg class="icon" viewBox="0 0 64 64">${fogLines}</svg>`,
  };
  return icons[key] || icons["cloud"];
}

function showLoading() {
  result.innerHTML = `<div class="weather-body"><div class="placeholder">Loading…</div></div>`;
  forecastEl.innerHTML = "";
}

function showError(msg) {
  result.innerHTML = `<div class="weather-body"><div class="error">${msg}</div></div>`;
  forecastEl.innerHTML = "";
}

function renderForecast(daily) {
  // daily.time[0] is today, so forecast cards start at index 1
  const cards = [];
  for (let i = 1; i < daily.time.length && cards.length < 5; i++) {
    const date = new Date(daily.time[i] + "T00:00:00");
    const dayLabel = DAYS_SHORT[date.getDay()];
    const [, iconKey] = decodeWeather(daily.weather_code[i]);
    const hi = Math.round(daily.temperature_2m_max[i]);
    const lo = Math.round(daily.temperature_2m_min[i]);
    cards.push(`
      <div class="forecast-day">
        <div class="day-label">${dayLabel}</div>
        ${iconSVG(iconKey)}
        <div class="temps">${hi}°<span class="lo">${lo}°</span></div>
      </div>
    `);
  }
  forecastEl.innerHTML = cards.join("");
}

function renderWeather(name, cur, daily) {
  const [desc, iconKey] = decodeWeather(cur.weather_code);

  const localDate = new Date(cur.time);
  const dayName = DAYS[localDate.getDay()];
  const hh = localDate.getHours();
  const mm = localDate.getMinutes().toString().padStart(2, "0");

  result.innerHTML = `
    <div class="weather-body">
      <div>
        <h1 class="city-name">${name}</h1>
        <p class="meta">${dayName} ${hh}:${mm}, ${desc}</p>
        <p class="meta"><span class="label">Feels like:</span> <strong>${Math.round(cur.apparent_temperature)}°C</strong></p>
        <p class="meta"><span class="label">Humidity:</span> <strong>${cur.relative_humidity_2m}%</strong>, <span class="label">Wind:</span> <strong>${cur.wind_speed_10m.toFixed(2)}km/h</strong></p>
      </div>
      <div class="temp-block">
        ${iconSVG(iconKey)}
        <div class="temp">
          <span class="num">${Math.round(cur.temperature_2m)}</span>
          <span class="deg">°C</span>
        </div>
      </div>
    </div>
  `;

  if (daily) {
    renderForecast(daily);
  }
}

async function fetchWeatherForCoords(
  latitude,
  longitude,
  timezone,
  displayName,
) {
  const weatherRes = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
      `&forecast_days=6&timezone=${encodeURIComponent(timezone)}`,
  );
  const weatherData = await weatherRes.json();

  if (!weatherData.current) {
    showError("Weather data unavailable right now. Please try again.");
    return;
  }

  renderWeather(displayName, weatherData.current, weatherData.daily);
}

async function searchCity() {
  const city = input.value.trim();
  if (!city) {
    return;
  }

  btn.disabled = true;
  locateBtn.disabled = true;
  showLoading();

  try {
    // 1. Geocode the city name into coordinates
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`,
    );
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      showError(`Couldn't find "${city}". Try another city name.`);
      return;
    }

    const place = geoData.results[0];
    const { latitude, longitude, name, timezone } = place;

    // 2. Fetch current weather + 5-day forecast for those coordinates
    await fetchWeatherForCoords(latitude, longitude, timezone, name);
  } catch (err) {
    showError("Something went wrong fetching the weather. Please try again.");
  } finally {
    btn.disabled = false;
    locateBtn.disabled = false;
  }
}

async function reverseGeocode(latitude, longitude) {
  // Free, keyless reverse geocoding (used only to display a real place name
  // for the coordinates the browser gave us — no fabricated data).
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
    );
    const data = await res.json();
    return (
      data.city || data.locality || data.principalSubdivision || "Your location"
    );
  } catch (err) {
    return "Your location";
  }
}

function useMyLocation() {
  if (!navigator.geolocation) {
    showError("Geolocation isn't supported by your browser.");
    return;
  }

  btn.disabled = true;
  locateBtn.disabled = true;
  showLoading();

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const timezone =
          Intl.DateTimeFormat().resolvedOptions().timeZone || "auto";
        const name = await reverseGeocode(latitude, longitude);
        input.value = name;
        await fetchWeatherForCoords(latitude, longitude, timezone, name);
      } catch (err) {
        showError(
          "Something went wrong fetching the weather. Please try again.",
        );
      } finally {
        btn.disabled = false;
        locateBtn.disabled = false;
      }
    },
    () => {
      showError("Location access was denied. Search for a city instead.");
      btn.disabled = false;
      locateBtn.disabled = false;
    },
  );
}

btn.addEventListener("click", searchCity);
locateBtn.addEventListener("click", useMyLocation);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") searchCity();
});

// Load Paris by default on first open
input.value = "Paris";
searchCity();
