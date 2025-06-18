import React from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Swiper from "react-native-swiper";

const { width } = Dimensions.get("window");

const ONBOARDING_DATA = [
  {
    key: "1",
    title: "Chào mừng đến với BloodHouse",
    text: "Nền tảng kết nối cộng đồng hiến máu",
    image: require("@/assets/images/onboarding1.png"),
  },
  {
    key: "2",
    title: "Hiến máu cứu người",
    text: "Mỗi giọt máu là một món quà của sự sống",
    image: require("@/assets/images/onboarding2.png"),
  },
  {
    key: "3",
    title: "Tìm kiếm và kết nối",
    text: "Dễ dàng tìm kiếm người hiến máu phù hợp",
    image: require("@/assets/images/onboarding3.png"),
  },
];

export default function OnboardingScreen({ navigation }) {
  const markOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem("onboardingComplete", "true");
    } catch (error) {
      console.error("Error saving onboarding status:", error);
    }
  };

  const handleGetStarted = async () => {
    await markOnboardingComplete();
    navigation.replace("Login");
  };

  return (
    <View style={styles.container}>
      <Swiper
        style={styles.wrapper}
        dotStyle={styles.dot}
        activeDotStyle={styles.activeDot}
        loop={false}
      >
        {ONBOARDING_DATA.map((slide) => (
          <View key={slide.key} style={styles.slide}>
            <Image source={slide?.image} style={styles.image} />
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.text}>{slide.text}</Text>
          </View>
        ))}
      </Swiper>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleGetStarted}
        >
          <Text style={styles.buttonText}>Bắt đầu</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  wrapper: {},
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  image: {
    width: width * 0.8,
    height: width * 0.8,
    resizeMode: "contain",
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF6B6B",
    marginBottom: 10,
    textAlign: "center",
  },
  text: {
    fontSize: 16,
    color: "#636E72",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  dot: {
    backgroundColor: "#95A5A6",
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3,
  },
  activeDot: {
    backgroundColor: "#FF6B6B",
    width: 20,
    height: 8,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3,
  },
  buttonContainer: {
    padding: 20,
  },
  button: {
    backgroundColor: "#FF6B6B",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
