import React, { useState, useEffect } from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Button, Snackbar, Card, Appbar } from 'react-native-paper';

<Appbar.Action
  icon={({ size, color }) => (
    <MaterialCommunityIcons name="logout" size={size} color={color} />
  )}
  onPress={() => {
    navigation.navigate('Login'); 
  }}
/>


interface AdminViewProps {
  navigation: any;
  route: {
    params: {
      username: string;
    };
  };
}

const AdminViewScreen = ({ navigation, route }: AdminViewProps) => {
  const [workHistory, setWorkHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);

  const fetchWorkHistory = async () => {
    setLoading(true);
    const url = 'http://13.49.88.119:5000/api/work/working-users';
    try {
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data?.message || 'Failed to fetch work history';
        throw new Error(errorMessage);
      } else {
        setWorkHistory(data?.todayWorkHistory || []);
      }
    } catch (error: any) {
      setMessage(error.message || 'An error occurred');
      setVisible(true);
    } finally {
      setLoading(false);
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
    fetchWorkHistory();
  }, []);

  const renderItem = ({ item }: { item: any }) => {
    const startTime = new Date(item.startTime).toLocaleString();
    const endTime = item.endTime === '0001-01-01T00:00:00' ? 'Ongoing' : new Date(item.endTime).toLocaleString();
    const duration = item.duration ? `${(item.duration * 60).toFixed(2)} minutes` : 'Ongoing';

    return (
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.username}>User: {item.username}</Text>
          <Text style={styles.workDescription}>Work Description: {item.workDescription}</Text>
          <Text style={styles.timeWorked}>Start Time: {startTime}</Text>
          <Text style={styles.timeWorked}>End Time: {endTime}</Text>
          <Text style={styles.timeWorked}>Duration: {duration}</Text>
        </Card.Content>
        <Card.Actions style={styles.cardActions}>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('UserDetails', { workDetails: item })}
            style={styles.button}
          >
            View Details
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
   <Appbar.Header>

  <Appbar.Content title="Admin Dashboard" />
  <Appbar.Action icon="account-multiple" onPress={() => navigation.navigate('UsersList')} />
  <Appbar.Action icon="logout" onPress={handleLogout} />
</Appbar.Header>



      <View style={styles.inner}>
        {loading ? (
          <ActivityIndicator size="large" color="#6200ee" />
        ) : (
          <>
            <Text style={styles.subHeader}>Working Today</Text>
            <FlatList
              data={workHistory}
              renderItem={renderItem}
              keyExtractor={(item) => item.id.toString()}
            />
          </>
        )}

        <Snackbar
          visible={visible}
          onDismiss={() => setVisible(false)}
          style={styles.snackbar}
          action={{
            label: 'Close',
            onPress: () => setVisible(false),
            textColor: '#fff',
          }}
        >
          {message}
        </Snackbar>
      </View>
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
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  subHeader: {
    fontSize: 18,
    fontWeight: '500',
    marginVertical: 25,
    color: '#555',
  },
  card: {
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    width: '100%',
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  
  workDescription: {
    fontSize: 16,
    marginTop: 10,
    color: '#444',
  },
  timeWorked: {
    fontSize: 14,
    marginTop: 8,
    color: 'gray',
  },
  cardActions: {
    justifyContent: 'flex-end',
    marginTop: 15,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 6,

    width: '100%',
    backgroundColor: '#6200ee',
  },
  snackbar: {
    backgroundColor: '#333',
    borderRadius: 8,
  },
});

export default AdminViewScreen;
