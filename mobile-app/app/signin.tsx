import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Stack, Link, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { baseApiUrl } from "@/constants/Api";
import { useStore } from "./store/AttractionStore";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SignInScreen() {
  const router = useRouter();
  const store = useStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = async () => {
    try {
      console.log("route", `${baseApiUrl}/public/login`);
      console.log("username", username, "password", password);
      const response = await fetch(`${baseApiUrl}/public/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (response.ok) {
        const data = await response.json();
        store.setUsername(data.username);
        store.setUserId(data.userId);
        await AsyncStorage.setItem("jwtToken", data.token);
        Alert.alert("Success", "Logged in successfully!");
        router.back();
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Error", "An error occurred. Please try again later.");
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: "Sign In" }} />
      <LinearGradient colors={["#5bb7f5", "#1158f1"]} style={styles.background}>
        <View style={styles.cardContainer}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Username"
              autoCapitalize="none"
              value={username}
              onChangeText={setUsername}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>

          <Link href="/register" asChild>
            <TouchableOpacity style={styles.registerButton}>
              <Text style={styles.registerButtonText}>Register</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
  },
  cardContainer: {
    marginHorizontal: 20,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 26,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  signInButton: {
    backgroundColor: "#118cf1",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  signInButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  registerButton: {
    marginTop: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#118cf1",
    paddingVertical: 14,
    alignItems: "center",
  },
  registerButtonText: {
    color: "#118cf1",
    fontSize: 18,
    fontWeight: "600",
  },
});
