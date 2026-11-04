import { useEffect, useState } from 'react';
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from 'react-leaflet';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Coordinates = [number, number];

const defaultCenter: Coordinates = [39.7392, -104.9903];

function RecenterMap({
  position,
}: {
  position: Coordinates | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, 16);
    }
  }, [map, position]);

  return null;
}

export default function MapView() {
  const [userPosition, setUserPosition] = useState<Coordinates | null>(null);

  const [status, setStatus] = useState('Use my location');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function requestLocation() {
    if (!navigator.geolocation) {
      setErrorMessage('Location is not supported by this browser.');
      return;
    }

    setStatus('Finding your location...');
    setErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      (location) => {
        const coordinates: Coordinates = [
          location.coords.latitude,
          location.coords.longitude,
        ];

        setUserPosition(coordinates);
        setStatus('Location found');
      },
      (error) => {
        if (error.code === 1) {
          setErrorMessage(
            'Location permission was denied. Please allow it in your browser settings.',
          );
        } else if (error.code === 2) {
          setErrorMessage('Your location could not be determined.');
        } else if (error.code === 3) {
          setErrorMessage('Finding your location took too long.');
        } else {
          setErrorMessage('Something went wrong while finding your location.');
        }

        setStatus('Try again');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  }

  return (
    <View style={styles.container}>
      <MapContainer
        center={defaultCenter}
        zoom={13}
        scrollWheelZoom={true}
        style={styles.map}
      >
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
        />

        <RecenterMap position={userPosition} />

        {userPosition && (
          <Marker position={userPosition}>
            <Popup>You are here</Popup>
          </Marker>
        )}
      </MapContainer>

      <Pressable style={styles.locationButton} onPress={requestLocation}>
        <Text style={styles.buttonText}>{status}</Text>
      </Pressable>

      {errorMessage && (
        <View style={styles.errorBox}>
          <Text>{errorMessage}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  locationButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1000,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    fontWeight: '600',
  },
  errorBox: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    zIndex: 1000,
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
  },
});
