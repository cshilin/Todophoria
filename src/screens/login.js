import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, Image, SafeAreaView, Alert } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { FIREBASE_AUTH } from '../services/firebaseConfig';
import Logo from '../../assets/logo.png';

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (email && password) {
      try {
        await signInWithEmailAndPassword(FIREBASE_AUTH, email, password);
        console.log('User logged in successfully!');
        navigation.navigate('Main');
      } catch (error) {
        Alert.alert('Login Error', error.message);
      }
    } else {
      Alert.alert('Error', 'Please enter both email and password');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topContent}>
        <View style={styles.logoContainer}>
          <Image source={Logo} style={styles.logo} />
        </View>
        <Text style={styles.title}>Todophoria</Text>
        <Text style={styles.subtitle}>Where Completing To-Dos Make You Happy</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#666"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.registerButton} 
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#000000',
    },
    topContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    logoContainer: {
      width: 100,
      height: 100,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    logo: {
      width: '200%',
      height: '200%',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#FFFFFF',
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 16,
      color: '#FFFFFF',
      textAlign: 'center',
      marginBottom: 40,
    },
    input: {
      width: '100%',
      backgroundColor: '#333',
      color: '#fff',
      padding: 15,
      borderRadius: 5,
      marginBottom: 10,
    },
    buttonContainer: {
      padding: 20,
    },
    loginButton: {
      backgroundColor: '#4CAF50',
      width: '100%',
      padding: 15,
      borderRadius: 5,
      alignItems: 'center',
      marginBottom: 10,
    },
    registerButton: {
      backgroundColor: '#3498db',
      width: '100%',
      padding: 15,
      borderRadius: 5,
      alignItems: 'center',
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });  

export default Login;