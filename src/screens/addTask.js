import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Modal } from 'react-native';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../firebase/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/FontAwesome';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { categoryIcons } from '../constants';


const AddTask = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subtask, setSubtask] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [category, setCategory] = useState('Personal');
  const [dueDate, setDueDate] = useState(new Date());
  const [reminder, setReminder] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isReminderPickerVisible, setReminderPickerVisibility] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const categories = ['Personal', 'Work', 'Study', 'Health', 'Shopping', 'Other'];

  const handleAddTask = async () => {
    const user = FIREBASE_AUTH.currentUser;
    if (!user) {
      alert('You must be logged on to add a task');
      return;
    }

    try {
      await addDoc(collection(FIRESTORE_DB, 'tasks'), {
        userId: user.uid,
        title,
        description,
        subtask,
        priority,
        category,
        dueDate: dueDate.toISOString(),
        reminder: reminder.toISOString(),
        createdAt: new Date().toISOString(),
      });
      alert('Task added successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error adding task: ', error);
      alert('Failed to add task. Please try again.');
    }
  };

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const handleConfirmDate = (date) => {
    setDueDate(date);
    hideDatePicker();
  };

  const showReminderPicker = () => setReminderPickerVisibility(true);
  const hideReminderPicker = () => setReminderPickerVisibility(false);
  const handleConfirmReminder = (date) => {
    setReminder(date);
    hideReminderPicker();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}></Text>
      
      <TextInput
        style={styles.input}
        placeholder="Task Title"
        placeholderTextColor="#999"
        value={title}
        onChangeText={setTitle}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Description"
        placeholderTextColor="#999"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      
      <TextInput
        style={styles.input}
        placeholder="Add subtask"
        placeholderTextColor="#999"
        value={subtask}
        onChangeText={setSubtask}
      />
      
      <View style={styles.priorityContainer}>
        {['Low', 'Medium', 'High'].map((p) => (
          <TouchableOpacity
            key={p}
            style={[
              styles.priorityButton,
              priority === p && styles.selectedPriority,
              { backgroundColor: p === 'Low' ? '#4CAF50' : p === 'Medium' ? '#FFA500' : '#FF0000' }
            ]}
            onPress={() => setPriority(p)}
          >
            <Text style={styles.priorityText}>{p}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <Text style={styles.displayText}>Category:</Text>
      <TouchableOpacity 
        style={styles.dropdownButton} 
        onPress={() => setShowCategoryModal(true)}
      >
        <Text style={styles.dropdownButtonText}>{category}</Text>
        <Icon name="chevron-down" size={20} color="#FFFFFF" />
      </TouchableOpacity>
      
      <Text style={styles.displayText}>Due:</Text>
      <TouchableOpacity style={styles.dateButton} onPress={showDatePicker}>
        <Text style={styles.dateButtonText}>
          {dueDate.toLocaleDateString()} {dueDate.toLocaleTimeString()}
        </Text>
        <Icon name="calendar" size={20} color="#FFFFFF" />
      </TouchableOpacity>
      
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="datetime"
        onConfirm={handleConfirmDate}
        onCancel={hideDatePicker}
        isDarkModeEnabled={true}
        themeVariant="dark"
      />
      
      <Text style={styles.displayText}>Remind Me:</Text>
      <TouchableOpacity style={styles.dateButton} onPress={showReminderPicker}>
        <Text style={styles.dateButtonText}>
          {reminder.toLocaleDateString()} {reminder.toLocaleTimeString()}
        </Text>
        <Icon name="bell" size={20} color="#FFFFFF" />
      </TouchableOpacity>
      
      <DateTimePickerModal
        isVisible={isReminderPickerVisible}
        mode="datetime"
        onConfirm={handleConfirmReminder}
        onCancel={hideReminderPicker}
        isDarkModeEnabled={true}
        themeVariant="dark"
      />

      <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
        <Text style={styles.addButtonText}>Add Task</Text>
      </TouchableOpacity>

      {/* category pop-up */}
      <Modal
        visible={showCategoryModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={styles.modalItem}
                onPress={() => {
                  setCategory(cat);
                  setShowCategoryModal(false);
                }}
              >
                <View style={styles.modalItemContainer}>
                  <Text style={styles.modalItemText}>{cat}</Text>
                  <Icon name={categoryIcons[cat]} size={20} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowCategoryModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#121212',
  },
  header: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#333',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    color: '#FFFFFF',
  },
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  priorityButton: {
    padding: 10,
    borderRadius: 20,
    width: '30%',
    alignItems: 'center',
  },
  selectedPriority: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  priorityText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  dropdownButton: {
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownButtonText: {
    color: '#FFFFFF',
  },
  dateButton: {
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateButtonText: {
    color: '#FFFFFF',
  },
  displayText: {
    color: '#FFFFFF',
    marginBottom: 5,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    marginTop: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#000000',
    borderRadius: 10,
    padding: 20,
    width: '80%',
  },
  modalItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalItemText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  modalItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalCloseButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#DDDDDD',
    borderRadius: 5,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#000000',
    fontWeight: 'bold',
  },
});

export default AddTask;