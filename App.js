import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "react-native";
import AppRouters from "./src/navigators/AppRouters";
import { NotificationProvider } from "./src/contexts/NotificationContext";
export default function App() {
  return (
    <NavigationContainer>
      <StatusBar backgroundColor="#FF6B6B" barStyle="dark-content" />
      <NotificationProvider>
        <AppRouters />
      </NotificationProvider>
    </NavigationContainer>
  );
}
