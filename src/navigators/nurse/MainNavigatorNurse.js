import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TabNavigatorNurse from "./TabNavigatorNurse";
import GiftDistributionFormScreen from "@/screens/nurse/GiftDistributionFormScreen";

const MainNavigatorNurse = () => {
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "white" },
        animation: "fade_from_bottom",
      }}
    >
      <Stack.Screen name="TabNavigator" component={TabNavigatorNurse} />
      <Stack.Screen name="GiftDistributionForm" component={GiftDistributionFormScreen} />
    </Stack.Navigator>
  );
};

export default MainNavigatorNurse;
