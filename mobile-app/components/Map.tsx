import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  Alert,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
} from "react-native";
import MapView, { Marker, Polyline, Region } from "react-native-maps";
import polyline from "@mapbox/polyline";
import * as Location from "expo-location";
import { useStore } from "@/app/store/AttractionStore";
import Entypo from "@expo/vector-icons/Entypo";
import { Rating } from "react-native-ratings";
import { baseApiUrl } from "@/constants/Api";
import { FAB } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import RateModal from "./RateModal";
import { loadIdList } from "@/utils/AttractionRating";

const SCREEN_WIDTH = Dimensions.get("window").width;

const Map = () => {
  const [route, setRoute] = useState<Attraction[]>([]);
  const [roadRoute, setRoadRoute] = useState<any>([]);
  const [initialRegion, setInitialRegion] = useState<Region | null>(null);
  const [useMyLocation, setUseMyLocation] = useState<any>(false);
  const {
    selectedAttractions,
    setUserLat,
    setUserLng,
    travelMode,
    setTravelMode,
  } = useStore();
  const [userLocation, setUserLocation] =
    useState<Location.LocationObjectCoords | null>(null);
  const [heading, setHeading] = useState<number>(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [postModalVisible, setPostModalVisible] = useState(false);
  const mapRef = useRef<MapView>(null);
  const zoomIn = () => {
    console.log("zooming in", initialRegion, mapRef?.current);
    if (mapRef?.current && initialRegion) {
      mapRef.current.animateToRegion(initialRegion, 1000);
    }
  };
  const [routeTitle, setRouteTitle] = useState("");
  const [routeDescription, setRouteDescription] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [showRatingModal, setShowRatingModal] = useState<boolean | undefined>(
    false
  );
  const [currentAttractionToRate, setCurrentAttractionToRate] =
    useState<Attraction | null>(null);

  const watchLocSub = useRef<any>(null);
  const watchHeadSub = useRef<any>(null);
  const [isDisabled, setIsDisabled] = useState(false);

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
    setUserLat(userLocation?.latitude);
    setUserLng(userLocation?.longitude);
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
  }, [userLocation, selectedAttractions, travelMode]);

  const isIdInList = async (id: number) => {
    const list = await loadIdList();
    console.log("list", list);
    const exists = list.includes(id);
    console.log("exists", exists);
    setIsDisabled(exists);
  };

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

  useEffect(() => {
    zoomIn();
  }, [initialRegion]);

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
            latitudeDelta: 0.025,
            longitudeDelta: 0.025,
          });
        }
        return data;
      } catch (error) {
        console.error("Error fetching route:", error);
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
          `https://api.openrouteservice.org/v2/directions/${travelMode}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: apiKey!!,
            },
            body: JSON.stringify({
              coordinates,
              preference: "shortest",
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

    isIdInList(attraction.id);

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
    setIsDisabled(true);
  }, []);

  const handleRating = async (attractionId: number, rating: number) => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) {
        throw new Error("No token found");
      }
      const response = await fetch(`${baseApiUrl}/attraction/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ attractionId, rating }),
      });
      if (response.ok) {
        Alert.alert("Thank you", "Your rating has been submitted.");
      } else {
        Alert.alert("Error", "Could not submit rating.");
      }
    } catch (error) {
      console.error("Rating error:", error);
      Alert.alert("Error", "An error occurred while submitting rating.");
    }
  };

  async function postRoute() {
    try {
      const routeData = {
        name: routeTitle,
        description: routeDescription,
        images: images,
      };

      const response = await fetch("YOUR_BACKEND_URL/routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(routeData),
      });
      if (!response.ok) {
        const errData = await response.json();
        Alert.alert("Error", errData.message || "Failed to post route");
        return;
      }
      const createdRoute = await response.json();
      Alert.alert("Success", "Route posted successfully!");
      setPostModalVisible(false);
      setRouteTitle("");
      setRouteDescription("");
      setImages([]);
    } catch (error) {
      console.error("postRoute error:", error);
      Alert.alert("Error", "An error occurred while posting the route.");
    }
  }

  // function to add an image URL to the array
  const handleAddImage = () => {
    if (imageUrlInput.trim().length > 0) {
      setImages((prev) => [...prev, imageUrlInput.trim()]);
      setImageUrlInput("");
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

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
        ref={mapRef}
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
              backgroundColor: "#c6d8ff",
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

      {/* <View style={styles.postButtonContainer}>
        <TouchableOpacity
          style={styles.postButton}
          onPress={() => {
            if (!userId) {
              Alert.alert(
                "Login Required",
                "You must be logged in to share a route."
              );
            } else setPostModalVisible(true);
          }}
        >
          <MaterialCommunityIcons
            name="share"
            size={28}
            color="#fff"
            style={styles.icon}
          />
        </TouchableOpacity>
      </View> */}

      <Modal
        visible={postModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPostModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setPostModalVisible(false)}
            >
              <MaterialCommunityIcons on name="close" size={28} color="#333" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Share current Route</Text>

            <ScrollView style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Route Title</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter a route title"
                value={routeTitle}
                onChangeText={setRouteTitle}
              />

              <Text style={styles.inputLabel}>Route Description</Text>
              <TextInput
                style={styles.inputTextArea}
                placeholder="Describe this route"
                value={routeDescription}
                onChangeText={setRouteDescription}
                multiline={true}
                numberOfLines={4}
              />

              <Text style={styles.inputLabel}>Add Image URL</Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <TextInput
                  style={[styles.input, { flex: 1, marginRight: 8 }]}
                  placeholder="https://example.com/image.jpg"
                  value={imageUrlInput}
                  onChangeText={setImageUrlInput}
                />
                <TouchableOpacity
                  style={styles.addImageButton}
                  onPress={handleAddImage}
                >
                  <Text style={{ color: "#fff" }}>Add</Text>
                </TouchableOpacity>
              </View>

              {images && images.length > 0 && (
                <ScrollView horizontal style={styles.imagesContainer}>
                  {images.map((imgUrl, index) => (
                    <View key={index} style={styles.imageWrapper}>
                      <Image
                        source={{ uri: imgUrl }}
                        style={styles.routeImage}
                      />
                      <TouchableOpacity
                        style={styles.removeIconContainer}
                        onPress={() => removeImage(index)}
                      >
                        <MaterialCommunityIcons
                          name="close-circle"
                          size={20}
                          color="red"
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}
            </ScrollView>

            <TouchableOpacity style={styles.submitButton} onPress={postRoute}>
              <Text style={styles.submitButtonText}>Share Route</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {selectedAttraction?.id && (
        <RateModal
          attractionId={selectedAttraction.id}
          isModalVisible={showRatingModal || undefined}
          setModalVisible={(val: boolean | undefined) =>
            setShowRatingModal(val)
          }
          setDisabled={setIsDisabled}
        />
      )}
      <Animated.View
        style={[styles.sidePanel, { transform: [{ translateX: panelAnim }] }]}
      >
        {/* <Pressable onPress={closePanel} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>Close</Text>
        </Pressable> */}

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
            {selectedAttraction?.price !== null &&
              selectedAttraction?.price !== null && (
                <Text style={styles.rating}>
                  Price: {`${selectedAttraction?.price}`}€
                </Text>
              )}
            {
              <>
                <Text style={styles.rating}>Rating:</Text>
                <Rating
                  type="star"
                  ratingCount={5}
                  imageSize={30}
                  startingValue={selectedAttraction.rating || 5}
                  style={{ paddingVertical: 10, alignSelf: "flex-start" }}
                  readonly
                />
              </>
            }
            {!isDisabled && (
              <TouchableOpacity
                onPress={() => setShowRatingModal(true)}
                style={[styles.rateButton, { marginTop: 12 }]}
              >
                <Text style={styles.rateButtonText}>Rate this attraction</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </Animated.View>
      <View style={styles.modeIconsContainer}>
        <TouchableOpacity onPress={() => setTravelMode("foot-walking")}>
          <MaterialCommunityIcons
            name="walk"
            size={30}
            color={travelMode === "foot-walking" ? "#118cf1" : "#444"}
            style={styles.iconButton}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setTravelMode("driving-car")}>
          <MaterialCommunityIcons
            name="car"
            size={30}
            color={travelMode === "driving-car" ? "#118cf1" : "#444"}
            style={styles.iconButton}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setTravelMode("cycling-regular")}>
          <MaterialCommunityIcons
            name="bike"
            size={30}
            color={travelMode === "cycling-regular" ? "#118cf1" : "#444"}
            style={styles.iconButton}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setTravelMode("wheelchair")}>
          <MaterialCommunityIcons
            name="wheelchair-accessibility"
            size={30}
            color={travelMode === "wheelchair" ? "#118cf1" : "#444"}
            style={styles.iconButton}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  modeIconsContainer: {
    position: "absolute",
    top: 60,
    left: 10,
    flexDirection: "column",
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 8,
    padding: 8,
    zIndex: 999,
  },
  iconButton: {
    marginVertical: 6,
  },
  imageWrapper: {
    position: "relative",
    marginRight: 8,
  },
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
    zIndex: 1000,
  },
  routeImage: {
    width: 120,
    height: 90,
    marginRight: 8,
    borderRadius: 6,
    resizeMode: "cover",
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
  removeIconContainer: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 10,
  },
  infoContainer: {
    padding: 16,
    display: "flex",
  },
  title: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 8,
  },
  icon: {
    alignSelf: "center",
  },
  rating: {
    fontWeight: "bold",
    fontSize: 14,
    marginTop: 8,
  },
  imagesContainer: {
    marginTop: 8,
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
  postRouteIconContainer: {
    position: "absolute",
    top: 60,
    right: 10,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 8,
    padding: 8,
    zIndex: 999,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    height: "85%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  closeModalButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 2000,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  inputLabel: {
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#f2f2f2",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    marginBottom: 4,
  },
  inputTextArea: {
    backgroundColor: "#f2f2f2",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    marginBottom: 4,
  },
  addImageButton: {
    backgroundColor: "#118cf1",
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  rateButton: {
    borderColor: "#118cf1",
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  rateButtonText: {
    color: "#118cf1",
    fontSize: 14,
    fontWeight: "500",
  },
  submitButton: {
    backgroundColor: "#118cf1",
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  postButtonContainer: {
    position: "absolute",
    top: 60,
    right: 10,
    zIndex: 999,
  },
  postButton: {
    backgroundColor: "#2a8fe2",
    borderRadius: 5,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default Map;
