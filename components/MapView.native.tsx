import { useEffect, useRef, useState } from "react";
import * as Location from "expo-location";
import CharacterViewer from "./CharacterViewer";
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
        showsUserLocation={false}
        zoomControlEnabled={false}
        initialRegion={defaultRegion}
      />

      <View
        pointerEvents="none"
        style={styles.avatarOverlay}
      >
        <View style={styles.avatarOnMap}>
          <CharacterViewer />
        </View>
      </View>

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

  avatarOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    elevation: 2,
  },

  avatarOnMap: {
    width: 100,
    height: 100,
    transform: [{ translateY: 35 }],
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