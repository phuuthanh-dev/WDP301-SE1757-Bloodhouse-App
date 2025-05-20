import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar, StyleSheet } from "react-native";
import AppRouters from "./src/navigators/AppRouters";
import { NotificationProvider } from "./src/contexts/NotificationContext";
import { Provider } from "react-redux";
import store from "./src/redux/store";
import { Toaster } from "sonner-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { LocationProvider } from "./src/contexts/LocationContext";

export default function App() {
  return (
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
        </SafeAreaProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
