import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useStore } from "@/app/store/AttractionStore";
import { Portal } from "react-native-paper";
import { useRouter } from "expo-router";
import { useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AppHeader: React.FC = () => {
  const store = useStore();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const router = useRouter();
  const route = useRoute();

  const toggleDropdown = () => setDropdownVisible((prev) => !prev);

  const handleOption = async (option: "profile" | "signOut") => {
    if (option === "signOut") {
      try {
        await AsyncStorage.removeItem("jwtToken");
        store.setUsername(null);
        console.log("Token removed from AsyncStorage");
      } catch (error) {
        console.error("Error removing token:", error);
      }
    }
    setDropdownVisible(false);
  };

  return (
    <View style={styles.header}>
      {store.username !== null ? (
        <View style={styles.userContainer}>
          <TouchableOpacity onPress={toggleDropdown}>
            <Ionicons name="person-circle-outline" size={32} color="#fff" />
          </TouchableOpacity>
          <Portal>
            {dropdownVisible && (
              <View style={styles.dropdown}>
                <Pressable
                  style={styles.dropdownItem}
                  onPress={() => handleOption("profile")}
                >
                  <Text style={styles.dropdownText}>Profile</Text>
                </Pressable>
                <Pressable
                  style={styles.dropdownItem}
                  onPress={() => handleOption("signOut")}
                >
                  <Text style={styles.dropdownText}>Sign Out</Text>
                </Pressable>
              </View>
            )}
          </Portal>
        </View>
      ) : route.name !== "signin" && route.name !== "register" ? (
        <TouchableOpacity onPress={() => router.push("/signin")}>
          <Text style={styles.signIn}>Sign In</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    overflow: "visible",
    zIndex: 999,
  },
  title: {
    color: "#fff",
    fontSize: 20,
  },
  signIn: {
    color: "#fff",
    fontSize: 16,
  },
  userContainer: {
    position: "relative",
    overflow: "visible",
    zIndex: 999,
  },
  dropdown: {
    position: "absolute",
    top: 100,
    right: 10,
    width: 120,
    backgroundColor: "#fff",
    borderRadius: 4,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    zIndex: 999,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  dropdownText: {
    fontSize: 16,
    color: "#333",
  },
});

export default AppHeader;
