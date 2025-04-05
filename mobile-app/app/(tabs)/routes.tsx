import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { baseApiUrl } from "@/constants/Api";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";

type RoutePlan = {
  id: number;
  name: string;
  city: string;
  category: string;
  description: string;
  upvotes: number;
  commentCount: number;
  thumbnailUrl: string;
};

const sortOptions = ["Latest", "Most Upvoted"];
const ALL_CITIES = ["Pula", "Rovinj", "Poreč", "Umag", "Novigrad"];
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
  const router = useRouter();

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      let query = "";
      if (selectedSort) query += `sort=${selectedSort.toLowerCase()}&`;
      if (selectedCity) query += `city=${selectedCity}&`;
      if (selectedCategory) query += `category=${selectedCategory}&`;
      const response = await fetch(`${baseApiUrl}/public/routes?${query}`);
      const data = await response.json();
      setRoutes(data);
    } catch (error) {
      console.error("Error fetching routes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, [selectedSort, selectedCity, selectedCategory]);

  const renderRouteCard = ({ item }: { item: RoutePlan }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.name}</Text>
      <Text style={styles.cardMeta}>
        {item.city} • {item.category}
      </Text>
      <Text style={styles.cardDescription}>{item.description}</Text>
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="thumbs-up-outline" size={20} color="#1158f1" />
          <Text style={styles.actionText}>{item.upvotes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={20} color="#1158f1" />
          <Text style={styles.actionText}>{item.commentCount}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onAccessibilityTap={() => {
            router.replace("/explore");
          }}
          style={styles.useRouteButton}
        >
          <Text style={styles.useRouteText}>Use Route</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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

      {loading ? (
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
    </SafeAreaView>
  );
}

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
  },
  card: {
    backgroundColor: "#f2f2f2",
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
});
