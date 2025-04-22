import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { Appbar } from 'react-native-paper';
import MapView, { Marker, Polyline, LatLng } from 'react-native-maps';

interface WorkDetailsProps {
  route: {
    params: {
      workDetails: {
        id: number;
        username: string;
        workDescription: string;
        startTime: string;
        endTime: string;
        duration: number;
      };
    };
  };
}

const WorkDetailsScreen = ({ route, navigation }: WorkDetailsProps) => {
  const { workDetails } = route.params;
  const [locationPoints, setLocationPoints] = useState<LatLng[]>([]);
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<MapView>(null);
  const scheme = useColorScheme();

  const formatDuration = (duration: number | null) => {
    return duration ? `${(duration * 60).toFixed(2)} minutes` : 'Ongoing';
  };

  const isOngoing = workDetails.endTime === '0001-01-01T00:00:00';

  const fetchLocationHistory = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://13.49.88.119:5000/api/work/get-location-points?workHistoryId=${workDetails.id}`
      );
      if (!response.ok) throw new Error(`Status ${response.status}`);
      const data: { latitude: number; longitude: number }[] = await response.json();

      const parsedPoints: LatLng[] = data.map((p) => ({
        latitude: p.latitude,
        longitude: p.longitude,
      }));

      if (parsedPoints.length > locationPoints.length) {
        setLocationPoints(parsedPoints);
      }
    } catch (err) {
      console.error('Fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, [workDetails.id, locationPoints.length]);

  useEffect(() => {
    fetchLocationHistory();
  }, []);

  useEffect(() => {
    if (isOngoing) {
      const interval = setInterval(fetchLocationHistory, 5000);
      return () => clearInterval(interval);
    }
  }, [fetchLocationHistory, isOngoing]);

  useEffect(() => {
    if (locationPoints.length > 0) {
      const interval = setInterval(() => {
        setCurrentPositionIndex((prev) =>
          prev + 1 < locationPoints.length ? prev + 1 : prev
        );
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [locationPoints]);

  useEffect(() => {
    if (locationPoints.length && currentPositionIndex < locationPoints.length) {
      mapRef.current?.animateToRegion(
        {
          ...locationPoints[currentPositionIndex],
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        500
      );
    }
  }, [currentPositionIndex]);

  const currentPoint =
    locationPoints[currentPositionIndex] || locationPoints[locationPoints.length - 1];

  const isDark = scheme === 'dark';

 
  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Work Details" />
      </Appbar.Header>

      <ScrollView
        style={[
          styles.container,
          { backgroundColor: isDark ? '#121212' : '#f7f7f7' },
        ]}
      >

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Username: <Text style={{ color: 'grey' }}>{workDetails.username}</Text>
          </Text>
          <Text style={styles.cardTitle}>
            Work Description: <Text style={{ color: 'grey' }}>{workDetails.workDescription}</Text>
          </Text>

          <Text style={styles.cardTitle}>
            Start Time: <Text style={{ color: 'grey' }}>{new Date(workDetails.startTime).toLocaleString()}</Text>
          </Text>
          <Text style={styles.cardTitle}>
            End Time: <Text style={{ color: 'grey' }}>
              {isOngoing
                ? 'Ongoing'
                : new Date(workDetails.endTime).toLocaleString()}
            </Text>
          </Text>

          <Text style={styles.cardTitle}>
            Duration: <Text style={{ color: 'grey' }}>{formatDuration(workDetails.duration)}</Text>
          </Text>
          <View style={{ height: 400, marginTop: 20 }}>
            {loading && (
              <ActivityIndicator size="large" color="#6200ee" style={styles.loader} />
            )}
            <MapView
              ref={mapRef}
              style={styles.map}
              initialRegion={{
                latitude: locationPoints[0]?.latitude || 0,
                longitude: locationPoints[0]?.longitude || 0,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              {locationPoints.length > 0 && (
                <>
                  <Polyline coordinates={locationPoints} strokeColor="#6200ee" strokeWidth={3} />
                  <Marker coordinate={currentPoint} title="User Location" pinColor="red" />
                </>
              )}
            </MapView>
          </View>

          {locationPoints.length === 0 && !loading && (
            <Text style={styles.noDataText}>No location points found.</Text>
          )}
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    color: '#333',
  },
  cardContent: {
    fontSize: 14,
    color: '#1f1f1f',
    marginTop: 5,
  },
  map: {
    flex: 1,
    borderRadius: 10,
  },
  loader: {
    position: 'absolute',
    top: '50%',
    alignSelf: 'center',
    zIndex: 10,
  },
  noDataText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default WorkDetailsScreen;
