import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import { StoreProvider } from "./store/AttractionStore";
import AppHeader from "@/components/AppHeader";
import { Provider } from "react-native-paper";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <StoreProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Provider>
          <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: "#237dc7",
              },
              headerTintColor: "#fff",
              headerTitleStyle: {
                fontWeight: "bold",
              },
              title: "Explore Istria",
              headerRight: () => <AppHeader />,
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: true }} />
            <Stack.Screen name="+not-found" />
            <Stack.Screen name="signin" />
          </Stack>
          <StatusBar style="auto" />
        </Provider>
      </ThemeProvider>
    </StoreProvider>
  );
}
