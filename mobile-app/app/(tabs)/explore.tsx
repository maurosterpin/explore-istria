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
} from "react-native";
import { useStore } from "../store/AttractionStore";

const AttractionsPage = () => {
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const { selectedAttractions, setSelectedAttractions } = useStore();
  const router = useRouter();

  useEffect(() => {
    fetchRoute();
  }, []);

  const fetchRoute = async () => {
    try {
      const response = await fetch("http://10.0.2.2:8080/get");
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

  return (
    <View style={styles.container}>
      <FlatList
        data={attractions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
      <Button
        disabled={selectedAttractions.length < 1}
        title="Generate Route"
        onPress={() => router.push("/")}
      />
    </View>
  );
};

const styles = StyleSheet.create({
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
