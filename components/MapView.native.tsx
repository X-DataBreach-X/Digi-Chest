import GoogleMapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { Platform, StyleSheet } from 'react-native';

const googleMapStyle = [
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off'}],
  },
  {
    featureType: 'transmit',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'road',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#f0f0ee'}],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#d6d6d6'}],
  },
];

export default function MapView() {
  return (
    <GoogleMapView
      provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
      style={styles.map}
      customMapStyle={googleMapStyle}
      showsBuildings
      showsCompass
      zoomControlEnabled={false}
      initialRegion={{
        latitude: 39.7392,
        longitude: -104.9903,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
    />
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});