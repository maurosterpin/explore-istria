import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Link, Stack, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { baseApiUrl } from "@/constants/Api";

export default function RegisterScreen() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleRegister = async () => {
    if (!username || !email || !password || !confirm) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    if (password !== confirm) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      const response = await fetch(`${baseApiUrl}/public/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      if (response.ok) {
        Alert.alert("Success", "Registered successfully!");
        router.back();
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      Alert.alert("Error", "An error occurred. Please try again later.");
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: "Register" }} />
      <LinearGradient colors={["#5bb7f5", "#1158f1"]} style={styles.background}>
        <View style={styles.cardContainer}>
          <Text style={styles.title}>Create an Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>

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
              placeholder="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              secureTextEntry
              value={confirm}
              onChangeText={setConfirm}
            />
          </View>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegister}
          >
            <Text style={styles.registerButtonText}>Register</Text>
          </TouchableOpacity>

          <Link href="/signin" asChild>
            <TouchableOpacity style={styles.backToSignIn}>
              <Text style={styles.backToSignInText}>
                Already have an account? Sign In
              </Text>
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
  registerButton: {
    backgroundColor: "#1158f1",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  backToSignIn: {
    marginTop: 16,
    alignItems: "center",
  },
  backToSignInText: {
    color: "#1158f1",
    fontSize: 16,
    fontWeight: "600",
  },
});
