import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../firebase/firebaseConfig';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/FontAwesome';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { categoryIcons, priorityLevelColors } from '../constants';

const TaskDetails = ({ route, navigation }) => {
  const { taskId } = route.params;
  const [task, setTask] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subtask, setSubtask] = useState('');
  const [priority, setPriority] = useState('');
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [originalTask, setOriginalTask] = useState(null);

  const categories = ['Personal', 'Work', 'Study', 'Health', 'Shopping', 'Other'];

  useEffect(() => {
    const fetchTask = async () => {
      const taskDoc = await getDoc(doc(FIRESTORE_DB, 'tasks', taskId));
      if (taskDoc.exists()) {
        const taskData = { id: taskDoc.id, ...taskDoc.data() };
        setTask(taskData);
        setTitle(taskData.title);
        setDescription(taskData.description);
        setSubtask(taskData.subtask);
        setPriority(taskData.priority);
        setCategory(taskData.category);
        setDueDate(new Date(taskData.dueDate));
        setOriginalTask(taskData);
      }
    };
    fetchTask();
  }, [taskId]);

  const handleUpdateTask = async () => {
    try {
      await updateDoc(doc(FIRESTORE_DB, 'tasks', taskId), {
        title,
        description,
        subtask,
        priority,
        category,
        dueDate: dueDate.toISOString(),
      });
      Alert.alert('Success', 'Task updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating task:', error);
      Alert.alert('Error', 'Failed to update task. Please try again.');
    }
  };

  const handleCompleteTask = async () => {
    try {
      await updateDoc(doc(FIRESTORE_DB, 'tasks', taskId), {
        completed: true,
        completedAt: new Date().toISOString(),
      });
      Alert.alert('Success', 'Task marked as completed');
      navigation.goBack();
    } catch (error) {
      console.error('Error completing task:', error);
      Alert.alert('Error', 'Failed to complete task. Please try again.');
    }
  };

  const handleDeleteTask = async () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          onPress: async () => {
            try {
              await deleteDoc(doc(FIRESTORE_DB, 'tasks', taskId));
              Alert.alert('Success', 'Task deleted successfully');
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting task:', error);
              Alert.alert('Error', 'Failed to delete task. Please try again.');
            }
          }
        },
      ]
    );
  };

  const handleCloseWithoutSaving = () => {
    if (originalTask) {
      setTitle(originalTask.title);
      setDescription(originalTask.description);
      setSubtask(originalTask.subtask);
      setPriority(originalTask.priority);
      setCategory(originalTask.category);
      setDueDate(new Date(originalTask.dueDate));
    }
    setIsEditing(false);
  };

  if (!task) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name={isEditing ? "" : "arrow-left"} size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerText}>Task Details</Text>
            <TouchableOpacity onPress={() => {
              if (isEditing) {
                handleCloseWithoutSaving();
              } else {
                setIsEditing(true);
              }
            }}>
              <Icon name={isEditing ? "close" : "edit"} size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.taskInfoContainer}>
            <TextInput
              style={styles.titleInput}
              placeholder="Task Title"
              placeholderTextColor="#999"
              value={title}
              onChangeText={setTitle}
              editable={isEditing}
            />

            <View style={styles.detailRow}>
              <Icon name="calendar" size={20} color="#FFFFFF" />
              <TouchableOpacity 
                style={styles.dateButton} 
                onPress={() => isEditing && setDatePickerVisibility(true)}
              >
                <Text style={styles.dateButtonText}>
                  {dueDate.toLocaleDateString()} {dueDate.toLocaleTimeString()}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.detailRow}>
              <Icon name={categoryIcons[category]} size={20} color="#FFFFFF" />
              {isEditing ? (
                <TouchableOpacity style={styles.categoryButton} onPress={() => setShowCategoryModal(true)}>
                  <Text style={styles.categoryButtonText}>{category}</Text>
                  <Icon name="chevron-down" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              ) : (
                <Text style={styles.detailText}>{category}</Text>
              )}
            </View>

            <View style={styles.detailRow}>
              <Icon name="flag" size={20} color={priorityLevelColors[priority]} />
              {isEditing ? (
                <View style={styles.priorityContainer}>
                  {['Low', 'Medium', 'High'].map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={[
                        styles.priorityButton,
                        priority === p && styles.selectedPriority,
                        { backgroundColor: priorityLevelColors[p] }
                      ]}
                      onPress={() => setPriority(p)}
                    >
                      <Text style={styles.priorityText}>{p}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text style={[styles.detailText, { color: priorityLevelColors[priority] }]}>{priority}</Text>
              )}
            </View>
          </View>

          <Text style={styles.sectionLabel}>Subtask:</Text>
          <TextInput
            style={styles.subtaskInput}
            value={subtask}
            onChangeText={setSubtask}
            editable={isEditing}
          />

          <Text style={styles.sectionLabel}>Description:</Text>
          <TextInput
            style={styles.descriptionInput}
            value={description}
            onChangeText={setDescription}
            multiline
            editable={isEditing}
          />

          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="datetime"
            onConfirm={(selectedDate) => {
              setDatePickerVisibility(false);
              setDueDate(selectedDate);
            }}
            onCancel={() => setDatePickerVisibility(false)}
            isDarkModeEnabled={true}
            themeVariant="dark"
          />

          {!isEditing && (
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity style={styles.completeButton} onPress={handleCompleteTask}>
                <Icon name="check-circle" size={20} color="#FFFFFF" />
                <Text style={styles.buttonText}>Complete</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteTask}>
                <Icon name="trash" size={20} color="#FFFFFF" />
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}

          {isEditing && (
            <TouchableOpacity style={styles.updateButton} onPress={handleUpdateTask}>
              <Text style={styles.buttonText}>Update Task</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

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

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121212',
  },
  container: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  taskInfoContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 25,
  },
  detailText: {
    color: '#FFFFFF',
    marginLeft: 10,
    fontSize: 16,
  },
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
    marginLeft: 10,
  },
  priorityButton: {
    padding: 5,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 2,
  },
  selectedPriority: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  priorityText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dateButton: {
    marginLeft: 10,
  },
  dateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  sectionLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtaskContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
  },
  subtaskText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  descriptionInput: {
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    padding: 16,
    color: '#FFFFFF',
    height: 150,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  subtaskInput: {
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    padding: 16,
    color: '#FFFFFF',
    height: 50,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  actionButtonsContainer: {
    flexDirection: 'column',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 5,
  },
  updateButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
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
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    padding: 5,
    borderRadius: 5,
    marginLeft: 10,
  },
  categoryButtonText: {
    color: '#FFFFFF',
    marginRight: 5,
  },
});

export default TaskDetails;