// Check if the Geolocation API is supported
if ('geolocation' in navigator) {
  navigator.geolocation.getCurrentPosition(
    position => {
      const { latitude, longitude } = position.coords;
      fetchWeatherData(null, latitude, longitude);
    },
    error => {
      console.error('Error getting location:', error);
      // Handle location access denied or error
    }
  );
} else {
  console.error('Geolocation is not supported by this browser.');
}

const container = document.querySelector('.container');
const search = document.querySelector('.search-box button');
const weatherBox = document.querySelector('.weather-box');
const weatherDetails = document.querySelector('.weather-details');
const error404 = document.querySelector('.not-found');
const forecastSection = document.querySelector('.forecast');
const forecastTitle = document.querySelector('.forecast h2');
const forecastDetails = document.querySelector('.forecast-details');

search.addEventListener('click', () => {
  const APIKey = 'e6e25c2cecd2759cff082b91f149e349';
  const city = document.querySelector('.search-box input').value;

  if (city === '') {
    return;
  }

  const url = city
    ? `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${APIKey}`
    : `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${APIKey}`;

  fetch(url)
    .then(response => response.json())
    .then(json => {
      if (json.cod === '404') {
        container.style.height = '400px';
        weatherBox.style.display = 'none';
        weatherDetails.style.display = 'none';
        error404.style.display = 'block';
        error404.classList.add('fadeIn');
        forecastSection.style.display = 'none';
        forecastTitle.style.display = 'none';
        return;
      }

      error404.style.display = 'none';
      error404.classList.remove('fadeIn');

      const image = document.querySelector('.weather-box img');
      const temperature = document.querySelector('.weather-box .temperature');
      const description = document.querySelector('.weather-box .description');
      const humidity = document.querySelector('.weather-details .humidity span');
      const wind = document.querySelector('.weather-details .wind span');
      const pressure = document.querySelector('.weather-details .pressure span');
      const uvIndex = document.querySelector('.weather-details .uv-index span');
      const visibility = document.querySelector('.weather-details .visibility span');

      switch (json.weather[0].main) {
        case 'Clear':
          image.src = 'images/clear.png';
          break;

        case 'Rain':
          image.src = 'images/rain.png';
          break;

        case 'Snow':
          image.src = 'images/snow.png';
          break;

        case 'Clouds':
          image.src = 'images/cloud.png';
          break;

        case 'Haze':
          image.src = 'images/mist.png';
          break;

        case 'Mists':
          image.src = 'images/mist.png';
          break;

        default:
          image.src = '';
      }

      temperature.innerHTML = `${parseInt(json.main.temp)}<span>°C</span>`;
      description.innerHTML = `${json.weather[0].description}`;
      humidity.innerHTML = `${json.main.humidity}%`;
      wind.innerHTML = `${parseInt(json.wind.speed)}Km/h`;
      pressure.innerHTML = `${json.main.pressure}hPa`;

      const sunrise = new Date(json.sys.sunrise * 1000);
      const sunset = new Date(json.sys.sunset * 1000);
      const currentTime = new Date();

      if (currentTime > sunrise && currentTime < sunset) {
        fetch(`https://api.openweathermap.org/data/2.5/uvi?lat=${json.coord.lat}&lon=${json.coord.lon}&appid=${APIKey}`)
          .then(response => response.json())
          .then(uvData => {
            uvIndex.innerHTML = `${uvData.value}`;
          })
          .catch(error => {
            console.error('Error fetching UV data:', error);
            uvIndex.innerHTML = 'N/A';
          });
      } else {
        uvIndex.innerHTML = 'Night time';
      }

      visibility.innerHTML = `${json.visibility / 1000}km`;

      // Check for weather alerts
      if (json.weather && json.weather.length > 0) {
        const weatherAlert = json.weather.find(item => item.id >= 700);
        if (weatherAlert) {
          const alertMessage = `Weather Alert: ${weatherAlert.description}`;
          showNotification(alertMessage);
        }
      }

      weatherBox.style.display = '';
      weatherDetails.style.display = '';
      weatherBox.classList.add('fadeIn');
      weatherDetails.classList.add('fadeIn');
      container.style.height = '590px';

      fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${APIKey}`)
        .then(response => response.json())
        .then(forecastData => {
          forecastSection.style.display = 'block';
          forecastTitle.style.display = 'block';

          forecastDetails.innerHTML = '';
          forecastTitle.textContent = '5-Day Forecast';

          const nextFiveDaysData = forecastData.list.filter(item => item.dt_txt.includes('12:00:00'));

          nextFiveDaysData.forEach(dayData => {
            const date = new Date(dayData.dt * 1000);
            const forecastCard = document.createElement('div');
            forecastCard.classList.add('forecast-card');

            const day = date.toLocaleDateString('en-US', { weekday: 'short' });
            const temp = `${parseInt(dayData.main.temp)}°C`;
            const weatherDescription = dayData.weather[0].description;

            forecastCard.innerHTML = `
              <p>${day}</p>
              <img src="https://openweathermap.org/img/wn/${dayData.weather[0].icon}.png" alt="${weatherDescription}">
              <p>${weatherDescription}</p>
              <p>${temp}</p>
            `;

            forecastDetails.appendChild(forecastCard);
          });
        })
        .catch(error => {
          console.error('Error fetching forecast data:', error);
        });
    })
    .catch(error => {
      console.error('Error fetching weather data:', error);
    });
});

function showNotification(message) {
  if ('Notification' in window) {
    Notification.requestPermission()
      .then(permission => {
        if (permission === 'granted') {
          const notification = new Notification('Weather Alert', {
            body: message,
            icon: 'images/notification-icon.png' // Replace with your desired icon
          });
        } else {
          console.error('Notification permission denied.');
        }
      })
      .catch(error => {
        console.error('Error requesting notification permission:', error);
      });
  } else {
    console.error('Notifications are not supported by this browser.');
  }
}