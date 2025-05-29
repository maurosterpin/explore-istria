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

export default function EditModal() {
  const [routeTitle, setRouteTitle] = useState("");
  const [routeDescription, setRouteDescription] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const handleAddImage = () => {
    if (imageUrlInput.trim().length > 0) {
      setImages((prev) => [...prev, imageUrlInput.trim()]);
      setImageUrlInput("");
    }
  };
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
  const [dropdownItems, setDropdownItems] = useState([
    { label: "Museum", value: "museum" },
    { label: "Park", value: "park" },
    { label: "Historic", value: "historic" },
  ]);
  const [cityItems, setCityItems] = useState([
    { label: "Pula", value: "Pula" },
    { label: "Porec", value: "Porec" },
    { label: "Rovinj", value: "Rovinj" },
  ]);
  const { openModal, setOpenModal, modalState, modalType } = useStore();

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  async function createRoute() {
    try {
      const routeData = {
        name: routeTitle,
        description: routeDescription,
        images: images,
      };

      const response = await fetch("todo/routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(routeData),
      });
      if (!response.ok) {
        const errData = await response.json();
        Alert.alert("Error", errData.message || "Failed to create route");
        return;
      }
      const createdRoute = await response.json();
      Alert.alert("Success", "Route created successfully!");
      setOpenModal(false);
      setRouteTitle("");
      setRouteDescription("");
      setImages([]);
    } catch (error) {
      console.error("postRoute error:", error);
      Alert.alert("Error", "An error occurred while submitting the route.");
    }
  }

  return (
    <Modal
      visible={openModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setOpenModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity
            style={styles.closeModalButton}
            onPress={() => setOpenModal(false)}
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
          <View style={{ display: "flex", flexDirection: "row", gap: 13 }}>
            <View style={{ width: "48%" }}>
              <Text style={styles.inputLabel}>Lat</Text>
              <TextInput
                style={styles.inputTextArea}
                placeholder="Enter lat"
                value={routeDescription}
                onChangeText={setRouteDescription}
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
                value={routeDescription}
                onChangeText={setRouteDescription}
                multiline={true}
                numberOfLines={1}
                keyboardType="numeric"
              />
            </View>
          </View>
          <Text style={styles.inputLabel}>Add Image</Text>
          <TouchableOpacity
            style={styles.addImageButton}
            onPress={async () => {
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.7,
              });
              if (!result.canceled && result.assets.length > 0) {
                setImages((prev) => [...prev, result.assets[0].uri]);
              }
            }}
          >
            <Text style={{ color: "#fff" }}>Choose Images</Text>
          </TouchableOpacity>

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

          <Text style={styles.inputLabel}>City</Text>
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
          />

          <Text style={styles.inputLabel}>Category</Text>
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
          />

          <Text style={styles.inputLabel}>Price (€)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter price in euros"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />

          <TouchableOpacity style={styles.submitButton} onPress={createRoute}>
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
