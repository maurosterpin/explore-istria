import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  Switch,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { baseApiUrl } from "@/constants/Api";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { useStore } from "../store/AttractionStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Rating } from "react-native-ratings";
import { Card, IconButton } from "react-native-paper";

type RoutePlan = {
  id: number;
  name: string;
  city: string;
  category: string;
  description: string;
  upvotes: number;
  commentCount: number;
  attractionIds: string;
  userId: number;
  images: string[];
};

type RouteComment = {
  id: number;
  username?: string;
  rating: number;
  comment: string;
  createdAt?: string;
};

const sortOptions = ["Highest Rated", "Latest"];
export const ALL_CITIES = [
  "Pula",
  "Rovinj",
  "Poreč",
  "Umag",
  "Novigrad",
  "Labin",
  "Buzet",
  "Buje",
  "Vodnjan",
  "Pazin",
  //"Bale",
  "Barban",
  "Brtonigla",
  "Cerovlje",
  "Fažana",
  "Funtana",
  "Gračišće",
  "Grožnjan",
  "Kanfanar",
  "Karojba",
  "Kaštelir-Labinci",
  "Kršan",
  "Lanišće",
  "Ližnjan",
  "Lupoglav",
  "Marčana",
  "Medulin",
  "Motovun",
  "Oprtalj",
  "Pićan",
  "Raša",
  "Sveta Nedelja",
  "Sveti Lovreč",
  "Sveti Petar u Šumi",
  "Svetvinčenat",
  "Tar-Vabriga",
  "Tinjan",
  "Višnjan",
  "Vižinada",
  "Vrsar",
  "Žminj",
];
const ALL_CATEGORIES = [
  "Historical",
  "Cultural",
  "Natural",
  "Recreational",
  "Culinary",
];

export default function RoutesPage() {
  const [routes, setRoutes] = useState<RoutePlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSort, setSelectedSort] = useState("Latest");
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("official");
  const [isDisabled, setIsDisabled] = useState(false);

  const router = useRouter();
  const store = useStore();
  const { userId, username, userUpvotedRoutes, setUserUpvotedRoutes } = store;

  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<RoutePlan | null>(null);
  const [comments, setComments] = useState<RouteComment[]>([]);
  const [newComment, setNewComment] = useState("");

  const [fullScreenVisible, setFullScreenVisible] = useState(false);
  const [fullScreenImages, setFullScreenImages] = useState<string[]>([]);
  const [initialImageIndex, setInitialImageIndex] = useState<number>(0);
  const [rating, setRating] = useState<number>(0);

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      let query = "";
      if (selectedSort) query += `sortBy=${selectedSort.toLowerCase()}&`;
      if (selectedCity) query += `city=${selectedCity}&`;
      if (selectedCategory) query += `category=${selectedCategory}&`;

      const response = await fetch(`${baseApiUrl}/routes?${query}`);
      const data = await response.json();
      console.log("fetched routes:", data);
      setRoutes(data);
    } catch (error) {
      console.error("Error fetching routes:", error);
    } finally {
      setLoading(false);
    }
  };

  const STORAGE_KEY = "rating_list";

  useEffect(() => {
    if (!showCommentsModal || !store.openModal) fetchRoutes();
  }, [
    selectedSort,
    selectedCity,
    selectedCategory,
    showCommentsModal,
    store.openModal,
  ]);

  const useRoute = async (attractionIds: string) => {
    console.log("Using route with attractionIds:", attractionIds);
    try {
      const response = await fetch(`${baseApiUrl}/use`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: attractionIds,
      });
      if (response.ok) {
        const data = await response.json();
        store.setSelectedAttractions(data);
        router.replace("/explore");
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.message || "Failed to use route");
      }
    } catch (error) {
      console.error("Failed to use route:", error);
      Alert.alert("Error", "An error occurred. Please try again later.");
    }
  };

  const saveIdList = async (list: number[]) => {
    try {
      const jsonValue = JSON.stringify(list);
      await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    } catch (e) {
      console.error("Error saving rating list", e);
    }
  };

  const loadIdList = async () => {
    try {
      console.log("loading list...");
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      const res = jsonValue != null ? JSON.parse(jsonValue) : [];
      console.log("res", res);
      return res;
    } catch (e) {
      console.error("Error loading rating list", e);
      return [];
    }
  };

  const checkIfIdExists = async (id: number) => {
    await isIdInList(id);
  };

  const addIdToList = async (id: number) => {
    const list = await loadIdList();
    if (!list.includes(id)) {
      list.push(id);
      await saveIdList(list);
    }
  };

  const isIdInList = async (id: number) => {
    const list = await loadIdList();
    console.log("list", list);
    const exists = list.includes(id);
    console.log("exists", exists);
    setIsDisabled(exists);
  };

  const handleUpvote = async (routeItem: RoutePlan) => {
    if (!userId) {
      Alert.alert("Login Required", "You must be signed in to upvote a route.");
      return;
    }
    const token = await AsyncStorage.getItem("jwtToken");
    if (!token) {
      throw new Error("No token found");
    }
    try {
      const response = await fetch(
        `${baseApiUrl}/routes/upvote/${routeItem.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId }),
        }
      );
      if (response.ok) {
        const updatedRoute = await response.json();
        setRoutes((prev) =>
          prev.map((r) =>
            r.id === updatedRoute.routePlan.id ? updatedRoute.routePlan : r
          )
        );
        setUserUpvotedRoutes(updatedRoute.userUpvotes);
      } else {
        const errData = await response.json();
        Alert.alert("Upvote Error", errData.message || "Failed to upvote.");
      }
    } catch (error) {
      console.error("Upvote error:", error);
      Alert.alert("Error", "An error occurred while upvoting.");
    }
  };

  const fetchAttractionsByIds = async (
    ids: Number[],
    editingRoute?: boolean
  ) => {
    try {
      const response = await fetch(`${baseApiUrl}/getByIds?ids=${ids}`);
      const data = await response.json();
      if (!editingRoute) store.setRouteAttractions(data);
      return data;
    } catch (error) {
      console.error("Error fetching route attractions:", error);
    }
  };

  async function handleUnvote(routeItem: RoutePlan) {
    if (!userId) {
      Alert.alert("Login Required", "You must be signed in to unvote a route.");
      return;
    }

    const token = await AsyncStorage.getItem("jwtToken");
    if (!token) {
      Alert.alert("Error", "No token found. Please log in again.");
      return;
    }

    try {
      const response = await fetch(
        `${baseApiUrl}/routes/unvote/${routeItem.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId }),
        }
      );

      if (response.ok) {
        const updatedRoute = await response.json();

        setRoutes((prevRoutes) =>
          prevRoutes.map((r) =>
            r.id === updatedRoute.routePlan.id ? updatedRoute.routePlan : r
          )
        );
        setUserUpvotedRoutes(updatedRoute.userUpvotes);
      } else {
        const errData = await response.json();
        Alert.alert("Unvote Error", errData.message || "Failed to unvote.");
      }
    } catch (error) {
      console.error("Unvote error:", error);
      Alert.alert("Error", "An error occurred while removing your upvote.");
    }
  }

  const openComments = async (routeItem: RoutePlan) => {
    setSelectedRoute(routeItem);
    setShowCommentsModal(true);
    setComments([]);
    setNewComment("");
    await checkIfIdExists(routeItem.id);

    try {
      const response = await fetch(
        `${baseApiUrl}/routes/comment/${routeItem.id}`
      );
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error("Fetch comments error:", error);
    }
  };

  function openFullScreenImages(images: string[], index: number) {
    setFullScreenImages(images);
    setInitialImageIndex(index);
    setFullScreenVisible(true);
  }

  const postComment = async () => {
    // if (!userId) {
    //   Alert.alert("Login Required", "You must be signed in to comment.");
    //   return;
    // }
    if (!selectedRoute) return;
    // const token = await AsyncStorage.getItem("jwtToken");
    // if (!token) {
    //   throw new Error("No token found");
    // }
    try {
      console.log("body", JSON.stringify({ comment: newComment, rating }));
      const response = await fetch(
        `${baseApiUrl}/routes/comment/${selectedRoute.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ comment: newComment, rating }),
        }
      );
      console.log("response", response);
      if (response.ok) {
        const createdComment = await response.json();
        setComments((prev) => [...prev, createdComment]);
        addIdToList(selectedRoute.id);
        setNewComment("");
        setRating(0);
        setIsDisabled(true);
      } else {
        const errData = await response.json();
        Alert.alert(
          "Comment Error",
          errData.message || "Failed to post comment."
        );
      }
    } catch (error) {
      console.error("Comment post error:", error);
      Alert.alert("Error", "An error occurred while posting comment.");
    }
  };

  const renderRouteCard = ({ item }: { item: RoutePlan }) => {
    const isUpvoted = userUpvotedRoutes?.includes(item.id);
    return (
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <IconButton
          style={{
            position: "absolute",
            right: -10,
            top: -10,
            display: store.userId ? undefined : "none",
          }}
          icon="pencil"
          onPress={async () => {
            const attractions: Attraction[] = await fetchAttractionsByIds(
              item.attractionIds.split(",").map((s) => Number(s.trim())),
              true
            );
            store.setEditRoute({
              id: item.id,
              name: item.name,
              description: item.description,
              attractions,
            } as Route);
            store.setModalType("Route");
            store.setModalState("Edit");
            store.setOpenModal(true);
          }}
        />
        <Text style={styles.cardMeta}>
          {item.city} •{" "}
          {item.category
            .split(",")
            .map(
              (word) =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            )
            .join(", ")}
        </Text>
        <Text style={styles.cardDescription}>{item.description}</Text>
        <TouchableOpacity
          style={styles.viewAttractionsButton}
          onPress={async () => {
            const attractions: Attraction[] = await fetchAttractionsByIds(
              item.attractionIds.split(",").map((s) => Number(s.trim()))
            );
            store.setRouteAttractions(attractions);
            router.push("/");
          }}
        >
          <Text style={styles.viewAttractionsButtonText}>View Attractions</Text>
        </TouchableOpacity>

        {item.images && item.images.length > 0 && (
          <ScrollView horizontal style={styles.imagesContainer}>
            {item.images.map((imgUrl, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => openFullScreenImages(item.images!, index)}
              >
                <Image source={{ uri: imgUrl }} style={styles.routeImage} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View style={styles.cardActions}>
          {/* <TouchableOpacity
            style={styles.actionButton}
            onPress={
              isUpvoted ? () => handleUnvote(item) : () => handleUpvote(item)
            }
          >
            <Ionicons
              name={isUpvoted ? "thumbs-up" : "thumbs-up-outline"}
              size={20}
              color="#1158f1"
            />
            <Text style={styles.actionText}>{item.upvotes}</Text>
          </TouchableOpacity> */}

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => openComments(item)}
          >
            <Ionicons name="star-outline" size={20} color="#1158f1" />
            <Text style={styles.actionText}>{item.commentCount || 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => useRoute(item.attractionIds)}
            style={styles.useRouteButton}
          >
            <Text style={styles.useRouteText}>Use Route</Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.filterBar}>
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Sort:</Text>
          <Picker
            selectedValue={selectedSort}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedSort(itemValue)}
          >
            {sortOptions.map((option) => (
              <Picker.Item key={option} label={option} value={option} />
            ))}
          </Picker>
        </View>

        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>City:</Text>
          <Picker
            selectedValue={selectedCity}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedCity(itemValue)}
          >
            <Picker.Item label="All" value={null} />
            {ALL_CITIES.map((city) => (
              <Picker.Item key={city} label={city} value={city} />
            ))}
          </Picker>
        </View>

        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Category:</Text>
          <Picker
            selectedValue={selectedCategory}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedCategory(itemValue)}
          >
            <Picker.Item label="All" value={null} />
            {ALL_CATEGORIES.map((cat) => (
              <Picker.Item key={cat} label={cat} value={cat} />
            ))}
          </Picker>
        </View>
      </View>

      {/* <View style={styles.tabRow}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "official" && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab("official")}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === "official" && styles.tabButtonTextActive,
            ]}
          >
            Official Routes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "user" && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab("user")}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === "user" && styles.tabButtonTextActive,
            ]}
          >
            User Routes
          </Text>
        </TouchableOpacity>
      </View> */}

      {loading && routes.length < 1 ? (
        <ActivityIndicator
          style={{ marginTop: 20 }}
          size="large"
          color="#1158f1"
        />
      ) : (
        <FlatList
          data={routes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderRouteCard}
          contentContainerStyle={styles.list}
        />
      )}

      {fullScreenVisible && (
        <Modal
          transparent={false}
          animationType="slide"
          onRequestClose={() => setFullScreenVisible(false)}
        >
          <View style={styles.fullScreenContainer}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setFullScreenVisible(false)}
            >
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>

            <ScrollView
              horizontal
              pagingEnabled
              style={{ flex: 1 }}
              contentOffset={{ x: initialImageIndex * 300, y: 0 }}
            >
              {fullScreenImages.map((imgUrl, i) => (
                <View key={i} style={styles.imagePage}>
                  <Image
                    source={{ uri: imgUrl }}
                    style={styles.fullScreenImage}
                    resizeMode="contain"
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        </Modal>
      )}

      {showCommentsModal && selectedRoute && (
        <Modal
          visible={showCommentsModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => {
            setShowCommentsModal(false);
            setRating(0);
            setNewComment("");
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <View style={styles.handleBar} />

              <Text style={styles.modalTitle}>
                {selectedRoute.name} Ratings
              </Text>

              <TouchableOpacity
                style={styles.closeModalButton}
                onPress={() => {
                  setShowCommentsModal(false);
                  setRating(0);
                  setNewComment("");
                }}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>

              <ScrollView style={styles.commentsList}>
                {comments.map((c) => (
                  <View key={c.id} style={styles.commentItem}>
                    <Rating
                      type="star"
                      // ratingCount={c.rating}
                      imageSize={20}
                      startingValue={c.rating}
                      style={{
                        paddingBottom: 5,
                        alignSelf: "flex-start",
                        backgroundColor: "transparent",
                      }}
                      readonly
                    />
                    {/* <Text style={styles.commentUsername}>{c.username}</Text> */}
                    <Text style={styles.commentText}>{c.comment}</Text>
                  </View>
                ))}
              </ScrollView>

              <View style={styles.addCommentContainer}>
                <View
                  style={{
                    display: "flex",
                    paddingRight: 7,
                    width: "83%",
                    paddingTop: 30,
                  }}
                >
                  <Rating
                    type="custom"
                    ratingCount={5}
                    imageSize={30}
                    startingValue={rating}
                    style={{
                      paddingBottom: 10,
                      alignSelf: "flex-start",
                    }}
                    onFinishRating={(val: any) => setRating(val)}
                  />
                  <TextInput
                    style={styles.commentInput}
                    placeholder="Write a comment..."
                    value={newComment}
                    onChangeText={setNewComment}
                  />
                </View>
                <TouchableOpacity
                  style={{
                    backgroundColor: "#118cf1",
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                    borderRadius: 6,
                    opacity: isDisabled ? 0.5 : 1,
                  }}
                  onPress={postComment}
                  disabled={isDisabled}
                >
                  <Text style={styles.postButtonText}>Rate</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const SCREEN_WIDTH = Dimensions.get("window").width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  filterBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f9f9f9",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginBottom: 15,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  filterLabel: {
    fontSize: 16,
    marginRight: 8,
  },
  picker: {
    flex: 1,
  },
  list: {
    padding: 10,
    paddingTop: 0,
  },
  card: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  cardMeta: {
    fontSize: 14,
    color: "#555",
    marginVertical: 4,
  },
  cardDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionText: {
    marginLeft: 4,
    fontSize: 14,
  },
  useRouteButton: {
    backgroundColor: "#1158f1",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  useRouteText: {
    color: "#fff",
    fontSize: 14,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "white",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 16,
    height: "70%",
  },
  handleBar: {
    width: 50,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 2.5,
    alignSelf: "center",
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#333",
  },
  closeModalButton: {
    position: "absolute",
    top: 16,
    right: 16,
  },
  viewAttractionsButton: {
    borderColor: "#118cf1",
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
    marginVertical: 5,
  },
  viewAttractionsButtonText: {
    color: "#118cf1",
    fontSize: 14,
    fontWeight: "500",
  },
  commentsList: {
    flex: 1,
    marginTop: 10,
  },
  commentItem: {
    backgroundColor: "#ffffff",
    padding: 10,
    borderRadius: 6,
    marginBottom: 8,
    boxShadow: "black",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    margin: 5,
  },
  commentUsername: {
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
  },
  commentText: {
    fontSize: 14,
    color: "#444",
  },
  addCommentContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginRight: 8,
    minHeight: 40,
  },
  postButton: {
    backgroundColor: "#118cf1",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  postButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  tabRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 6,
    marginRight: 6,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#eee",
    marginHorizontal: 4,
    alignItems: "center",
  },
  tabButtonActive: {
    backgroundColor: "#1158f1",
  },
  tabButtonText: {
    fontSize: 16,
    color: "#333",
  },
  tabButtonTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
  imagesContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  routeImage: {
    width: 120,
    height: 90,
    marginRight: 8,
    borderRadius: 6,
    resizeMode: "cover",
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 2,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  imagePage: {
    width: SCREEN_WIDTH,
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenImage: {
    width: SCREEN_WIDTH,
    height: "100%",
  },
});
