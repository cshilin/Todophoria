import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const PomodoroTimer = () => {
  const [workMinutes, setWorkMinutes] = useState(25);
  const [restMinutes, setRestMinutes] = useState(5);
  const [seconds, setSeconds] = useState(workMinutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [isWorkInterval, setIsWorkInterval] = useState(true);
  const [alertShown, setAlertShown] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds(seconds => seconds - 1);
      }, 1000);
    } else if (seconds === 0 && !alertShown) {
      clearInterval(interval);
      if (isWorkInterval) {
        setAlertShown(true);
        Alert.alert(
          "Work Interval Complete",
          "Time to take a break!",
          [
            {
              text: "OK",
              onPress: () => {
                setSeconds(restMinutes * 60);
                setIsWorkInterval(false);
                setAlertShown(false);
              }
            }
          ],
          { cancelable: false }
        );
      } else {
        Alert.alert(
          "Break Interval Complete",
          "Time to get back to work!",
          [
            {
              text: "OK",
              onPress: () => {
                setSeconds(workMinutes * 60);
                setIsWorkInterval(true);
                setAlertShown(false);
              }
            }
          ],
          { cancelable: false }
        );
      }
    }
    return () => clearInterval(interval);
  }, [isActive, seconds, isWorkInterval, workMinutes, restMinutes, alertShown]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setSeconds(workMinutes * 60);
    setIsActive(false);
    setIsWorkInterval(true);
    setAlertShown(false);
  };

  const handleWorkMinutesChange = (value) => {
    setWorkMinutes(value);
    if (isWorkInterval) {
      setSeconds(value * 60);
    }
  };

  const handleRestMinutesChange = (value) => {
    setRestMinutes(value);
    if (!isWorkInterval) {
      setSeconds(value * 60);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Clean Room</Text>
      <View style={styles.pickerContainer}>
        <Text>Work Interval:</Text>
        <Picker
          selectedValue={workMinutes}
          style={styles.picker}
          onValueChange={(itemValue) => handleWorkMinutesChange(itemValue)}
        >
          <Picker.Item label="For testing" value={0.1} />
          <Picker.Item label="20 minutes" value={20} />
          <Picker.Item label="25 minutes" value={25} />
          <Picker.Item label="30 minutes" value={30} />
        </Picker>
      </View>
      <View style={styles.pickerContainer}>
        <Text>Rest Interval:</Text>
        <Picker
          selectedValue={restMinutes}
          style={styles.picker}
          onValueChange={(itemValue) => handleRestMinutesChange(itemValue)}
        >
          <Picker.Item label="For testing" value={0.1} />
          <Picker.Item label="10 minutes" value={10} />
          <Picker.Item label="15 minutes" value={15} />
        </Picker>
      </View>
      <Text style={styles.timerText}>
        {`${Math.floor(seconds / 60)}:${seconds % 60 < 10 ? '0' : ''}${seconds % 60}`}
      </Text>
      <Text style={styles.intervalText}>
        {isWorkInterval ? "Work Interval" : "Break Interval"}
      </Text>
      <View style={styles.buttonContainer}>
        <Button onPress={toggleTimer} title={isActive ? 'Pause' : 'Start'} />
        <Button onPress={resetTimer} title="Reset" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 50,
  },
  picker: {
    height: 100,
    width: 150,
  },
  timerText: {
    fontSize: 48,
    marginTop: 100,
  },
  intervalText: {
    fontSize: 24,
    marginVertical: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-between',
    width: '60%',
  },
});

export default PomodoroTimer;
