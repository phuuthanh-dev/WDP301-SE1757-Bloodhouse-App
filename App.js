import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar, StyleSheet } from "react-native";
import AppRouters from "@/navigators/AppRouters";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { Provider } from "react-redux";
import store from "@/redux/store";
import { Toaster } from "sonner-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { LocationProvider } from "@/contexts/LocationContext";
import { FacilityProvider } from "./src/contexts/FacilityContext";
import { LogBox } from "react-native";
import Toast from "react-native-toast-message";

LogBox.ignoreLogs([
  "expo-notifications: Android Push notifications (remote notifications) functionality provided by expo-notifications was removed from Expo Go",
]);

export default function App() {
  return (
    <FacilityProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar backgroundColor="#FF6B6B" barStyle="dark-content" />
        <Provider store={store}>
          <SafeAreaProvider style={styles.container}>
            <Toaster />
            <LocationProvider>
              <NotificationProvider>
                <NavigationContainer>
                  <AppRouters />
                </NavigationContainer>
              </NotificationProvider>
            </LocationProvider>
            <Toast />
          </SafeAreaProvider>
        </Provider>
      </GestureHandlerRootView>
    </FacilityProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
