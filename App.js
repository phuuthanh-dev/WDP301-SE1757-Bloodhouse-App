import React from "react";
import AppRouters from "./src/navigators/AppRouters";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "react-native";

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar backgroundColor="#FF6B6B" barStyle="dark-content" />
      <AppRouters />
    </NavigationContainer>
  );
}
