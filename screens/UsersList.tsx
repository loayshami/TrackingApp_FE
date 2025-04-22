import React, { useState, useEffect } from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text, Button, Snackbar, ActivityIndicator ,Appbar} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

type User = {
  username: string;
};

const AdminViewScreen = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [visible, setVisible] = useState<boolean>(false);

  const navigation = useNavigation();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://13.49.88.119:5000/api/work/users');
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || 'Failed to fetch users');
      setUsers(data || []);
    } catch (error: any) {
      setMessage(error.message || 'An error occurred');
      setVisible(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const renderItem = ({ item }: { item: User }) => (
    <View style={styles.card}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <MaterialCommunityIcons name="account" size={22} color="#007BFF" style={{ marginRight: 6 }} />
        <Text style={styles.username}>{item.username}</Text>
      </View>
      <Button
        mode="contained"
        buttonColor="#007BFF"
        onPress={() =>
          navigation.navigate('UsersWorkHistory', { username: item.username })
        }
        style={styles.viewButton}
        labelStyle={styles.viewButtonLabel}
      >
        View History
      </Button>
    </View>
  );
  
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
  return (
    <KeyboardAvoidingView
    
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
     <Appbar.Header>
   <Appbar.BackAction onPress={() => navigation.goBack()} />

  <Appbar.Content title="Users" />
  <Appbar.Action icon="logout" onPress={handleLogout} />
</Appbar.Header>
      <View style={styles.inner}>
        {loading ? (
          <ActivityIndicator size="large" color="#007BFF" />
        ) : (
          <FlatList
  data={users}
  renderItem={renderItem}
  keyExtractor={(item, index) => index.toString()}
  contentContainerStyle={styles.list}
  showsVerticalScrollIndicator={false}
  ItemSeparatorComponent={() => <View style={styles.separator} />}
/>

        )}

        <Snackbar
          visible={visible}
          onDismiss={() => setVisible(false)}
          style={styles.snackbar}
          action={{
            label: 'Close',
            onPress: () => setVisible(false),
            textColor: '#007BFF',
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
    padding: 0,
    paddingTop: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    color: '#1f1f1f',
  },
  list: {
    paddingBottom: 0,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 0, 
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 0, 
    shadowColor: 'transparent', 
    elevation: 0, 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  username: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  viewButton: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minHeight: 30,
  },
  
  viewButtonLabel: {
    fontSize: 12,
    color: '#fff',
    lineHeight: 16,
  },
  snackbar: {
    backgroundColor: 'black',
    borderRadius: 8,
  },
  separator: {
    height: 1,
    backgroundColor: 'black',
    marginVertical: 5,
  },
});

export default AdminViewScreen;
