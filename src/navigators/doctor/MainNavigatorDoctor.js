import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TabNavigatorDoctor from "./TabNavigatorDoctor";
import DonorExaminationScreen from "@/screens/doctor/DonorExaminationScreen";
import PostDonationScreen from "@/screens/doctor/PostDonationScreen";
import DonorHistoryScreen from "@/screens/doctor/DonorHistoryScreen";
import DonorListScreen from "@/screens/doctor/DonorListScreen";

const MainNavigatorDoctor = () => {
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "white" },
        animation: "fade_from_bottom",
      }}
    >
      <Stack.Screen name="TabNavigator" component={TabNavigatorDoctor} />
      <Stack.Screen name="DonorExamination" component={DonorExaminationScreen} />
      <Stack.Screen name="PostDonation" component={PostDonationScreen} />
      <Stack.Screen name="DonorHistory" component={DonorHistoryScreen} />
      <Stack.Screen name="DonorList" component={DonorListScreen} />
    </Stack.Navigator>
  );
};

export default MainNavigatorDoctor;
