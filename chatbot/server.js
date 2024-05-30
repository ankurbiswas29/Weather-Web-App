const express = require('express');
const fetch = require('node-fetch');

const app = express();
const port = 3000; // Choose a port for your server

const APIKey = 'e6e25c2cecd2759cff082b91f149e349'; // Your OpenWeatherMap API Key

app.get('/weather', async (req, res) => {
    const city = req.query.city;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${APIKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
