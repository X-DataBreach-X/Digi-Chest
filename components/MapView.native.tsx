import { useEffect, useRef, useState } from "react";
import * as Location from "expo-location";
import MapView, {
  PROVIDER_GOOGLE,
  type Region,
} from "react-native-maps";
import {
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";

const googleMapStyle = [
  {
    featureType: "all",
    elementType: "labels",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
];

const defaultRegion: Region = {
  latitude: 39.7392,
  longitude: -104.9903,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function MapScreen() {
  const mapRef = useRef<MapView | null>(null);

  const [userRegion, setUserRegion] = useState<Region | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function requestLocation() {
      try {
        const permission = await Location.requestForegroundPermissionsAsync();

        if (permission.status !== "granted") {
          if (!isCancelled) {
            setLocationError("Location permission was denied.");
          }
          return;
        }

        if (!isCancelled) {
          setPermissionGranted(true);
        }

        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const newRegion: Region = {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };

        if (!isCancelled) {
          setUserRegion(newRegion);
        }
      } catch {
        if (!isCancelled) {
          setLocationError("Unable to find your location.");
        }
      }
    }

    requestLocation();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (userRegion && mapRef.current) {
      mapRef.current.animateToRegion(userRegion, 1000);
    }
  }, [userRegion]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={
          Platform.OS === "android"
            ? PROVIDER_GOOGLE
            : undefined
        }
        style={styles.map}
        customMapStyle={googleMapStyle}
        showsBuildings
        showsCompass
        showsUserLocation={permissionGranted}
        zoomControlEnabled={false}
        initialRegion={defaultRegion}
        />

        {locationError && (
          <Text style={styles.error}>
            {locationError}
          </Text>
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  error: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    padding: 12,
    backgroundColor: "white",
    color: "red",
  },
});