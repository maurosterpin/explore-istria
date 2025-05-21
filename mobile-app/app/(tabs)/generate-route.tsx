import { baseApiUrl } from "@/constants/Api";
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
  TextInput,
} from "react-native";
import MultiSelect from "react-native-multiple-select";
import { useStore } from "../store/AttractionStore";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export const ALL_CATEGORIES = [
  { id: "HISTORICAL", name: "HISTORICAL" },
  { id: "CULTURAL", name: "CULTURAL" },
  { id: "NATURAL", name: "NATURAL" },
  { id: "RECREATIONAL", name: "RECREATIONAL" },
  { id: "CULINARY", name: "CULINARY" },
];

export const ALL_CITIES = [
  { id: "Pula", name: "Pula" },
  { id: "Rovinj", name: "Rovinj" },
  { id: "Poreč", name: "Poreč" },
  { id: "Umag", name: "Umag" },
  { id: "Novigrad", name: "Novigrad" },
];

export default function RouteGeneratorScreen() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [findNearMe, setFindNearMe] = useState<boolean>(false);
  const [duration, setDuration] = useState("");
  const [budget, setBudget] = useState("");
  const [transportMode, setTransportMode] = useState<
    "foot-walking" | "driving-car" | "cycling-regular" | "wheelchair"
  >("foot-walking");
  const [generatedRoute, setGeneratedRoute] = useState<any>(null);
  const store = useStore();
  const router = useRouter();

  const handleCategoriesChange = (items: any) => {
    setSelectedCategories(items);
  };

  const handleCitiesChange = (items: any) => {
    setSelectedCities(items);
  };

  const toggleFindNearMe = (value: boolean) => {
    setFindNearMe(value);
    if (value) {
      // setSelectedCities([]);
    }
  };

  const handleGenerateRoute = async () => {
    try {
      const preferences = {
        categories: selectedCategories,
        cities: findNearMe ? [] : selectedCities,
        nearMe: findNearMe,
      };

      const response = await fetch(`${baseApiUrl}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        throw new Error("Failed to generate route");
      }
      const data = await response.json();
      setGeneratedRoute(data);
      store.setSelectedAttractions(data);
      router.replace("/explore");
    } catch (error) {
      console.error("Error generating route:", error);
      Alert.alert("Error", "Could not generate route. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Route Preferences</Text>

      <Text style={styles.label}>Select Categories (optional):</Text>
      <MultiSelect
        items={ALL_CATEGORIES}
        uniqueKey="id"
        onSelectedItemsChange={handleCategoriesChange}
        selectedItems={selectedCategories}
        selectText="Pick Categories"
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

      <View style={styles.switchRow}>
        <Text style={styles.label}>Find attractions near me</Text>
        <Switch value={findNearMe} onValueChange={toggleFindNearMe} />
      </View>

      {!findNearMe && (
        <>
          <Text style={styles.label}>Select Cities (optional):</Text>
          <MultiSelect
            items={ALL_CITIES}
            uniqueKey="id"
            onSelectedItemsChange={handleCitiesChange}
            selectedItems={selectedCities}
            selectText="Pick Cities"
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
        </>
      )}

      <View style={styles.switchRow}>
        <Text style={styles.label}>Only highest rated attractions</Text>
        <Switch value={findNearMe} onValueChange={toggleFindNearMe} />
      </View>

      <Text style={styles.label}>Duration (optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 2h 30m"
        value={duration}
        onChangeText={setDuration}
      />

      <Text style={styles.label}>Budget € (optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 25"
        value={budget}
        onChangeText={setBudget}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Mode of Transport</Text>
      <View style={styles.transportIcons}>
        {[
          { name: "walk", mode: "foot-walking" },
          { name: "car", mode: "driving-car" },
          { name: "bike", mode: "cycling-regular" },
          { name: "wheelchair-accessibility", mode: "wheelchair" },
        ].map((item) => (
          <TouchableOpacity
            key={item.mode}
            onPress={() => setTransportMode(item.mode as typeof transportMode)}
            style={[
              styles.iconButton,
              transportMode === item.mode && styles.selectedIcon,
            ]}
          >
            <MaterialCommunityIcons
              name={item.name as any}
              size={28}
              color={transportMode === item.mode ? "#118cf1" : "#555"}
            />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.generateButton}
        onPress={handleGenerateRoute}
      >
        <Text style={styles.buttonText}>Generate Route</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingBottom: 40,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 4,
  },
  multiselectDropdown: {
    marginBottom: 12,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  generateButton: {
    backgroundColor: "#118cf1",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
  },
  resultsContainer: {
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingTop: 10,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  resultItem: {
    fontSize: 14,
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#f2f2f2",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  transportIcons: {
    flexDirection: "row",
    marginTop: 8,
  },
  iconButton: {
    padding: 10,
    marginRight: 12,
    borderRadius: 8,
    backgroundColor: "#eee",
  },
  selectedIcon: {
    backgroundColor: "#d0e8ff",
  },
});
