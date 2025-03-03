import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  Pressable,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import polyline from "@mapbox/polyline";
import * as Location from "expo-location";
import { useStore } from "@/app/store/AttractionStore";

const SCREEN_WIDTH = Dimensions.get("window").width;

const ORS_API_KEY = "HIDDEN";

const Map = () => {
  const [route, setRoute] = useState<Attraction[]>([]);
  const [roadRoute, setRoadRoute] = useState<any>([]);
  const [initialRegion, setInitialRegion] = useState<InitialRegion | null>(
    null
  );
  const [useMyLocation, setUseMyLocation] = useState<any>(false);
  const { selectedAttractions } = useStore();
  useEffect(() => {
    generateRoute();
  }, [selectedAttractions]);

  const generateRoute = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") setUseMyLocation(true);
      const data = await fetchRoute();
      await fetchRoadRoute(data);
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  };

  const fetchRoute = async () => {
    try {
      const response = await fetch("http://10.0.2.2:8080/route", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(selectedAttractions),
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
  };

  const fetchRoadRoute = async (nodes: any) => {
    const coordinates = nodes.map((node: any) => [node.lng, node.lat]);

    try {
      const response = await fetch(
        "https://api.openrouteservice.org/v2/directions/foot-walking",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: ORS_API_KEY,
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
    }
  };

  const [selectedAttraction, setSelectedAttraction] =
    useState<Attraction | null>(null);

  const panelAnim = useRef(new Animated.Value(SCREEN_WIDTH * 0.7)).current;

  const openPanel = (attraction: any) => {
    setSelectedAttraction(attraction);

    Animated.timing(panelAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const closePanel = () => {
    Animated.timing(panelAnim, {
      toValue: SCREEN_WIDTH * 0.7,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setSelectedAttraction(null);
    });
  };

  // if (selectedAttractions.length < 1) {
  //   return (
  //     <View style={styles.loadingContainer}>
  //       <Text>No attractions selected</Text>
  //     </View>
  //   );
  // }

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
        style={StyleSheet.absoluteFillObject}
        initialRegion={initialRegion}
        showsUserLocation={useMyLocation}
        showsMyLocationButton={useMyLocation}
      >
        {route.map((attraction) => (
          <Marker
            key={attraction.id}
            coordinate={{
              latitude: attraction.lat,
              longitude: attraction.lng,
            }}
            onPress={() => openPanel(attraction)}
          />
        ))}

        {roadRoute.length > 1 && (
          <Polyline
            coordinates={roadRoute}
            strokeColor="#0000FF"
            strokeWidth={4}
          />
        )}
      </MapView>

      <Animated.View
        style={[styles.sidePanel, { transform: [{ translateX: panelAnim }] }]}
      >
        <Pressable onPress={closePanel} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>Close</Text>
        </Pressable>

        {selectedAttraction && (
          <View style={styles.infoContainer}>
            <Text style={styles.title}>{selectedAttraction.name}</Text>
            <Image
              source={{ uri: selectedAttraction.imageUrl }}
              style={styles.image}
            />
            <Text style={styles.description}>
              {selectedAttraction.description}
            </Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },

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
});

export default Map;
