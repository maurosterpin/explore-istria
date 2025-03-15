import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import polyline from "@mapbox/polyline";
import * as Location from "expo-location";
import { useStore } from "@/app/store/AttractionStore";
import Entypo from "@expo/vector-icons/Entypo";
import { SafeAreaView } from "react-native-safe-area-context";
import { baseApiUrl } from "@/constants/Api";
import { FAB } from "react-native-paper";

const SCREEN_WIDTH = Dimensions.get("window").width;

const Map = () => {
  const [route, setRoute] = useState<Attraction[]>([]);
  const [roadRoute, setRoadRoute] = useState<any>([]);
  const [initialRegion, setInitialRegion] = useState<InitialRegion | null>(
    null
  );
  const [useMyLocation, setUseMyLocation] = useState<any>(false);
  const { selectedAttractions } = useStore();
  const [userLocation, setUserLocation] =
    useState<Location.LocationObjectCoords | null>(null);
  const [heading, setHeading] = useState<number>(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const watchLocSub = useRef<any>(null);
  const watchHeadSub = useRef<any>(null);

  async function startNavigation() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;

    watchLocSub.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        distanceInterval: 1,
      },
      (loc) => {
        setUserLocation(loc.coords);
      }
    );

    watchHeadSub.current = await Location.watchHeadingAsync((data) => {
      if (data.trueHeading >= 0) {
        setHeading(data.trueHeading);
      } else {
        setHeading(data.magHeading);
      }
    });
  }

  const stopNavigation = useCallback(() => {
    if (watchLocSub.current) {
      watchLocSub.current.remove();
      watchLocSub.current = null;
    }
    if (watchHeadSub.current) {
      watchHeadSub.current.remove();
      watchHeadSub.current = null;
    }
    setUserLocation(null);
  }, []);

  useEffect(() => {
    if (isNavigating) {
      startNavigation();
    } else {
      stopNavigation();
    }
  }, [isNavigating]);

  useEffect(() => {
    let locations = null;
    if (userLocation?.latitude && userLocation?.longitude) {
      const user: Attraction = {
        id: 0,
        name: "userLocation",
        lat: userLocation?.latitude,
        lng: userLocation?.longitude,
        description: "",
        imageUrl: "",
      };
      locations = [...selectedAttractions, user];
    }
    generateRoute(locations);
  }, [userLocation, selectedAttractions]);

  const generateRoute = useCallback(
    async (userLoc?: any) => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") setUseMyLocation(true);
        const data = await fetchRoute(userLoc);
        await fetchRoadRoute(data);
      } catch (error) {
        console.error("Error fetching route:", error);
      }
    },
    [selectedAttractions]
  );

  const fetchRoute = useCallback(
    async (locations?: any) => {
      try {
        const response = await fetch(`${baseApiUrl}/route`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(locations || selectedAttractions),
        });
        const data = await response.json();
        setRoute(data);
        if (data && data.length > 0) {
          setInitialRegion({
            latitude: data[0].lat,
            longitude: data[0].lng,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
        }
        return data;
      } catch (error) {
        console.error("Error fetching routeaa:", error);
      }
    },
    [selectedAttractions]
  );

  const fetchRoadRoute = useCallback(
    async (nodes: any) => {
      const coordinates = nodes.map((node: any) => [node.lng, node.lat]);
      const apiKey = process.env.EXPO_PUBLIC_ORS_API_KEY;

      try {
        const response = await fetch(
          "https://api.openrouteservice.org/v2/directions/foot-walking",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: apiKey!!,
            },
            body: JSON.stringify({
              coordinates,
            }),
          }
        );

        const data = await response.json();
        if (data.routes && data.routes.length > 0) {
          const decodedCoords = polyline.decode(data.routes[0].geometry);
          const routeCoords = decodedCoords.map(([lat, lng]) => ({
            latitude: lat,
            longitude: lng,
          }));
          setRoadRoute(routeCoords);
        }
      } catch (error) {
        console.error("Error fetching road route:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [selectedAttractions]
  );

  const [selectedAttraction, setSelectedAttraction] =
    useState<Attraction | null>(null);

  const panelAnim = useRef(new Animated.Value(SCREEN_WIDTH * 0.7)).current;

  const openPanel = useCallback((attraction: any) => {
    setSelectedAttraction(attraction);

    Animated.timing(panelAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, []);

  const closePanel = useCallback(() => {
    Animated.timing(panelAnim, {
      toValue: SCREEN_WIDTH * 0.7,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setSelectedAttraction(null);
    });
  }, []);

  // if (selectedAttractions.length < 1) {
  //   return (
  //     <View style={styles.loadingContainer}>
  //       <Text>No attractions selected</Text>
  //     </View>
  //   );
  // }

  if (selectedAttractions.length < 1) {
    return (
      <View style={styles.loadingContainer}>
        <Text>No attractions added to route</Text>
      </View>
    );
  }

  if (!initialRegion) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        onPress={closePanel}
        style={StyleSheet.absoluteFillObject}
        initialRegion={initialRegion}
        showsUserLocation={false}
        showsMyLocationButton={false}
      >
        {route.map((attraction) => {
          if (attraction.name === "userLocation") return null;
          return (
            <Marker
              key={attraction.id}
              coordinate={{
                latitude: attraction.lat,
                longitude: attraction.lng,
              }}
              onPress={() => openPanel(attraction)}
            />
          );
        })}

        {roadRoute.length > 1 && (
          <Polyline
            coordinates={roadRoute}
            strokeColor="#0084ff"
            strokeWidth={4}
          />
        )}

        {userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            anchor={{ x: 0.5, y: 0.5 }}
            style={{ transform: [{ rotate: `${heading}deg` }] }}
          >
            <Entypo name="direction" size={40} color={"blue"} />
          </Marker>
        )}
      </MapView>

      {useMyLocation && (
        <View style={styles.buttonContainer}>
          <FAB
            style={{
              position: "absolute",
              margin: 16,
              bottom: 0,
            }}
            label={
              isLoading
                ? "Loading..."
                : isNavigating
                ? "Stop Navigation"
                : "Start Navigation"
            }
            icon="map"
            disabled={isLoading}
            onPress={() => {
              setIsLoading(true);
              setIsNavigating(!isNavigating);
            }}
          />
        </View>
      )}

      <Animated.View
        onTouchEnd={closePanel}
        style={[styles.sidePanel, { transform: [{ translateX: panelAnim }] }]}
      >
        {/* <Pressable onPress={closePanel} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>Close</Text>
        </Pressable> */}

        {selectedAttraction && (
          <SafeAreaView style={styles.infoContainer}>
            <Text style={styles.title}>{selectedAttraction.name}</Text>
            <Image
              source={{ uri: selectedAttraction.imageUrl }}
              style={styles.image}
            />
            <Text style={styles.description}>
              {selectedAttraction.description}
            </Text>
          </SafeAreaView>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  buttonContainer: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  sidePanel: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    width: SCREEN_WIDTH * 0.7,
    backgroundColor: "#fff",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: -2, height: 0 },
    shadowRadius: 5,
  },
  closeButton: {
    alignSelf: "flex-end",
    padding: 10,
  },
  closeButtonText: {
    fontWeight: "bold",
    fontSize: 16,
    color: "blue",
  },
  infoContainer: {
    padding: 16,
  },
  title: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 8,
  },
  image: {
    width: "100%",
    height: 150,
    marginBottom: 8,
    resizeMode: "cover",
    borderRadius: 8,
  },
  description: {
    fontSize: 14,
    color: "#444",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
  },
  cover: {
    height: 200,
  },
  // description: {
  //   marginVertical: 8,
  // },
});

export default Map;
