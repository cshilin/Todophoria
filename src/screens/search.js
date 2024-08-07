import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  FlatList, 
  SafeAreaView 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../services/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/FontAwesome';
import { categoryIcons, priorityLevelColors } from '../constants';


const Search = () => {
  const navigation = useNavigation();
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [activeFilters, setActiveFilters] = useState([]);

  const priorities = ['Low', 'Medium', 'High'];
  const categories = ['Personal', 'Work', 'Study', 'Health', 'Shopping', 'Other'];

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const user = FIREBASE_AUTH.currentUser;
    if (user) {
      const tasksRef = collection(FIRESTORE_DB, 'tasks');
      const q = query(tasksRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const fetchedTasks = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTasks(fetchedTasks);
    }
  };

  useEffect(() => {
    const filtered = tasks.filter(task => {
      const matchSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
      
      const selectedPriority = priorities.filter(priority => activeFilters.includes(priority));
      const selectedCategory = categories.filter(category => activeFilters.includes(category));
      
      const matchPriority = selectedPriority.length === 0 || selectedPriority.includes(task.priority);
      const matchCategory = selectedCategory.length === 0 || selectedCategory.includes(task.category);
  
      return matchSearch && matchPriority && matchCategory;
    });
    
    setFilteredTasks(filtered);
  }, [searchQuery, tasks, activeFilters]);

  const toggleFilter = (filter) => {
    setActiveFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const renderTask = ({ item }) => (
    <TouchableOpacity
      style={styles.taskItem}
      onPress={() => navigation.navigate('TaskDetails', { taskId: item.id })}
    >
      <View style={[styles.priorityIndicator, { backgroundColor: priorityLevelColors[item.priority] }]} />
      <Text style={styles.taskTitle}>{item.title}</Text>
      <Icon name={categoryIcons[item.category]} size={20} color="#fff" />
    </TouchableOpacity>
  );

  const renderFilterChip = (label, isActive, index) => (
    <TouchableOpacity 
      key={`filter-${label}-${index}`}
      style={[styles.filterChip, isActive && styles.activeFilterChip]} 
      onPress={() => toggleFilter(label)}
    >
      <Text style={[styles.filterChipText, isActive && styles.activeFilterChipText]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search tasks..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <View style={styles.filtersContainer}>
        <Text style={styles.filtersTitle}>Filters:</Text>
        <View style={styles.filterChipsContainer}>
          {priorities.map((priority, index) => renderFilterChip(priority, activeFilters.includes(priority), `priority-${index}`))}
          {categories.map((category, index) => renderFilterChip(category, activeFilters.includes(category), `category-${index}`))}
        </View>
      </View>
      <FlatList
        data={filteredTasks}
        renderItem={renderTask}
        keyExtractor={item => item.id.toString()}
        style={styles.taskList}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 25,
    paddingHorizontal: 15,
    margin: 15,
    marginTop: 30,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    padding: 10,
  },
  filtersContainer: {
    margin: 8,
  },
  filtersTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    marginLeft: 10,
  },
  filterChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: 8,
  },
  filterChip: {
    backgroundColor: '#333',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 15,
    marginRight: 10,
    marginBottom: 10,
  },
  activeFilterChip: {
    backgroundColor: '#4CAF50',
  },
  filterChipText: {
    color: '#fff',
    fontSize: 14,
  },
  activeFilterChipText: {
    fontWeight: 'bold',
  },
  taskList: {
    flex: 1,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 15,
    margin: 10,
    marginLeft: 16,
    marginRight: 16,
  },
  priorityIndicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
    marginRight: 10,
  },
  taskTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
});

export default Search;