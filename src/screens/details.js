import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView, Alert, RefreshControl } from 'react-native';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../firebase/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { categoryIcons, priorityLevelColors } from '../constants';


const Details = () => {
  const [todayTasks, setTodayTasks] = useState([]);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showTodayTasks, setShowTodayTasks] = useState(true);
  const [showOverdueTasks, setShowOverdueTasks] = useState(true);
  const [showAllTasks, setShowAllTasks] = useState(true);

  const fetchTasks = async () => {
    try {
      const user = FIREBASE_AUTH.currentUser;
      if (!user) {
        Alert.alert('Error', 'No user logged in. Please log in to view tasks.');
        return;
      }

      console.log('Fetching tasks for user:', user.uid);
      const tasksRef = collection(FIRESTORE_DB, 'tasks');
      const q = query(tasksRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);

      console.log('Number of documents retrieved:', querySnapshot.size);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayTasksArr = [];
      const overdueTasksArr = [];
      const allTasksArr = [];

      querySnapshot.forEach((doc) => {
        const task = { id: doc.id, ...doc.data() };
        const taskDate = new Date(task.dueDate);
        allTasksArr.push(task);
        if (taskDate < today) {
          overdueTasksArr.push(task);
        } else if (taskDate.getDate() === today.getDate()) {
          todayTasksArr.push(task);
        }
      });

      setTodayTasks(todayTasksArr);
      setOverdueTasks(overdueTasksArr);
      setAllTasks(allTasksArr);

    } catch (error) {
      console.error('Error fetching tasks:', error);
      Alert.alert('Error', 'Failed to fetch tasks. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // use useFocusEffect here to refresh data (after user adds a task) when this screen is selected
  // this will ensure that the task list is most up-to-date and prevent unneccessary rendering that can cause performance issues
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchTasks();
    }, [])
  );

  // pull to refresh function
  // in the event when useFocusEffect fails, user can manually refresh the page
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTasks();
  }, []);


  const renderTask = ({ item }) => (
    <View style={styles.taskItem}>
      <View style={[styles.priorityLevelColors, { backgroundColor: priorityLevelColors[item.priority] }]} />
      <Text style={styles.taskText}>{item.title}</Text>
      <TouchableOpacity style={styles.iconButton}>
      <Icon 
          name={categoryIcons[item.category]} 
          size={20} 
          color="#fff" 
        />
      </TouchableOpacity>
    </View>
  );

  const toggleTaskList = (section) => {
    switch (section) {
      case 'today':
        setShowTodayTasks(!showTodayTasks);
        break;
      case 'overdue':
        setShowOverdueTasks(!showOverdueTasks);
        break;
      case 'all':
        setShowAllTasks(!showAllTasks);
        break;
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading tasks...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <View style={styles.section}>
        <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleTaskList('today')}>
          <Text style={styles.sectionTitle}>Today's Tasks</Text>
          <Text style={styles.taskCount}>
            {todayTasks.length}  <Icon name={showTodayTasks ? "chevron-down" : "chevron-right"} size={16} color="#fff" />
          </Text>
        </TouchableOpacity>
        {showTodayTasks && (
          <FlatList
            data={todayTasks}
            renderItem={renderTask}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        )}
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleTaskList('overdue')}>
          <Text style={styles.sectionTitle}>Overdue Tasks</Text>
          <Text style={styles.taskCount}>
            {overdueTasks.length}  <Icon name={showOverdueTasks ? "chevron-down" : "chevron-right"} size={16} color="#fff" />
          </Text>
        </TouchableOpacity>
        {showOverdueTasks && (
          <FlatList
            data={overdueTasks}
            renderItem={renderTask}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        )}
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleTaskList('all')}>
          <Text style={styles.sectionTitle}>All Tasks</Text>
          <Text style={styles.taskCount}>
            {allTasks.length}  <Icon name={showAllTasks ? "chevron-down" : "chevron-right"} size={16} color="#fff" />
          </Text>
        </TouchableOpacity>
        {showAllTasks && (
          <FlatList
            data={allTasks}
            renderItem={renderTask}
            keyExtractor={(item) => item.id}
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
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
    borderRadius: 8,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  taskCount: {
    color: '#fff',
    fontSize: 16,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  priorityLevelColors: {
    width: 4,
    height: 20,
    borderRadius: 2,
    marginRight: 10,
  },
  taskText: {
    color: '#fff',
    flex: 1,
  },
  iconButton: {
    padding: 4,
    marginLeft: 8,
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
});

export default Details;