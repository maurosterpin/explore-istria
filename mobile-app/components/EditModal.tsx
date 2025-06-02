import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useStore } from "@/app/store/AttractionStore";
import * as ImagePicker from "expo-image-picker";
import DropDownPicker from "react-native-dropdown-picker";
import MultiSelect from "react-native-multiple-select";
import { ALL_CATEGORIES, ALL_CITIES } from "@/app/(tabs)/generate-route";
import { baseApiUrl, cdnApiKey } from "@/constants/Api";
import { router } from "expo-router";
import { Picker } from "@react-native-picker/picker";

export default function EditModal() {
  const {
    openModal,
    setOpenModal,
    modalState,
    modalType,
    editAttraction,
    setEditAttraction,
    editRoute,
    setEditRoute,
    editingRouteAttractions,
    setEditingRouteAttractions,
  } = useStore();

  const [routeTitle, setRouteTitle] = useState("");
  const [routeDescription, setRouteDescription] = useState("");
  const [routeLat, setRouteLat] = useState("");
  const [routeLng, setRouteLng] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string>("");
  const [selectedCities, setSelectedCities] = useState<string>("");
  const handleAddImage = () => {
    if (imageUrlInput.trim().length > 0) {
      setImages((prev) => [...prev, imageUrlInput.trim()]);
      setImageUrlInput("");
    }
  };
  useEffect(() => {
    if (editRoute && modalType === "Route") {
      setRouteTitle(editRoute.name);
      setRouteDescription(editRoute.description);
    } else if (editAttraction && modalType === "Attraction") {
      setRouteTitle(editAttraction.name);
      setRouteDescription(editAttraction.description);
      setRouteLat(editAttraction.lat.toString());
      setRouteLng(editAttraction.lng.toString());
      setImages([editAttraction.imageUrl]);
      setSelectedCategories(editAttraction.category as string);
      setSelectedCities(editAttraction.city as string);
      if (editAttraction.price) setPrice(editAttraction.price.toString());
    } else {
      setRouteTitle("");
      setRouteDescription("");
      setRouteLat("");
      setRouteLng("");
      setImages([]);
      setSelectedCategories("");
      setSelectedCities("");
      setPrice("");
    }
  }, [editAttraction, editRoute]);

  const handleCategoriesChange = (items: any) => {
    setSelectedCategories(items);
  };

  const handleCitiesChange = (items: any) => {
    setSelectedCities(items);
  };
  const [city, setCity] = useState(null);
  const [category, setCategory] = useState(null);
  const [price, setPrice] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  async function createRoute() {
    try {
      const routeData = {
        id: editRoute?.id || 0,
        name: routeTitle,
        description: routeDescription,
        attractionIds: editRoute?.attractions.map(
          (attraction) => attraction.id
        ),
      };

      const response = await fetch(`${baseApiUrl}/routes`, {
        method: modalState === "Edit" ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(routeData),
      });
      if (!response.ok) {
        const errData = await response.json();
        Alert.alert("Error", errData.message || "Failed to create routes");
        return;
      }
      const createdRoute = await response.json();
      if (modalState === "Edit")
        Alert.alert("Success", "Route updated successfully!");
      else Alert.alert("Success", "Route created successfully!");
      setOpenModal(false);
      setRouteTitle("");
      setRouteDescription("");
      setImages([]);
    } catch (error) {
      console.error("postRoute error:", error);
      Alert.alert("Error", "An error occurred while submitting the route.");
    }
  }

  async function createAttraction() {
    try {
      const attractionData = {
        id: editAttraction?.id || 0,
        name: routeTitle,
        description: routeDescription,
        lat: parseFloat(routeLat),
        lng: parseFloat(routeLng),
        imageUrl: images[0],
        rating: 5,
        ratingCount: 1,
        category: selectedCategories,
        price: parseFloat(price),
        city: selectedCities,
      };
      const response = await fetch(`${baseApiUrl}/attraction/add`, {
        method: modalState === "Add" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(attractionData),
      });
      if (!response.ok) {
        const errData = await response.json();
        Alert.alert("Error", errData.message || "Failed to create attraction");
        return;
      }
      const createdAttraction = await response.json();
      if (modalState === "Add")
        Alert.alert("Success", "Attraction created successfully!");
      else Alert.alert("Success", "Attraction updated successfully!");
      setOpenModal(false);
      setRouteTitle("");
      setRouteDescription("");
      setImages([]);
    } catch (error) {
      console.error("Attraction error:", error);
      Alert.alert(
        "Error",
        "An error occurred while submitting the attraction."
      );
    }
  }

  const [imageUrl, setImageUrl] = useState(null);

  const pickImageAndUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsEditing: true,
    });

    if (!result.canceled) {
      const file = result.assets[0];
      const formData = new FormData();
      formData.append("file", {
        uri: file.uri,
        type: "image/jpeg",
        name: "upload.jpg",
      } as any);
      formData.append("upload_preset", "my_preset");
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.EXPO_PUBLIC_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();
      setImageUrl(data.secure_url);
      setImages(() => [data.secure_url]);
    }
  };

  return (
    <Modal
      visible={editingRouteAttractions ? false : openModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => {
        setEditRoute(undefined);
        setEditAttraction(undefined);
        setOpenModal(false);
        setEditingRouteAttractions(false);
      }}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity
            style={styles.closeModalButton}
            onPress={() => {
              setOpenModal(false);
              setEditRoute(undefined);
              setEditAttraction(undefined);
              setEditingRouteAttractions(false);
            }}
          >
            <MaterialCommunityIcons on name="close" size={28} color="#333" />
          </TouchableOpacity>

          <Text style={styles.modalTitle}>
            {modalState} {modalType}
          </Text>

          <Text style={styles.inputLabel}>Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter a title"
            value={routeTitle}
            onChangeText={setRouteTitle}
          />

          <Text style={styles.inputLabel}>Description</Text>
          <TextInput
            style={styles.inputTextArea}
            placeholder="Enter a description"
            value={routeDescription}
            onChangeText={setRouteDescription}
            multiline={true}
            numberOfLines={4}
          />
          {modalType === "Attraction" && (
            <View style={{ display: "flex", flexDirection: "row", gap: 13 }}>
              <View style={{ width: "48%" }}>
                <Text style={styles.inputLabel}>Lat</Text>
                <TextInput
                  style={styles.inputTextArea}
                  placeholder="Enter lat"
                  value={routeLat}
                  onChangeText={setRouteLat}
                  multiline={true}
                  numberOfLines={1}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ width: "48%" }}>
                <Text style={styles.inputLabel}>Lng</Text>
                <TextInput
                  style={styles.inputTextArea}
                  placeholder="Enter lng"
                  value={routeLng}
                  onChangeText={setRouteLng}
                  multiline={true}
                  numberOfLines={1}
                  keyboardType="numeric"
                />
              </View>
            </View>
          )}
          {modalType === "Attraction" && (
            <>
              <Text style={styles.inputLabel}>Add Image</Text>
              <TouchableOpacity
                style={styles.addImageButton}
                onPress={pickImageAndUpload}
              >
                <Text style={{ color: "#fff" }}>
                  Choose {modalType === "Attraction" ? "Image" : "Images"}
                </Text>
              </TouchableOpacity>
            </>
          )}

          {modalType === "Route" && (
            <>
              <Text style={styles.inputLabel}>{modalState} attractions</Text>
              <TouchableOpacity
                style={styles.addImageButton}
                onPress={() => {
                  setEditingRouteAttractions(true);
                  router.replace("/");
                }}
              >
                <Text style={{ color: "#fff" }}>Choose attractions</Text>
              </TouchableOpacity>
            </>
          )}

          {images && images.length > 0 && (
            <ScrollView horizontal style={styles.imagesContainer}>
              {images.map((imgUrl, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image source={{ uri: imgUrl }} style={styles.routeImage} />
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
          {editRoute?.attractions && editRoute.attractions.length > 0 && (
            <ScrollView horizontal style={styles.imagesContainer}>
              {editRoute.attractions.map((attraction, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image
                    source={{ uri: attraction.imageUrl }}
                    style={styles.routeImage}
                  />
                </View>
              ))}
            </ScrollView>
          )}
          {modalType === "Attraction" && (
            <>
              {/* <Text style={styles.inputLabel}>City</Text>
              <MultiSelect
                items={ALL_CITIES}
                uniqueKey="id"
                onSelectedItemsChange={handleCitiesChange}
                selectedItems={selectedCities}
                selectText="Pick City"
                searchInputPlaceholderText="Search Cities..."
                tagRemoveIconColor="#CCC"
                tagBorderColor="#CCC"
                tagTextColor="#333"
                selectedItemTextColor="#1158f1"
                selectedItemIconColor="#1158f1"
                itemTextColor="#000"
                displayKey="name"
                searchInputStyle={{ color: "#1158f1" }}
                submitButtonColor="#1158f1"
                submitButtonText="Done"
                styleDropdownMenu={styles.multiselectDropdown}
              /> */}
              <View style={styles.filterRow}>
                <Text style={styles.filterLabel}>City:</Text>
                <Picker
                  selectedValue={selectedCities}
                  style={styles.picker}
                  onValueChange={handleCitiesChange}
                >
                  <Picker.Item label="All" value={null} />
                  {ALL_CITIES.map((city) => (
                    <Picker.Item
                      key={city.id}
                      label={city.name}
                      value={city.name}
                    />
                  ))}
                </Picker>
              </View>

              {/* <Text style={styles.inputLabel}>Category</Text>
              <MultiSelect
                items={ALL_CATEGORIES}
                uniqueKey="id"
                onSelectedItemsChange={handleCategoriesChange}
                selectedItems={selectedCategories}
                selectText="Pick Category"
                searchInputPlaceholderText="Search Categories..."
                tagRemoveIconColor="#CCC"
                tagBorderColor="#CCC"
                tagTextColor="#333"
                selectedItemTextColor="#1158f1"
                selectedItemIconColor="#1158f1"
                itemTextColor="#000"
                displayKey="name"
                searchInputStyle={{ color: "#1158f1" }}
                submitButtonColor="#1158f1"
                submitButtonText="Done"
                styleDropdownMenu={styles.multiselectDropdown}
              /> */}
              <View style={styles.filterRow}>
                <Text style={styles.filterLabel}>Category:</Text>
                <Picker
                  selectedValue={selectedCategories}
                  style={styles.picker}
                  onValueChange={handleCategoriesChange}
                >
                  <Picker.Item label="All" value={null} />
                  {ALL_CATEGORIES.map((category) => (
                    <Picker.Item
                      key={category.id}
                      label={category.name}
                      value={category.name}
                    />
                  ))}
                </Picker>
              </View>

              <Text style={styles.inputLabel}>Price (€)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter price in euros"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
              />
            </>
          )}

          <TouchableOpacity
            style={styles.submitButton}
            onPress={
              modalType === "Attraction" ? createAttraction : createRoute
            }
          >
            <Text style={styles.submitButtonText}>
              {modalState} {modalType}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

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
  multiselectDropdown: {
    marginBottom: 12,
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
