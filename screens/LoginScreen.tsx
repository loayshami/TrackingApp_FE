import React, { useState,useEffect } from 'react';
import { View, StyleSheet, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Snackbar, Text } from 'react-native-paper';
import DeviceInfo from 'react-native-device-info';

const LoginScreen = ({ navigation }: any) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
    const [DeviceId, setDeviceId] = useState('');
    const [isDeviceIdFetched, setIsDeviceIdFetched] = useState(false);

    useEffect(() => {
      const fetchDeviceId = async () => {
        const uniqueId = await DeviceInfo.getUniqueId();
        setDeviceId(uniqueId);
        setIsDeviceIdFetched(true); 
        console.log("Device Unique ID:", uniqueId);
      };
      fetchDeviceId();
    }, []);
  

  const handleLogin = async () => {
const url = 'http://13.49.88.119:5000/api/Authentication/login';

    if (!username || !password) {
      setMessage('Both fields are required.');
      setVisible(true);
      return;
    }

    const formData = { username, password ,DeviceId};

    try {
      setMessage('Processing...');
      setVisible(true);

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
console.log({data})
      if (!response.ok) {
        throw new Error(data?.message || 'Login failed');
      } else {
        setMessage(data?.message || 'Login successful');
        setVisible(true);

        if (data?.role === 'Admin') {
          navigation.navigate('Owner', {
            id: data?.id || '',
            role: data?.role || 'User',
          });
        } else if (data?.role === 'employee') {
          navigation.navigate('startnew', {
            id: data?.id || '',
            role: data?.role || 'User',
          });
        }
      }
    } catch (error: any) {
      setMessage(error.message || 'An error occurred');
      setVisible(true);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
      <View style={styles.inner}>
        <Image source={require('../assets/images/app_icon.png')} style={styles.logo} />
        <Text style={styles.welcomeText}>Welcome Back</Text>
        <Text style={{ fontSize: 14, color: '#555', marginBottom: 25 }}>
          Please login to your account
        </Text>
        <TextInput
          label="Username"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
          mode="outlined"
          activeOutlineColor="#007BFF"
        />

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          mode="outlined"
          activeOutlineColor="#007BFF"
        />

        <Button buttonColor="#007BFF" mode="contained" onPress={handleLogin} style={styles.button}>
          Login
        </Button>

        <Button   
          labelStyle={{ color: '#333', fontSize: 14, fontWeight: '500' }}
          mode="text" onPress={() => navigation.navigate('Register')}>
          Don't have an account? Register
        </Button>
      </View>

      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        style={{ backgroundColor: 'black' }} 
        action={{
          label: 'Close',
          onPress: () => setVisible(false),
          textColor: '#007BFF',
        }}
      >
        {message}
      </Snackbar>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f7fd',
  },
  inner: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 110,
    height: 110,
    marginBottom: 25,
    borderRadius: 20,
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 35,
    color: '#1f1f1f',
    letterSpacing: 0.5,
  },
  input: {
    width: '100%',
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
    width: '100%',
    paddingVertical: 6,
    borderRadius: 6,
  },
});

export default LoginScreen;
