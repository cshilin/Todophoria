import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Alert, RefreshControl, Image } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../services/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import { categoryIcons, priorityLevelColors } from '../constants';
import { fetchWeather, getUserLocation } from '../services/weather';

const Home = ({ navigation }) => {
  const [todayTasks, setTodayTasks] = useState([]);
  const [showTasks, setShowTasks] = useState(true);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [completionRate, setCompletionRate] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState(null);

  const fetchTasks = async () => {
    try {
      const user = FIREBASE_AUTH.currentUser;
      if (!user) {
        Alert.alert('Error', 'No user logged in. Please log in to view tasks.');
        return;
      }

      const tasksRef = collection(FIRESTORE_DB, 'tasks');
      const q = query(tasksRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayTasksArr = [];
      const completedTasksArr = [];

      querySnapshot.forEach((doc) => {
        const task = { id: doc.id, ...doc.data() };
        const taskDate = new Date(task.dueDate);
        if (taskDate.getDate() === today.getDate()) {
          if (task.completed) {
            completedTasksArr.push(task);
          } else {
            todayTasksArr.push(task);
          }
        }
      });

      setTodayTasks(todayTasksArr);
      setCompletedTasks(completedTasksArr);

      const totalNoOfTasks = todayTasksArr.length + completedTasksArr.length;
      setCompletionRate(totalNoOfTasks > 0 ? (completedTasksArr.length / totalNoOfTasks) * 100 : 0);

    } catch (error) {
      console.error('Error fetching tasks:', error);
      Alert.alert('Error', 'Failed to fetch tasks. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchWeatherData = async () => {
    setWeatherLoading(true);
    try {
      const coords = await getUserLocation();
      const weatherData = await fetchWeather(coords.latitude, coords.longitude);
      setWeather(weatherData);
      setWeatherError(null);
      setWeatherLoading(false);
      console.log('fetchWeatherData');
    } catch (error) {
      console.error('Error getting weather:', error);
      setWeatherError(error.message);
    }
  };

  const getCurrentDate = () => {
    const currentDate = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const theDay = currentDate.toLocaleDateString('en-GB', options).split(' ');
    return {
      date: `${currentDate.getDate()} ${currentDate.toLocaleString('default', { month: 'long' })} ${currentDate.getFullYear()}`,
      day: theDay[0]
    };
  };

  const { date, day } = getCurrentDate();

  const renderTaskItem = ({ item }) => (
    <TouchableOpacity
      style={styles.taskItem}
      onPress={() => navigation.navigate('TaskDetails', { taskId: item.id })}
    >
      {/* <Icon name={item.completed ? "check-square-o" : "square-o"} size={20} color="#fff" /> */}
      <View style={[styles.priorityLevelColors, { backgroundColor: priorityLevelColors[item.priority] }]} />
      <Text style={styles.taskTitle}>{item.title}</Text>
      <Icon name={categoryIcons[item.category]} size={20} color="#fff" />
    </TouchableOpacity>
  );

  const renderWeather = () => {
    return (
      <View style={styles.weatherContainer}>
      {weatherLoading ? (
        <Text style={styles.weatherLoading}>Loading...</Text>
      ) : weatherError ? (
        <Text style={styles.weatherError}>{weatherError}</Text>
      ) : weather ? (
        <>
          <View style={styles.weatherMain}>
            <Image 
              source={{ uri: `http://openweathermap.org/img/wn/${weather.icon}@2x.png` }} 
              style={styles.weatherIcon} 
            />
            <Text style={styles.weatherTemp}>{Math.round(weather.temperature)}°C</Text>
          </View>
          <Text style={styles.weatherDescription}>{weather.weatherCondition}</Text>
          <Text style={styles.weatherLocation}>{weather.locationName}, {weather.locationCountry}</Text>
        </>
      ) : (
        <Text style={styles.weatherError}>No weather data available</Text>
      )}
    </View>
    );
  };

   // call fetchWeatherData once to avoid unnecessary API calls
   useEffect(() => {
    fetchWeatherData();
  }, []);

  // swapping between pages will reload data
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchTasks();
    }, [])
  );

  // pull to refresh data
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTasks();
  }, []);

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.dateHeader}>
        <Text style={styles.dateText}>{date}</Text>
        <Text style={styles.dayText}>{day}</Text>
      </View>

      {renderWeather()}

      <View style={styles.completionContainer}>
        <Text style={styles.completionText}>Today's Task Completion</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${completionRate}%` }]} />
        </View>
        <Text style={styles.completionRate}>{completionRate.toFixed(0)}%</Text>
      </View>

      <View style={styles.taskSection}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => setShowTasks(!showTasks)}
        >
          <Text style={styles.sectionTitle}>Today's Tasks</Text>
          <Text style={styles.taskCount}>
            {todayTasks.length} <Icon name={showTasks ? "chevron-down" : "chevron-right"} size={16} color="#fff" />
          </Text>
        </TouchableOpacity>
        {showTasks && (
          <FlatList
            data={todayTasks}
            renderItem={renderTaskItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        )}
      </View>
      <View style={styles.taskSection}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => setShowTasks(!showTasks)}
        >
          <Text style={styles.sectionTitle}>Today's Completed Tasks</Text>
          <Text style={styles.taskCount}>
            {completedTasks.length} <Icon name={showTasks ? "chevron-down" : "chevron-right"} size={16} color="#fff" />
          </Text>
        </TouchableOpacity>
        {showTasks && (
          <FlatList
            data={completedTasks}
            renderItem={renderTaskItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  dateHeader: {
    padding: 20,
    marginBottom: 5,
    alignItems: 'left',
  },
  dateText: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  dayText: {
    color: '#FFFFFF',
    fontSize: 20,
    textAlign: 'center',
    opacity: 0.8,
  },
  weatherLoading: {
    color: '#FFFFFF',
    fontSize: 24,
    fontStyle: 'bold',
  },
  weatherContainer: {
    backgroundColor: '#3C4D81',
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
    minHeight: 150,
    justifyContent: 'center',
  },
  weatherMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  weatherIcon: {
    width: 50,
    height: 50,
  },
  weatherTemp: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  weatherDescription: {
    color: '#FFFFFF',
    fontSize: 18,
    marginBottom: 5,
  },
  weatherLocation: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 5,
  },
  weatherError: {
    color: '#FF6B6B',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
  },
  completionContainer: {
    padding: 16,
    backgroundColor: '#1E1E1E',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
  },
  completionText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 10,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#333',
    borderRadius: 5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 5,
  },
  completionRate: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 5,
    textAlign: 'right',
  },
  taskSection: {
    marginVertical: 10,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  taskCount: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  priorityLevelColors: {
    width: 4,
    height: 20,
    borderRadius: 2,
    marginRight: 10,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  taskTitle: {
    color: '#FFFFFF',
    flex: 1,
    marginLeft: 10,
  },
});

export default Home;