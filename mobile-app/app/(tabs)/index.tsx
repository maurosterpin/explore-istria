import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Switch,
  SafeAreaView,
} from "react-native";
import { useStore } from "../store/AttractionStore";
import { baseApiUrl } from "@/constants/Api";
import AttractionCard from "@/components/AttractionCard";
import { Picker } from "@react-native-picker/picker";

const AttractionsPage = () => {
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const {
    userId,
    selectedAttractions,
    setSelectedAttractions,
    selectedCategory,
    setSelectedCategory,
    selectedCity,
    setSelectedCity,
  } = useStore();
  const [showOnlySelected, setShowOnlySelected] = useState(false);

  useEffect(() => {
    fetchAttractions();
  }, [selectedCategory, selectedCity]);

  const fetchAttractions = async () => {
    try {
      const response = await fetch(
        `${baseApiUrl}/public/get?${
          selectedCategory ? `category=${selectedCategory}` : ""
        }${selectedCity ? `&city=${selectedCity}` : ""}`
      );
      const data = await response.json();
      setAttractions(data);
      return data;
    } catch (error) {
      console.error("Error fetching attraction:", error);
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

  const renderItem = ({ item }: any) => (
    <AttractionCard
      title={item.name}
      description={item.description}
      image={item.imageUrl}
      inRoute={selectedAttractions.find((a) => a.id === item.id)}
      onClick={() => toggleRoute(item)}
      category={item.category}
      city={item.city}
      rating={item.rating}
      price={item.price}
      isEditable={userId !== null}
    />
  );

  const header = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>Route Attractions</Text>

      <View style={styles.filterRow}>
        <Text style={styles.filterLabel}>Only In Route</Text>
        <Switch value={showOnlySelected} onValueChange={setShowOnlySelected} />
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
        <Picker.Item label="Pula" value="Pula" />
        <Picker.Item label="Porec" value="Porec" />
        <Picker.Item label="Rovinj" value="Rovinj" />
      </Picker>
    </View>
  );

  if (
    showOnlySelected &&
    attractions.filter((attraction) =>
      selectedAttractions.some((sel) => sel.id === attraction.id)
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
      <FlatList
        data={
          showOnlySelected
            ? attractions.filter((attraction) =>
                selectedAttractions.some((sel) => sel.id === attraction.id)
              )
            : attractions
        }
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
      {/* <FAB
        style={{
          position: "absolute",
          margin: 16,
          right: 0,
          bottom: 0,
        }}
        label="Generate Route"
        icon="map"
        disabled={selectedAttractions.length < 1}
        onPress={() => router.push("/explore")}
      /> */}
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
});

export default AttractionsPage;
