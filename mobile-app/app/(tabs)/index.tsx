import Map from "@/components/Map";
import { Text, StyleSheet, View } from "react-native";

export default function HomeScreen() {
  return <Map />;
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    justifyContent: "center",
    width: "100%",
  },
  title: {
    fontSize: 42,
  },
});
