import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Button,
  Switch,
} from "react-native";
import { useStore } from "../store/AttractionStore";
import { baseApiUrl } from "@/constants/Api";

const AttractionsPage = () => {
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const { selectedAttractions, setSelectedAttractions } = useStore();
  const router = useRouter();
  const [showOnlySelected, setShowOnlySelected] = useState(false);

  useEffect(() => {
    fetchRoute();
  }, []);

  const fetchRoute = async () => {
    try {
      const response = await fetch(`${baseApiUrl}/get`);
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
    <View style={styles.itemContainer}>
      <Image source={{ uri: item.imageUrl }} style={styles.image} />
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.description}>{item.description}</Text>
        <TouchableOpacity onPress={() => toggleRoute(item)}>
          <Text style={styles.routeButton}>
            {selectedAttractions.find((a) => a.id === item.id)
              ? "Remove from Route"
              : "Add to Route"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (
    showOnlySelected &&
    attractions.filter((attraction) => selectedAttractions.includes(attraction))
      .length < 1
  )
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Route Attractions</Text>
          <Switch
            value={showOnlySelected}
            onValueChange={(value: any) => setShowOnlySelected(value)}
          />
        </View>
        <View style={styles.loadingContainer}>
          <Text>No attractions added to route</Text>
        </View>
      </View>
    );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Route Attractions</Text>
        <Switch
          value={showOnlySelected}
          onValueChange={(value: any) => setShowOnlySelected(value)}
        />
      </View>
      <FlatList
        data={
          showOnlySelected
            ? attractions.filter((attraction) =>
                selectedAttractions.includes(attraction)
              )
            : attractions
        }
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
      <Button
        disabled={selectedAttractions.length < 1}
        title="Generate Route"
        onPress={() => router.push("/explore")}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    justifyContent: "flex-end",
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
});

export default AttractionsPage;
