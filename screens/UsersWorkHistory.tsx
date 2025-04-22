import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, FlatList, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation, RouteProp, useRoute } from '@react-navigation/native';
import { Card, Button, Snackbar,Appbar } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

type WorkHistory = {
  id: number;
  username: string;
  workDescription: string;
  startTime: string;
  endTime: string;
  duration: number;
  latitude: number;
  longitude: number;
};

type UserHistoryScreenRouteProp = RouteProp<{ params: { username: string } }, 'params'>;

const UserHistoryScreen: React.FC = () => {
  const route = useRoute<UserHistoryScreenRouteProp>();
  const { username } = route.params;

  const [history, setHistory] = useState<WorkHistory[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [visible, setVisible] = useState<boolean>(false);
  const navigation = useNavigation();

  const fetchUserHistory = async () => {
    setLoading(true);
    const url = `http://13.49.88.119:5000/api/work/userWork?username=${encodeURIComponent(username)}`;
    try {
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data?.message || 'Failed to fetch user work history';
        throw new Error(errorMessage);
      } else {
        const sortedData = (data || []).sort(
          (a: WorkHistory, b: WorkHistory) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        );
        setHistory(sortedData);
      }
    } catch (error: any) {
      setMessage(error.message || 'An error occurred');
      setVisible(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserHistory();
  }, []);

  const renderItem = ({ item }: { item: WorkHistory }) => {
    const startTime = new Date(item.startTime).toLocaleString();
    const endTime = item.endTime === "0001-01-01T00:00:00" ? "Ongoing" : new Date(item.endTime).toLocaleString();
    const duration = item.duration ? `${item.duration.toFixed(2)} hrs` : "Ongoing";

    return (
      
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.label}>📝 <Text style={styles.value}>{item.workDescription}</Text></Text>
          <Text style={styles.label}>🕐 Start: <Text style={styles.value}>{startTime}</Text></Text>
          <Text style={styles.label}>🛑 End: <Text style={styles.value}>{endTime}</Text></Text>
          <Text style={styles.label}>⏱️ Duration: <Text style={styles.value}>{duration}</Text></Text>
          <Button
            mode="contained"
            style={styles.detailsButton}
            onPress={() => navigation.navigate('UserDetails', { workDetails: item })}
          >
            View Details
          </Button>
        </Card.Content>
      </Card>
    );
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
       <Appbar.Header>
       <Appbar.BackAction onPress={() => navigation.goBack()} />
       <Appbar.Content title={`Work History for ${route.params.username}`} />
        
       </Appbar.Header>

      <View style={styles.inner}>

        {loading ? (
          <ActivityIndicator size="large" color="#3b82f6" />
        ) : (
          <FlatList
            data={history}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={<Text style={styles.emptyText}>No work history found.</Text>}
            showsVerticalScrollIndicator={false}
          />
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
    backgroundColor: '#f0f4f8',
  },
  inner: {
    flex: 1,
    padding: 10,
  },
  header: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
    color: '#1e293b',
  },
  username: {
    color: '#3b82f6',
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#64748b',
    marginTop: 40,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    elevation: 3,
    padding: 16,
  },
  label: {
    fontSize: 15,
    color: '#334155',
    marginBottom: 6,
  },
  value: {
    fontWeight: 'bold',
    color: '#0f172a',
  },
  detailsButton: {
    marginTop: 12,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
  },
  snackbar: {
    backgroundColor: '#ef4444',
    borderRadius: 8,
  },
});

export default UserHistoryScreen;
