import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/FontAwesome';
import { onAuthStateChanged } from 'firebase/auth';
import { FIREBASE_AUTH } from './src/services/firebaseConfig';
import 'react-native-gesture-handler';

import { Home, Search, AddTask, TaskList, Settings, Onboard, Register, Login, TaskDetails, PomodoroTimer, ChangePassword } from './src/screens';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function Tabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Search') {
            iconName = 'search';
          } else if (route.name === 'Add Task') {
            iconName = 'plus';
          } else if (route.name === 'Tasks') {
            iconName = 'list-alt';
          } else if (route.name === 'Settings') {
            iconName = 'cogs';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        headerStyle: {
          backgroundColor: 'black',
          borderBottomColor: '#333',
          borderBottomWidth: 1,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: 'white',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'white',
        tabBarStyle: [{ display: 'flex', backgroundColor: 'black', borderTopColor: '#333', }, null],
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Search" component={Search} />
      <Tab.Screen name="Add Task" component={AddTask}/>
      <Tab.Screen name="Tasks" component={TaskList} />
      <Tab.Screen name="Settings" component={Settings} />
    </Tab.Navigator>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      setUser(user);
      if (initializing) setInitializing(false);
    });

    return unsubscribe;
  }, []);

  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#959595" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Onboard" component={Onboard} />
            <Stack.Screen name="Register" component={Register} />
            <Stack.Screen name="Login" component={Login} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={Tabs} />
            <Stack.Screen name="TaskDetails" component={TaskDetails} />
            <Stack.Screen name="PomodoroTimer" component={PomodoroTimer} />
            <Stack.Screen name="ChangePassword" component={ChangePassword} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
});

export default App;