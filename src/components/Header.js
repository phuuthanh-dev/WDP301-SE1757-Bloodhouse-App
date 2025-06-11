import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const Header = ({
  title,
  greeting,
  subtitle,
  showBackButton = false,
  showProfileButton = false,
  rightComponent,
  onBackPress,
  onProfilePress,
  containerStyle,
}) => {
  const navigation = useNavigation();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={[styles.header, containerStyle]}>
      <View style={styles.headerContent}>
        {showBackButton && (
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
        <View style={styles.titleContainer}>
          {greeting && <Text style={styles.greeting}>{greeting}</Text>}
          <Text style={styles.headerTitle}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
      {showProfileButton && (
        <TouchableOpacity style={styles.profileButton} onPress={onProfilePress}>
          <MaterialIcons name="account-circle" size={32} color="#FFFFFF" />
        </TouchableOpacity>
      )}
      {rightComponent && !showProfileButton && (
        <View style={styles.rightSection}>{rightComponent}</View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#FF6B6B",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  headerContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 16,
  },
  titleContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  subtitle: {
    fontSize: 16,
    color: "#FFFFFF",
    marginTop: 4,
    opacity: 0.9,
  },
  profileButton: {
    padding: 8,
  },
  rightSection: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Header;
