import { AppleMaps, GoogleMaps } from 'expo-maps';
import { Platform, StyleSheet, Text, View } from 'react-native';

export default function MapView() {
  if (Platform.OS === 'ios') {
    return <AppleMaps.View style={styles.map} />;
  }

  if (Platform.OS === 'android') {
    return <GoogleMaps.View style={styles.map} />;
  }

  return (
    <View style={styles.message}>
      <Text>Maps are available on Android and iOS.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  message: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});