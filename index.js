document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.container');
    const search = document.querySelector('.search-box button');
    const weatherBox = document.querySelector('.weather-box');
    const weatherDetails = document.querySelector('.weather-details');
    const error404 = document.querySelector('.not-found');
    const forecastSection = document.querySelector('.forecast');
    const forecastTitle = document.querySelector('.forecast h2');
    const forecastDetails = document.querySelector('.forecast-details');
    const toggleMapBtn = document.querySelector('.toggle-map-btn');
    const weatherMap = document.querySelector('.weather-map');
    const mapContainer = document.querySelector('.map-container');
    const hourlyForecastBtn = document.getElementById('hourly-forecast-btn');
    const hourlyForecastModal = document.getElementById('hourly-forecast-modal');
    const closeHourlyForecastModal = document.querySelector('.close');

    const APIKey = 'e6e25c2cecd2759cff082b91f149e349';

    search.addEventListener('click', () => {
        const city = document.querySelector('.search-box input').value;

        if (city === '') {
            return;
        }

        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${APIKey}`)
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
                    case 'Mist':
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

                weatherBox.style.display = '';
                weatherDetails.style.display = '';
                weatherBox.classList.add('fadeIn');
                weatherDetails.classList.add('fadeIn');
                container.style.height = '590px';

                // Fetch hourly forecast from Open-Meteo API
                const latitude = json.coord.lat;
                const longitude = json.coord.lon;
                const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

                fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,precipitation&timezone=${timezone}`)
                    .then(response => response.json())
                    .then(data => {
                        // Clear previous hourly forecast data
                        const hourlyDetails = document.querySelector('.hourly-details');
                        hourlyDetails.innerHTML = '';

                        // Filter data for the next 24 hours
                        const next24HoursData = data.hourly.time.slice(0, 24);

                        // Add new hourly forecast data for the next 24 hours
                        next24HoursData.forEach((time, index) => {
                            const forecastCard = document.createElement('div');
                            forecastCard.classList.add('forecast-card');

                            const date = new Date(time);
                            const temperature = data.hourly.temperature_2m[index];
                            const precipitation = data.hourly.precipitation[index];

                            forecastCard.innerHTML = `
                                <p>${date.toLocaleString()}</p>
                                <p>Temperature: ${temperature}°C</p>
                                <p>Precipitation: ${precipitation}mm</p>
                            `;

                            hourlyDetails.appendChild(forecastCard);
                        });

                        // Show the hourly forecast section
                        const hourlyForecastSection = document.querySelector('.hourly-forecast');
                        hourlyForecastSection.style.display = 'block';
                    })
                    .catch(error => {
                        console.error('Error fetching hourly forecast data:', error);
                    });

                // Fetch 5-day forecast from OpenWeather API
                fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${APIKey}`)
                    .then(response => response.json())
                    .then(forecastData => {
                        forecastTitle.textContent = '5-Day Forecast';
                        forecastDetails.innerHTML = '';

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
                        console.error('Error fetching 5-day forecast data:', error);
                    });
            })
            .catch(error => {
                console.error('Error fetching weather data:', error);
            });
    });

    toggleMapBtn.addEventListener('click', () => {
        mapContainer.classList.toggle('show-map');
        weatherMap.classList.toggle('hide-map');
    });
// Function to open the hourly forecast modal
hourlyForecastBtn.onclick = function() {
    hourlyForecastModal.style.display = 'block';
};

// Function to close the hourly forecast modal
closeHourlyForecastModal.onclick = function() {
    hourlyForecastModal.style.display = 'none';
};

// Function to close the modal when clicking outside of it
window.onclick = function(event) {
    if (event.target == hourlyForecastModal) {
        hourlyForecastModal.style.display = 'none';
    }
};


document.getElementById('toggle-map-btn').addEventListener('click', function() {
    window.location.href = 'map.html'; // Replace with the actual URL of your new page
});

});



