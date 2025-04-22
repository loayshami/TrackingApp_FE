import React, { useEffect, useState } from 'react';
import { View, Image,StyleSheet,ScrollView, ActivityIndicator, PermissionsAndroid, Platform, Alert } from 'react-native';
import { Button, Text, TextInput, Snackbar } from 'react-native-paper';
import { RouteProp } from '@react-navigation/native';
import Geolocation from '@react-native-community/geolocation';
import ReactNativeForegroundService from '@supersami/rn-foreground-service';
import { useNavigation } from '@react-navigation/native';


type WorkItem = {
  id: string;
  workDescription: string;
  startTime: string;
  endTime: string | null;
  duration: number;
};

type UserWorkResponse = {
  username: string;
  userwork: WorkItem[] | null;
};

type StartNewScreenProps = {
  route: RouteProp<{ params: { id: string; role: string } }, 'params'>;
};

const StartNewScreen: React.FC<StartNewScreenProps> = ({ route }) => {
  const { id, role } = route.params;

  const [userData, setUserData] = useState<UserWorkResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [workDescription, setWorkDescription] = useState<string>('');
  const [workId, setWorkId] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [prevLatitude, setPrevLatitude] = useState<number | null>(null);
  const [prevLongitude, setPrevLongitude] = useState<number | null>(null);
  const [message, setMessage] = useState<string>('');
  const [visible, setVisible] = useState<boolean>(false);
  const navigation = useNavigation();


  const baseUrl = 'http://13.49.88.119:5000/api/work';

  const getDistanceFromLatLonInMeters = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3;
    const toRad = (value: number) => (value * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };
  const startForegroundService = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
  
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        await ReactNativeForegroundService.start({
          id: 144,
          title: 'Employee Tracker',
          message: 'Tracking your location while working',
          icon: 'ic_launcher',
          ServiceType: 'location',
        });
  
        await ReactNativeForegroundService.remove_all_tasks();
  
        await ReactNativeForegroundService.add_task(() => {
          fetchLocation();
        }, {
          delay: 10000, // every 10 seconds
          onLoop: true,
          taskId: 'locationTask',
          onError: e => console.error('ForegroundService task error:', e),
        });
      } else {
        console.warn('Location permission denied');
      }
    }
  };
  
  
  
  const stopForegroundService = async () => {
    if (Platform.OS === 'android') {
      await ReactNativeForegroundService.stop();
    }
  };
  

  const fetchLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude: newLat, longitude: newLon } = position.coords;

        if (prevLatitude !== null && prevLongitude !== null) {
          const distance = getDistanceFromLatLonInMeters(prevLatitude, prevLongitude, newLat, newLon);
          console.log(`Moved distance: ${distance.toFixed(2)} meters`);

          if (distance >= 15) {
            setLatitude(newLat);
            setLongitude(newLon);
            setPrevLatitude(newLat);
            setPrevLongitude(newLon);
            handleUpdateLocation(newLat, newLon); // Only update if moved
          }
        } else {
          setLatitude(newLat);
          setLongitude(newLon);
          setPrevLatitude(newLat);
          setPrevLongitude(newLon);
          handleUpdateLocation(newLat, newLon); //initial insert
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setMessage('Failed to get location');
        setVisible(true);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const fineLocationGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        const coarseLocationGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
        );

        if (
          fineLocationGranted === PermissionsAndroid.RESULTS.GRANTED &&
          coarseLocationGranted === PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log('Location permissions granted');
          fetchLocation();
        } else {
          setMessage('Location permission denied. Please allow location to continue.');
          setVisible(true);
        }

          PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
        {
          title: 'Background Location Permission',
          message:
            'We need access to your location ' +
            'so you can get live quality updates.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },);
      } catch (err) {
        console.warn(err);
      }
    } else {
      fetchLocation();
    }
  };

  const fetchWorkData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/GetTodayUserWork?id=${id}`);
      const data: UserWorkResponse = await response.json();
      setUserData(data);
      if (data.userwork && data.userwork.length > 0) {
        setWorkId(data.userwork[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch work data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartWork = async () => {
    if (!workDescription || latitude === null || longitude === null) {
      Alert.alert('Error', 'Please wait until location is ready and fill work description.');
      return;
    }
    try {
      const response = await fetch(`${baseUrl}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: userData?.username,
          workDescription,
          latitude,
          longitude,
        }),
      });
  
      const result = await response.json();
      Alert.alert('Success', result?.message || 'Work started');
      fetchWorkData();
  
      await startForegroundService(); // Start background tracking
    } catch (error) {
      Alert.alert('Error', 'Failed to start work'+error);
    }
  };
  

  const handleStopWork = async () => {
    if (!workId || !userData?.username) return;
  
    try {
      await fetchLocation();
  
      const response = await fetch(`${baseUrl}/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workHistoryId: parseInt(workId),
          username: userData.username,
        }),
      });
  
      const result = await response.json();
      Alert.alert('Success', result?.message || 'Work stopped');
      fetchWorkData();
  
      await stopForegroundService(); // Stop background tracking
    } catch (error) {
      Alert.alert('Error', 'Failed to stop work');
    }
  };
  

  const handleUpdateLocation = async (lat: number, lon: number) => {
    if (!workId || !userData?.username) return;

    try {
      const response = await fetch(`${baseUrl}/update-location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workHistoryId: parseInt(workId),
          username: userData.username,
          latitude: lat,
          longitude: lon,
        }),
      });

      const result = await response.json();
      console.log('Location updated:', result.message);
    } catch (error) {
      console.error('Update location failed:', error);
    }
  };
  const handleLogout = async () => {
    try {
      const response = await fetch('http://13.49.88.119:5000/api/Authentication/logout', {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
         
        },
      });
  console.log({response})
      if (response.ok) {
  
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      } else {
        console.log('Logout failed');
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  useEffect(() => {
    requestLocationPermission();
    fetchWorkData();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    const isWorking =
      userData?.userwork &&
      userData.userwork.length > 0 &&
      userData.userwork[0].endTime === '0001-01-01T00:00:00';

    if (isWorking) {
      interval = setInterval(() => {
        fetchLocation(); // handleUpdateLocation is called only if moved
      }, 10000); // Check every 10 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [userData, prevLatitude, prevLongitude]);
  const isWorking =
  userData?.userwork &&
  userData.userwork.length > 0 &&
  userData.userwork[0].endTime === '0001-01-01T00:00:00';
  const hasFinishedWork =
  userData?.userwork &&
  userData.userwork.length > 0 &&
  userData.userwork[0].endTime !== '0001-01-01T00:00:00';


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={require('../assets/images/app_icon.png')} style={styles.logo} />
  
      <Text style={styles.headerText}>Work Session</Text>
  
      <Text style={[styles.statusText, isWorking ? styles.working : styles.notWorking]}>
        Status: {isWorking ? 'Working' : hasFinishedWork ? 'Finished' : 'Not Working'}
      </Text>
  
      {isWorking && (
        <View style={styles.sectionCard}>
          <Text style={styles.cardHeader}>Work In Progress</Text>
          <Text style={styles.cardText}>
            Start Time: {new Date(userData.userwork[0].startTime).toLocaleTimeString()}
          </Text>
          <Text style={styles.cardText}>Work: {userData.userwork[0].workDescription}</Text>
          <Button mode="contained" style={styles.buttonStop} onPress={handleStopWork}>
            Stop Work
          </Button>
        </View>
      )}
  
      {!isWorking && !hasFinishedWork && (
        <View style={styles.sectionCard}>
          <TextInput
            label="Work Description"
            value={workDescription}
            onChangeText={setWorkDescription}
            mode="outlined"
            style={styles.input}
            activeOutlineColor="#007BFF"

          />
          <Button
            mode="contained"
            onPress={handleStartWork}
            disabled={!workDescription}
            style={[styles.buttonStart, !workDescription && styles.disabledButton]}
          >
            Start Work
          </Button>
        </View>
      )}
  
      {hasFinishedWork && (
        <View style={styles.sectionCard}>
          <Text style={styles.cardHeader}>Work Finished</Text>
          <Text style={styles.cardText}>
            Start Time: {new Date(userData.userwork[0].startTime).toLocaleTimeString()}
          </Text>
          <Text style={styles.cardText}>
            End Time: {new Date(userData.userwork[0].endTime!).toLocaleTimeString()}
          </Text>
          <Text style={styles.cardText}>
            Work: {userData.userwork[0].workDescription}
          </Text>
          <Text style={styles.cardText}>
            Duration: {userData.userwork[0].duration.toFixed(2)} hours
          </Text>
          <Text style={styles.readyText}>Be ready for tomorrow!</Text>
        </View>
      )}
  <Button 
  mode="outlined" 
  onPress={handleLogout} 
  style={styles.logoutButton}
>
  Logout
</Button>
<Text style={styles.footerText}>
        Company ID9 - Employee Work Tracking
      </Text>
      <Snackbar visible={visible} onDismiss={() => setVisible(false)} duration={3000}>
        {message}
      </Snackbar>
    </ScrollView>
  );};
  

  const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      padding: 20,
      backgroundColor: '#f8f9fa',
      alignItems: 'center',
      justifyContent: 'center',
    },
    logo: {
      width: 100,
      height: 100,
      marginBottom: 20,
    },
    headerText: {
      fontSize: 26,
      fontWeight: 'bold',
      marginBottom: 10,
      color: '#333',
    },
    statusText: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 10,
    },
    working: {
      color: '#28a745',
    },
    notWorking: {
      color: '#dc3545',
    },
    cardHeader: {
      fontSize: 18,
      fontWeight: '600',
      color: '#333',
      marginBottom: 8,
    },
    cardText: {
      fontSize: 16,
      color: '#444',
      marginVertical: 5,
    },
    sectionCard: {
      width: '100%',
      backgroundColor: '#fff',
      padding: 15,
      borderRadius: 10,
      marginVertical: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
    input: {
      width: '100%',
      marginVertical: 10,
      backgroundColor: 'white',
    },
    buttonStart: {
      backgroundColor: '#28a745',
      marginTop: 10,
      width: '100%',
      paddingVertical: 8,
      borderRadius: 8,
    },
    buttonStop: {
      backgroundColor: '#dc3545',
      marginTop: 10,
      width: '100%',
      paddingVertical: 8,
      borderRadius: 8,
    },
    disabledButton: {
      backgroundColor: '#ccc',
    },
    readyText: {
      fontSize: 18,
      color: '#28a745',
      fontWeight: '600',
      textAlign: 'center',
      marginTop: 15,
    },
    logoutButton: {
      marginTop: 30,
      borderColor: '#FF3B30',
      borderWidth: 1,
      alignSelf: 'center',
      width: '50%',
    },
    footerText: {
      marginTop: 40,
      fontSize: 14,
      color: '#888',
    },
    
  });
  
  
  

export default StartNewScreen;
