import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const TaskDetails = ({ navigation }) => {
  const task = {
    title: 'Clean Room',
    description: 'Dust, mop and change sheets',
    dueDate: '1/7/2024',
    status: 'In Progress',
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{task.title}</Text>
      <Text style={styles.description}>{task.description}</Text>
      <Text style={styles.detail}>Due Date: {task.dueDate}</Text>
      <Text style={styles.detail}>Status: {task.status}</Text>
      <Button
        title="Start Pomodoro Timer"
        onPress={() => navigation.navigate('PomodoroTimer')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  detail: {
    fontSize: 14,
    marginBottom: 10,
  },
});

export default TaskDetails;
