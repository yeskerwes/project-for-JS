const apiKey = 'bd4255c5a39dd9a0cfc4106f4444a76e';
let isCelsius = true;

function fetchWeather() {
  const city = document.getElementById('city-input').value;
  fetchWeatherData(city);
}

function getCurrentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      fetchWeatherData(null, lat, lon);
    });
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

function showSuggestions() {
  const input = document.getElementById('city-input').value;
  const suggestionsList = document.getElementById('suggestions-list');

  if (input.length > 2) { 
    fetch(`https://api.openweathermap.org/data/2.5/find?q=${input}&appid=${apiKey}&units=metric`)
      .then(response => response.json())
      .then(data => {
        suggestionsList.innerHTML = '';
        data.list.forEach(city => {
          const suggestionItem = document.createElement('div');
          suggestionItem.textContent = `${city.name}, ${city.sys.country}`;
          suggestionItem.onclick = () => selectCity(city.name);
          suggestionsList.appendChild(suggestionItem);
        });
      });
  } else {
    suggestionsList.innerHTML = ''; 
  }
}

function selectCity(cityName) {
  document.getElementById('city-input').value = cityName;
  document.getElementById('suggestions-list').innerHTML = ''; 
  fetchWeather(); 
}


function fetchWeatherData(city = null, lat = null, lon = null) {
  let url = city 
    ? `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    : `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

  fetch(url)
    .then(response => response.json())
    .then(data => displayCurrentWeather(data));

  const forecastUrl = city
    ? `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
    : `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

  fetch(forecastUrl)
    .then(response => response.json())
    .then(data => displayForecast(data));
}

function displayCurrentWeather(data) {
  const cityName = document.getElementById('city-name');
  const temperature = document.getElementById('temperature');
  const weatherCondition = document.getElementById('weather-condition');
  const humidity = document.getElementById('humidity');
  const windSpeed = document.getElementById('wind-speed');
  const weatherIcon = document.getElementById('weather-icon');

  cityName.textContent = data.name;
  temperature.textContent = `Temperature: ${Math.round(data.main.temp)} °${isCelsius ? 'C' : 'F'}`;
  weatherCondition.textContent = data.weather[0].description;
  humidity.textContent = `Humidity: ${data.main.humidity}%`;
  windSpeed.textContent = `Wind Speed: ${data.wind.speed} m/s`;
  weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
}

function displayForecast(data) {
    const forecastContainer = document.getElementById('forecast-data');
    forecastContainer.innerHTML = ''; 
    for (let i = 0; i < 3; i++) {
      const forecast = data.list[i * 8]; 
      const forecastItem = document.createElement('div');
      forecastItem.classList.add('forecast-item');
  
      const date = new Date(forecast.dt * 1000);
      const day = date.toLocaleDateString('en-US', { weekday: 'short' });
  
      const temperature = Math.round(forecast.main.temp);
      const weatherCondition = forecast.weather[0].description;
      const weatherIcon = `https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`;
  
      forecastItem.innerHTML = `
        <div class="forecast-day">${day}</div>
        <img src="${weatherIcon}" alt="${weatherCondition}" class="forecast-icon">
        <p>${temperature}°${isCelsius ? 'C' : 'F'}</p>
        <p>${weatherCondition}</p>
      `;
  
      forecastContainer.appendChild(forecastItem);
    }
}
  
function toggleUnits() {
  isCelsius = !isCelsius;
  document.querySelector('button[onclick="toggleUnits()"]').textContent = `Switch to °${isCelsius ? 'F' : 'C'}`;
  fetchWeather();
}
