// Check if the Geolocation API is supported and if the origin is secure
if ('geolocation' in navigator && window.location.protocol === 'https:') {
    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        fetchWeatherData(null, latitude, longitude);
      },
      error => {
        console.error('Error getting location:', error);
        // Handle location access denied or error
        fetchWeatherData('Kolkata'); // Fallback to a default city
      }
    );
  } else {
    console.error('Geolocation is not supported or the origin is not secure.');
    fetchWeatherData('Kolkata'); // Fallback to a default city
  }
  
  const container = document.querySelector('.container');
  const search = document.querySelector('.search-box button');
  const weatherBox = document.querySelector('.weather-box');
  const weatherDetails = document.querySelector('.weather-details');
  const error404 = document.querySelector('.not-found');
  const forecastSection = document.querySelector('.forecast');
  const forecastTitle = document.querySelector('.forecast h2');
  const forecastDetails = document.querySelector('.forecast-details');
  
  function fetchWeatherData(city = 'Kolkata', latitude = null, longitude = null) {
    const APIKey = 'e6e25c2cecd2759cff082b91f149e349';
    let urlCurrentWeather, urlForecast;
  
    if (city) {
      urlCurrentWeather = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${APIKey}`;
      urlForecast = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${APIKey}`;
    } else if (latitude !== null && longitude !== null) {
      urlCurrentWeather = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${APIKey}`;
      urlForecast = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${APIKey}`;
    } else {
      console.error('Invalid parameters for fetching weather data.');
      return;
    }
  
    fetch(urlCurrentWeather)
      .then(response => response.json())
      .then(json => {
        if (json.cod === '404') {
          handleNotFoundError();
        } else {
          handleWeatherData(json);
          fetchForecastData(urlForecast); // Pass forecast URL
        }
      })
      .catch(error => {
        console.error('Error fetching weather data:', error);
        handleFallbackData(city);
      });
  }
  
  function fetchForecastData(urlForecast) {
    fetch(urlForecast)
      .then(response => {
        if (!response.ok) {
          throw new Error('Forecast data request failed');
        }
        return response.json();
      })
      .then(forecastData => {
        handleForecastData(forecastData);
      })
      .catch(error => {
        console.error('Error fetching forecast data:', error);
        handleForecastFallbackData();
      });
  }
  
  function handleWeatherData(data) {
    // Handle display of current weather data
  }
  
  function handleForecastData(data) {
    // Handle display of 5-day forecast data
  }
  
  function handleNotFoundError() {
    container.style.height = '400px';
    weatherBox.style.display = 'none';
    weatherDetails.style.display = 'none';
    error404.style.display = 'block';
    error404.classList.add('fadeIn');
    forecastSection.style.display = 'none';
    forecastTitle.style.display = 'none';
  }
  
  function handleFallbackData(city) {
    console.error('Error fetching weather data for', city);
    // Handle fallback data or display error message
  }
  
  function handleForecastFallbackData() {
    console.error('Error fetching forecast data.');
    // Handle fallback data or display error message
  }
  
  // Call fetchWeatherData with appropriate parameters
  fetchWeatherData('Kolkata'); // Or use geolocation to get the city dynamically
  