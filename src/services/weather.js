import { apiKey } from '../keys/weatherAPIKey';
import * as Location from 'expo-location';
import { getName } from 'country-list';

export const fetchWeather = async (lat = 25, lon = 25) => {
    try {
        const response = await fetch(
            `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&APPID=${apiKey}&units=metric`
        );
        const json = await response.json();

        return {
            temperature: json.main.temp,
            weatherCondition: json.weather[0].main,
            locationCountry: getName(json.sys.country),
            locationName: json.name,
            icon: json.weather[0].icon,
        };
    } catch (error) {
        console.error('Error fetching weather:', error);
        throw error;
    }
};

export const getUserLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permission to access location was denied');
    }
    let location = await Location.getCurrentPositionAsync({});
    return location.coords;
  };