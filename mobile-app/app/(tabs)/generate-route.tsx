import { baseApiUrl } from "@/constants/Api";
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
} from "react-native";
import MultiSelect from "react-native-multiple-select";
import { useStore } from "../store/AttractionStore";
import { useRouter } from "expo-router";

const ALL_CATEGORIES = [
  { id: "HISTORICAL", name: "HISTORICAL" },
  { id: "CULTURAL", name: "CULTURAL" },
  { id: "NATURAL", name: "NATURAL" },
  { id: "RECREATIONAL", name: "RECREATIONAL" },
  { id: "CULINARY", name: "CULINARY" },
];

const ALL_CITIES = [
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

      const response = await fetch(`${baseApiUrl}/public/generate`, {
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

      <TouchableOpacity
        style={styles.generateButton}
        onPress={handleGenerateRoute}
      >
        <Text style={styles.buttonText}>Generate Route</Text>
      </TouchableOpacity>

      {/* {generatedRoute && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultTitle}>Generated Route:</Text>
          {generatedRoute.map((attraction: any) => (
            <Text key={attraction.id} style={styles.resultItem}>
              {attraction.name} – {attraction.city} ({attraction.category})
            </Text>
          ))}
        </View>
      )} */}
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
});
