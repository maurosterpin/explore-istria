import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Switch,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useStore } from "../store/AttractionStore";
import { baseApiUrl } from "@/constants/Api";
import AttractionCard from "@/components/AttractionCard";
import { Picker } from "@react-native-picker/picker";
import { router, useFocusEffect } from "expo-router";
import { ALL_CITIES } from "./routes";

const AttractionsPage = () => {
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const {
    routeAttractions,
    setRouteAttractions,
    userId,
    selectedAttractions,
    setSelectedAttractions,
    selectedCategory,
    setSelectedCategory,
    selectedCity,
    setSelectedCity,
    editRoute,
    setEditRoute,
    editingRouteAttractions,
    setEditingRouteAttractions,
    modalState,
  } = useStore();
  const [showOnlySelected, setShowOnlySelected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setRouteAttractions([]);
      };
    }, [])
  );

  useEffect(() => {
    if (modalState === "Edit" && editRoute) {
      setSelectedCategory(null);
      setSelectedCity(null);
      setShowOnlySelected(true);
    }
  }, []);

  useEffect(() => {
    fetchAttractions();
  }, [selectedCategory, selectedCity]);

  const fetchAttractions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${baseApiUrl}/get?${
          selectedCategory ? `category=${selectedCategory}` : ""
        }${selectedCity ? `&city=${selectedCity}` : ""}`
      );
      const data = await response.json();
      setAttractions(data);
      return data;
    } catch (error) {
      console.error("Error fetching attraction:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRoute = (attraction: Attraction) => {
    if (
      selectedAttractions.find((item: Attraction) => item.id === attraction.id)
    ) {
      setSelectedAttractions(
        selectedAttractions.filter(
          (item: Attraction) => item.id !== attraction.id
        )
      );
    } else {
      setSelectedAttractions([...selectedAttractions, attraction]);
    }
  };

  const editRouteAttractions = (attraction: Attraction) => {
    if (editRoute?.attractions.length) {
      if (
        editRoute.attractions.find(
          (item: Attraction) => item.id === attraction.id
        )
      ) {
        setEditRoute({
          ...editRoute,
          attractions: editRoute?.attractions.filter(
            (item: Attraction) => item.id !== attraction.id
          ),
        });
      } else {
        setEditRoute({
          ...editRoute,
          attractions: [...editRoute?.attractions, attraction],
        });
      }
    } else if (editRoute) {
      setEditRoute({
        ...editRoute,
        attractions: [...editRoute?.attractions, attraction],
      });
    }
  };

  const renderItem = ({ item }: any) => (
    <AttractionCard
      key={item.id}
      id={item.id}
      title={item.name}
      description={item.description}
      image={item.imageUrl}
      lat={item.lat}
      lng={item.lng}
      inRoute={
        editRoute
          ? editRoute.attractions.find((a) => a.id === item.id)
          : selectedAttractions.find((a) => a.id === item.id)
      }
      onClick={() =>
        editRoute ? editRouteAttractions(item) : toggleRoute(item)
      }
      category={item.category}
      city={item.city}
      rating={item.rating}
      price={item.price}
      isEditable={userId !== null}
    />
  );

  const header = () => {
    if (routeAttractions.length > 0) return null;
    return (
      <View style={styles.headerContainer}>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text style={styles.headerTitle}>Route Attractions</Text>
          {editingRouteAttractions && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                setEditingRouteAttractions(false);
                setShowOnlySelected(false);
                router.back();
              }}
            >
              <Text style={styles.backButtonText}>Finish</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Only In Route</Text>
          <Switch
            value={showOnlySelected}
            onValueChange={setShowOnlySelected}
          />
        </View>

        <Picker
          style={styles.picker}
          selectedValue={selectedCategory}
          onValueChange={(val) => setSelectedCategory(val)}
        >
          <Picker.Item label="All Categories" value={null} />
          <Picker.Item label="Historical" value={"HISTORICAL"} />
          <Picker.Item label="Cultural" value={"CULTURAL"} />
          <Picker.Item label="Natural" value={"NATURAL"} />
          <Picker.Item label="Recreational" value={"RECREATIONAL"} />
          <Picker.Item label="Culinary" value={"CULINARY"} />
        </Picker>

        <Picker
          style={styles.picker}
          selectedValue={selectedCity}
          onValueChange={(val) => setSelectedCity(val)}
        >
          <Picker.Item label="All Cities" value={null} />
          {ALL_CITIES.map((city) => (
            <Picker.Item label={city} value={city} />
          ))}
        </Picker>
      </View>
    );
  };

  if (
    showOnlySelected &&
    attractions.filter((attraction) =>
      editRoute
        ? editRoute.attractions.some((sel) => sel.id === attraction.id)
        : selectedAttractions.some((sel) => sel.id === attraction.id)
    ).length < 1
  )
    return (
      <SafeAreaView style={styles.safeArea}>
        {header()}
        <View style={styles.loadingContainer}>
          <Text>No attractions added to route</Text>
        </View>
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={styles.safeArea}>
      {header()}
      {isLoading ? (
        <View
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "50%",
          }}
        >
          <ActivityIndicator size="large" color="#0066ff" />
        </View>
      ) : (
        <FlatList
          data={
            editRoute?.attractions && showOnlySelected
              ? attractions.filter((attraction) =>
                  editRoute.attractions.some((sel) => sel.id === attraction.id)
                )
              : routeAttractions?.length > 0
              ? routeAttractions
              : showOnlySelected
              ? attractions.filter((attraction) =>
                  selectedAttractions.some((sel) => sel.id === attraction.id)
                )
              : attractions
          }
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    fontSize: 16,
    fontWeight: "600",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  list: {
    padding: 10,
  },
  itemContainer: {
    flexDirection: "row",
    marginVertical: 8,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 10,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 10,
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  description: {
    fontSize: 14,
    marginVertical: 4,
  },
  routeButton: {
    marginTop: 8,
    color: "blue",
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f9f9f9",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  filterLabel: {
    marginRight: 8,
    fontSize: 14,
  },
  picker: {
    height: 53,
    width: "100%",
    marginTop: 4,
  },
  backButton: {
    borderColor: "#118cf1",
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
    marginVertical: 5,
  },
  backButtonText: {
    color: "#118cf1",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default AttractionsPage;
