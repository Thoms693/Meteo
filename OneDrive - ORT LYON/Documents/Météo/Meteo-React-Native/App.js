import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, ScrollView, SafeAreaView, Image, ImageBackground } from 'react-native';
import * as Location from 'expo-location';

const API_KEY = 'ec49a466ec6f0aa36074090dd3b60a64';

export default function App() {
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const image = { uri: 'https://www.fabmood.com/wp-content/uploads/2022/04/spring-wallpaper-6.jpg' };

  //demande lalocalisation
  useEffect(() => {
    getLocation();
  }, []);

  //appels API pour recup les donnés météo et prévisions dès que la localisation change
  useEffect(() => {
    if (location) {
      fetchWeather();
      fetchForecast();
    }
  }, [location]);

  //permissions de localisation de l'utilisateur
  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.error('Permission to access location was denied');
      return;
    }

    //coordonnées de localisation de l'utilisateur
    let location = await Location.getCurrentPositionAsync({});
    setLocation(location);
  };

  const fetchWeather = () => {
    fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${location.coords.latitude}&lon=${location.coords.longitude}&appid=${API_KEY}&units=metric&lang=FR`
    )
        .then((response) => response.json())
        .then((json) => {
          setWeather(json);
        })
        .catch((error) => {
          console.error(error);
        });
  };

  //récup les prévisions météo sur 5 jours

  const fetchForecast = () => {
    fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${location.coords.latitude}&lon=${location.coords.longitude}&appid=${API_KEY}&units=metric&lang=FR`
    )
        .then((response) => response.json())
        .then((json) => {
          const filteredForecast = json.list.filter((item) => item.dt_txt.includes('15:00:00'));
          setForecast(filteredForecast);
        })
        .catch((error) => {
          console.error(error);
        });
  };

  //conversion date en jour de la semaine
  const getDayOfWeek = (dateString) => {
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const date = new Date(dateString);
    const dayOfWeek = date.getDay();
    return days[dayOfWeek];
  };
//interface utilisateur
  return (
      <ImageBackground source={image} style={styles.backgroundImage}>
        <SafeAreaView style={styles.container}>
          <View style={styles.container}>
            <Text style={styles.text}>Vous êtes à {weather?.name}</Text>
            {weather && (
                <View>
                  <Text style={styles.text}>{weather.main.temp}°C</Text>
                  <Image
                      source={{
                        uri: `https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`,
                      }}
                      style={styles.weatherIcon}
                  />
                  <Text style={styles.text}>{weather.weather[0].description}</Text>
                </View>
            )}

            <Text style={styles.forecastHeader}>Prévision sur 5 jours a 15h :</Text>
            <ScrollView horizontal>
              {forecast &&
                  forecast.map((item, index) => (
                      <View key={index} style={styles.forecastItem}>
                        <Text style={styles.forecastDay}>{getDayOfWeek(item.dt_txt)}</Text>
                        <Text style={styles.forecastTemperature}>{item.main.temp}°C</Text>
                        <Image
                            source={{
                              uri: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`,
                            }}
                            style={styles.weatherIcon}
                        />
                        <Text style={styles.forecastDescription}>{item.weather[0].description}</Text>
                      </View>
                  ))}
            </ScrollView>
          </View>
        </SafeAreaView>
      </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    opacity: 1,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: 10,
    color: 'black',
  },
  forecastHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    color: 'black',
  },
  forecastItem: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  forecastDay: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  forecastDescription: {
    fontSize: 14,
    marginVertical: 5,
    color: 'black',
  },
  forecastTemperature: {
    fontSize: 18,
    fontWeight: 'bold',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'black',
  },
  weatherIcon: {
    width: 70,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
