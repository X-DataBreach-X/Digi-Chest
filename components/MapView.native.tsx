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
  const currentMapRegion = useRef<Region>(defaultRegion);

  const [userRegion, setUserRegion] = useState<Region | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;
    let locationSubscription: Location.LocationSubscription | null = null;

    async function startLocationTracking() {
      try {
        const permission =
          await Location.requestForegroundPermissionsAsync();

        if (permission.status !== "granted") {
          if (!isCancelled) {
            setLocationError("Location permission was denied.");
          }
          return;
        }

        if (!isCancelled) {
          setPermissionGranted(true);
        }

        const initialLocation =
          await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });

        const initialRegion: Region = {
          latitude: initialLocation.coords.latitude,
          longitude: initialLocation.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };

        if (!isCancelled) {
          setUserRegion(initialRegion);
        }

        locationSubscription =
          await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.High,
              timeInterval: 1000,
              distanceInterval: 3,
            },
            (newLocation) => {
              const newRegion: Region = {
                latitude: newLocation.coords.latitude,
                longitude: newLocation.coords.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              };

              if (!isCancelled) {
                setUserRegion(newRegion);
              }
            },
          );

        if (isCancelled) {
          locationSubscription?.remove();
        }
      } catch {
        if (!isCancelled) {
          setLocationError("Unable to track your location.");
        }
      }
    }

    startLocationTracking();

    return () => {
      isCancelled = true;
      locationSubscription?.remove();
    };
  }, []);

  useEffect(() => {
    if (!userRegion || !mapRef.current) {
      return;
    }

    const currentRegion = currentMapRegion.current;

    const nextRegion: Region = {
      latitude: userRegion.latitude,
      longitude: userRegion.longitude,
      latitudeDelta: currentRegion.latitudeDelta,
      longitudeDelta: currentRegion.longitudeDelta,
    };

    currentMapRegion.current = nextRegion;

    mapRef.current.animateToRegion(nextRegion, 500);
  }, [userRegion]);

  function rememberMapRegion(region: Region) {
    currentMapRegion.current = region;
  }

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
        scrollEnabled={false}
        zoomEnabled
        rotateEnabled
        pitchEnabled={false}
        scrollDuringRotateOrZoomEnabled={false}
        minDelta={0.004}
        maxDelta={0.025}
        onRegionChangeComplete={rememberMapRegion}
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
    right: 20,
    left: 20,
    padding: 12,
    color: "red",
    backgroundColor: "white",
  },
});
