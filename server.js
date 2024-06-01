const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = 5500;

const GEMINI_API_KEY = 'AIzaSyAX9uJgItUcY-rh_BtRbCW_IH_57GH3Tg0'; 
const OPENWEATHER_API_KEY = 'e6e25c2cecd2759cff082b91f149e349'; 

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if ('OPTIONS' === req.method) {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Function to parse user input using Gemini API
const parseUserInput = async (input) => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent({
            contents: [
                {
                    parts: [
                        {
                            text: `Parse the following query to identify the location and the weather-related intent: "${input}". Return the result as a JSON object with "location" and "intent".`
                        }
                    ]
                }
            ]
        });

        console.log('Gemini API response for parsing:', JSON.stringify(result, null, 2));

        if (
            result &&
            result.response &&
            result.response.candidates &&
            result.response.candidates[0] &&
            result.response.candidates[0].content &&
            result.response.candidates[0].content.parts &&
            result.response.candidates[0].content.parts[0] &&
            result.response.candidates[0].content.parts[0].text
        ) {
            const jsonString = result.response.candidates[0].content.parts[0].text
                .replace('```json\n', '') // Remove code block start
                .replace('\n``` \n', ''); // Remove code block end and extra newline

            const parsedResponse = JSON.parse(jsonString);
            const { location, intent } = parsedResponse;
            return { location, intent };
        } else {
            throw new Error('Invalid response format from Gemini API');
        }
    } catch (geminiError) {
        console.error('Error processing Gemini API:', geminiError);
        throw geminiError;
    }
};

// Function to get weather data using OpenWeatherMap API
const getWeatherData = async (location) => {
    try {
        const weatherResponse = await axios.get(
            'http://api.openweathermap.org/data/2.5/weather',
            {
                params: {
                    q: location,
                    appid: OPENWEATHER_API_KEY,
                    units: 'metric',
                },
            }
        );
        console.log('OpenWeatherMap API response:', weatherResponse.data);
        return weatherResponse.data;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        throw error;
    }
};

// Endpoint to handle weather-related queries
app.post('/api/ai/weather', async (req, res) => {
    const userInput = req.body.userInput?.trim();

    if (!userInput) {
        return res.status(400).json({ error: 'Invalid input' });
    }

    try {
        const { location, intent } = await parseUserInput(userInput);

        if (!location) {
            return res.status(400).json({ error: 'Location not found in the query' });
        }

        const weatherData = await getWeatherData(location);
        const temperature = weatherData.main.temp;
        const description = weatherData.weather?.[0]?.description || 'N/A';
        const precipitation = weatherData.rain ? weatherData.rain['1h'] || weatherData.rain['3h'] || '0 mm' : '0 mm';

        let geminiData = 'N/A';

        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
            const result = await model.generateContent({
                contents: [
                    {
                        parts: [
                            {
                                text: `What is the weather like in ${location}?`
                            }
                        ]
                    }
                ]
            });
            console.log('Gemini API response for weather query:', JSON.stringify(result, null, 2));

            if (result && result.response && result.response.candidates && result.response.candidates[0] && result.response.candidates[0].text) {
                geminiData = result.response.candidates[0].text || 'N/A';
            }
        } catch (geminiError) {
            console.error('Error processing Gemini API:', geminiError);
        }

        let responseText = `Weather in ${location}: ${description}, Temperature: ${temperature}°C. ${geminiData}`;
        if (intent.includes('rain')) {
            responseText += ` Precipitation: ${precipitation}.`;
        }

        res.json({ response: responseText });
    } catch (error) {
        console.error('Error processing weather query:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
