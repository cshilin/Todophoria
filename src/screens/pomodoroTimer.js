import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Modal, TextInput, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {doc, updateDoc } from 'firebase/firestore';
import { FIRESTORE_DB } from '../services/firebaseConfig';
import { Accelerometer } from 'expo-sensors';
import { Audio } from 'expo-av';

const PomodoroTimer = ({ route, navigation }) => {
  const { taskTitle, taskId } = route.params;
  const [workTime, setWorkTime] = useState(25 * 60);
  const [breakTime, setBreakTime] = useState(5 * 60);
  const [timeLeft, setTimeLeft] = useState(workTime);
  const [isActive, setIsActive] = useState(false);
  const [isWork, setIsWork] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [tempWorkTime, setTempWorkTime] = useState('25');
  const [tempBreakTime, setTempBreakTime] = useState('5');
  const [isDeviceStable, setIsDeviceStable] = useState(true);
  const [transitionSound, setTransitionSound] = useState();
  const [deviceMovedSound, setDeviceMovedSound] = useState();

  const animatedValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      clearInterval(interval);
      if (isWork) {
        showAlertWithSound(
          "Work Session Complete!",
          "Ready to start your break?",
          [
            {
              text: "Not yet",
              onPress: () => setIsActive(false),
              style: "cancel"
            },
            { 
              text: "Start Break", 
              onPress: () => {
                setTimeLeft(breakTime);
                setIsWork(false);
                setIsActive(true);
                updateAnimatedValue(false);
              }
            }
          ],
          'transition'
        );
      } else {
        showAlertWithSound(
          "Break Time Over!",
          "Ready to get back to work?",
          [
            {
              text: "Not yet",
              onPress: () => setIsActive(false),
              style: "cancel"
            },
            { 
              text: "Start Work", 
              onPress: () => {
                setTimeLeft(workTime);
                setIsWork(true);
                setIsActive(true);
                updateAnimatedValue(true);
              }
            }
          ],
          'transition'
        );
      }
      setIsActive(false);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, isWork, workTime, breakTime]);
  
  useEffect(() => {
    updateAnimatedValue(isWork);
  }, [isWork]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(workTime);
    setIsWork(true);
    updateAnimatedValue(true);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const saveSettings = () => {
    const newWorkTime = parseInt(tempWorkTime) * 60;
    const newBreakTime = parseInt(tempBreakTime) * 60;
    setWorkTime(newWorkTime);
    setBreakTime(newBreakTime);
    if (isWork) {
      setTimeLeft(newWorkTime);
    } else {
      setTimeLeft(newBreakTime);
    }
    setShowSettings(false);
  };

  const updateAnimatedValue = (isWork) => {
    Animated.timing(animatedValue, {
      toValue: isWork ? 1 : 0,
      duration: 500,
      useNativeDriver: false,
    }).start();
    setIsWork(isWork);
  };

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#4CAF50', '#FF6347']
  });

  const handleCompleteTask = async () => {
    try {
      await updateDoc(doc(FIRESTORE_DB, 'tasks', taskId), {
        completed: true,
        completedAt: new Date().toISOString(),
      });
      Alert.alert('Success', 'Task marked as completed');
      navigation.goBack();
      navigation.goBack();
    } catch (error) {
      console.error('Error completing task:', error);
      Alert.alert('Error', 'Failed to complete task. Please try again.');
    }
  };

  const handleCancelPomodoro = () => {
    Alert.alert(
      "Cancel Pomodoro",
      "Are you sure you want to cancel this Pomodoro session?",
      [
        {
          text: "No",
          style: "cancel"
        },
        {
          text: "Yes",
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  useEffect(() => {
    let subscription;
    
    const startAccelerometer = async () => {

      await Accelerometer.setUpdateInterval(1000);
      subscription = Accelerometer.addListener(accelerometerData => {
        const { x, y, z } = accelerometerData;
        const acceleration = Math.sqrt(x * x + y * y + z * z);
        const isStable = acceleration > 0.95 && acceleration < 1.05;
        
        if (isActive && isWork && isDeviceStable && !isStable) {
          handleDeviceMovement();
        }
        setIsDeviceStable(isStable);
      });
    };

    startAccelerometer();

    return () => {
      subscription && subscription.remove();
    };
  }, [isActive, isWork, isDeviceStable]);

  const handleDeviceMovement = () => {
    setIsActive(false);
    showAlertWithSound(
      "Stay Focused!",
      "Device moved. Remember to stay focused on your task.",
      [
        {
          text: "Resume",
          onPress: () => setIsActive(true)
        },
        {
          text: "Cancel Session",
          onPress: () => handleCancelPomodoro()
        }
      ],
      'deviceMoved'
    );
  };

  useEffect(() => {
    return () => {
      if (transitionSound) {
        transitionSound.unloadAsync();
      }
      if (deviceMovedSound) {
        deviceMovedSound.unloadAsync();
      }
    };
  }, [transitionSound, deviceMovedSound]);

  const playTransitionSound = async () => {
    const { sound } = await Audio.Sound.createAsync(
      require('../../assets/notificationsound.mp3')
    );
    setTransitionSound(sound);
    await sound.playAsync();
  };
  
  const playDeviceMovedSound = async () => {
    const { sound } = await Audio.Sound.createAsync(
      require('../../assets/deviceMovedSound.mp3')
    );
    setDeviceMovedSound(sound);
    await sound.playAsync();
  };

  const showAlertWithSound = (title, message, buttons, soundType = 'transition') => {
    if (soundType === 'transition') {
      playTransitionSound();
    } else if (soundType === 'deviceMoved') {
      playDeviceMovedSound();
    }
    Alert.alert(title, message, buttons);
  };

  return (
    <Animated.View style={[styles.container, { backgroundColor }]}>
      <Text style={styles.taskTitle}>{taskTitle}</Text>
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
        <Text style={styles.phaseText}>{isWork ? 'Work' : 'Break'}</Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={toggleTimer}>
          <Icon name={isActive ? 'pause' : 'play'} size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={resetTimer}>
          <Icon name="refresh" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => setShowSettings(true)}>
          <Icon name="cog" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity style={styles.completeButton} onPress={handleCompleteTask}>
          <Text style={styles.buttonText}>Complete Task</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelPomodoroButton} onPress={handleCancelPomodoro}>
          <Text style={styles.buttonText}>Cancel Pomodoro</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showSettings}
        onRequestClose={() => setShowSettings(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Timer Settings</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.labelText}>Work Time (minutes):</Text>
              <TextInput
                style={styles.input}
                onChangeText={setTempWorkTime}
                value={tempWorkTime}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.labelText}>Break Time (minutes):</Text>
              <TextInput
                style={styles.input}
                onChangeText={setTempBreakTime}
                value={tempBreakTime}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.actionButtonsContainer}>
                <TouchableOpacity style={styles.saveButton} onPress={saveSettings}>
                <Text style={styles.buttonText}>Save Settings</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancelButton} onPress={() => setShowSettings(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  taskTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 30,
    textAlign: 'center',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  timerText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  phaseText: {
    fontSize: 24,
    color: '#FFFFFF',
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#ffffff4d',
    padding: 15,
    borderRadius: 50,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000080',
  },
  modalView: {
    margin: 20,
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  labelText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginRight: 10,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#333',
    padding: 10,
    width: 60,
    color: '#FFFFFF',
    backgroundColor: '#333',
    borderRadius: 5,
  },
  actionButtonsContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  saveButton: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
    padding: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 20,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  completeButton: {
    backgroundColor: '#0d8722',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
    width: '80%',
  },
  cancelPomodoroButton: {
    backgroundColor: '#e74c3c',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 5,
    width: '80%',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default PomodoroTimer;