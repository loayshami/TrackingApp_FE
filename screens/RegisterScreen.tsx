import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Snackbar, Text } from 'react-native-paper';
import DeviceInfo from 'react-native-device-info';

const RegisterScreen = ({ navigation }: any) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mobileSuffix, setMobileSuffix] = useState('');
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [DeviceId, setDeviceId] = useState('');

  useEffect(() => {
    DeviceInfo.getUniqueId().then(setDeviceId);
  }, []);

  const isValidSaudiNumber = (phone: string) => {
    const pattern = /^\+9665\d{8}$/;
    return pattern.test(phone);
  };

  const handleRegister = async () => {
    const fullPhone = `+966${mobileSuffix}`;

    if (!username || !password || !mobileSuffix) {
      setMessage('All fields are required.');
      setVisible(true);
      return;
    }

    if (!isValidSaudiNumber(fullPhone)) {
      setMessage('Number not correct');
      setVisible(true);
      return;
    }

    const formData = { DeviceId, username, password, mobilePhone: fullPhone };

    try {
      setMessage('Processing...');
      setErrors([]);
      setVisible(true);

      const response = await fetch('http://13.49.88.119:5000/api/Authentication/register', {
      method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (Array.isArray(data.errors)) {
          setErrors(data.errors.map((err: any) => err.description));
        } else {
          throw new Error(data?.message || 'Registration failed');
        }
      } else {
        setMessage(data?.message || 'Registration successful');
        navigation.navigate('Login');
      }
    } catch (error: any) {
      setMessage(error.message || 'An error occurred');
    } finally {
      setVisible(true);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <View style={styles.inner}>
        <Image source={require('../assets/images/app_icon.png')} style={styles.logo} />
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Fill in the form to get started</Text>

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
        <View style={styles.phoneInputContainer}>
          <Text style={styles.prefix}>+966</Text>
          <TextInput
            label="5XXXXXXXX"
            value={mobileSuffix}
            onChangeText={(text) => setMobileSuffix(text.replace(/[^0-9]/g, '').slice(0, 9))}
            keyboardType="number-pad"
            style={styles.phoneInput}
            mode="outlined"
            activeOutlineColor="#007BFF"
          />
        </View>

        <Button
          buttonColor="#007BFF"
          mode="contained"
          onPress={handleRegister}
          style={styles.button}
        >
          Register
        </Button>

        <Button
          labelStyle={{ color: '#333', fontSize: 14, fontWeight: '500' }}
          mode="text"
          onPress={() => navigation.navigate('Login')}
        >
          Already have an account? Login
        </Button>

        {errors.length > 0 && (
          <View style={styles.errorContainer}>
            {errors.map((err, index) => (
              <Text key={index} style={styles.errorText}>{err}</Text>
            ))}
          </View>
        )}
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
  container: { flex: 1, backgroundColor: '#f2f7fd' },
  inner: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
  logo: { width: 110, height: 110, marginBottom: 25, borderRadius: 20 },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 10, color: '#1f1f1f' },
  subtitle: { fontSize: 14, color: '#555', marginBottom: 25 },
  input: { width: '100%', marginBottom: 15 },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
  },
  prefix: {
    fontSize: 16,
    marginRight: 8,
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: '#eee',
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  phoneInput: {
    flex: 1,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  button: { marginTop: 10, width: '100%', paddingVertical: 6, borderRadius: 6 },
  errorContainer: { marginTop: 20, width: '100%' },
  errorText: { color: 'red', fontSize: 13, marginBottom: 5 },
});

export default RegisterScreen;
