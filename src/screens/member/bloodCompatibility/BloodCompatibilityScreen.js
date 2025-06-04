import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import bloodCompatibilityAPI from "@/apis/bloodCompatibility";
import bloodGroupAPI from "@/apis/bloodGroup";
import bloodComponentAPI from "@/apis/bloodComponent";

export default function BloodCompatibilityScreen({ navigation }) {
  const [selectedBloodType, setSelectedBloodType] = useState(null);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [bloodGroup, setBloodGroup] = useState(null);
  const [bloodComponent, setBloodComponent] = useState(null);
  const [bloodCompatibility, setBloodCompatibility] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [bloodGroupData, bloodComponentData] = await Promise.all([
          bloodGroupAPI.HandleBloodGroup(),
          bloodComponentAPI.HandleBloodComponent(),
        ]);
        setBloodGroup(bloodGroupData.data);
        setBloodComponent(bloodComponentData.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchCompatibility = async () => {
      if (selectedBloodType && selectedComponent) {
        try {
          setIsLoading(true)
          const response = await bloodCompatibilityAPI.HandleBloodCompatibility(
            "?bloodGroupId=" +
              selectedBloodType +
              "&componentId=" +
              selectedComponent
          );

          setBloodCompatibility(response.data);
        } catch (error) {
          console.error("Error fetching compatibility:", error);
          setBloodCompatibility(null);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchCompatibility();
  }, [selectedBloodType, selectedComponent]);

  const renderBloodTypeButton = (type) => (
    <TouchableOpacity
      key={type._id}
      style={[
        styles.bloodTypeButton,
        selectedBloodType === type._id && styles.selectedBloodType,
      ]}
      onPress={() => setSelectedBloodType(type._id)}
    >
      <Text
        style={[
          styles.bloodTypeButtonText,
          selectedBloodType === type._id && styles.selectedBloodTypeText,
        ]}
      >
        {type.name}
      </Text>
    </TouchableOpacity>
  );

  const renderCompatibilityInfo = () => {
    if (!selectedBloodType || !selectedComponent || !bloodCompatibility)
      return null;
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
        </View>
      );
    }
    return isLoading ? (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    ) : (
      <>
        <View style={styles.compatibilityContainer}>
          <View style={styles.compatibilitySection}>
            <Text style={styles.compatibilityTitle}>Có thể cho máu cho</Text>
            <View style={styles.bloodTypeGrid}>
              {bloodCompatibility?.canDonateTo?.map((type) => (
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("BloodTypeDetail", {
                      groupId: type._id,
                    })
                  }
                  key={type._id}
                  style={styles.compatibleType}
                >
                  <Text style={styles.compatibleTypeText}>{type.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.compatibilitySection}>
            <Text style={styles.compatibilityTitle}>Có thể nhận máu từ</Text>
            <View style={styles.bloodTypeGrid}>
              {bloodCompatibility?.canReceiveFrom?.map((type) => (
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("BloodTypeDetail", {
                      groupId: type._id,
                    })
                  }
                  key={type._id}
                  style={styles.compatibleType}
                >
                  <Text style={styles.compatibleTypeText}>{type.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.title}>Kiểm tra tương thích máu</Text>
          <Text style={styles.subtitle}>
            Chọn nhóm máu và thành phần để xem thông tin tương thích
          </Text>
        </View>
      </View>

      {/* Component Selection */}
      <View style={styles.componentSelection}>
        {bloodComponent?.map((component) => (
          <TouchableOpacity
            key={component._id}
            style={[
              styles.componentButton,
              selectedComponent === component._id && styles.selectedComponent,
            ]}
            onPress={() => setSelectedComponent(component._id)}
          >
            <Text
              style={[
                styles.componentButtonText,
                selectedComponent === component._id &&
                  styles.selectedComponentText,
              ]}
            >
              {component.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Blood Type Selection */}
      <View style={styles.bloodTypeSelection}>
        <Text style={styles.sectionTitle}>Chọn nhóm máu</Text>
        <View style={styles.bloodTypeGrid}>
          {bloodGroup?.map(renderBloodTypeButton)}
        </View>
      </View>

      {/* Compatibility Information */}
      {selectedBloodType && renderCompatibilityInfo()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    paddingTop: Platform.OS === "android" ? 40 : 0,
  },
  header: {
    backgroundColor: "#FF6B6B",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "flex-start",
    marginLeft: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#FFFFFF",
    opacity: 0.9,
  },
  componentSelection: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
    backgroundColor: "#FFFFFF",
    marginTop: -10,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  componentButton: {
    flex: 1,
    minWidth: "45%",
    margin: 4,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    alignItems: "center",
  },
  selectedComponent: {
    backgroundColor: "#FF6B6B",
    borderColor: "#FF6B6B",
  },
  componentButtonText: {
    color: "#2D3436",
    fontSize: 14,
    fontWeight: "500",
  },
  selectedComponentText: {
    color: "#FFFFFF",
  },
  bloodTypeSelection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D3436",
    marginBottom: 16,
  },
  bloodTypeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  bloodTypeButton: {
    width: "23%",
    margin: "1%",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  selectedBloodType: {
    backgroundColor: "#FF6B6B",
    borderColor: "#FF6B6B",
  },
  bloodTypeButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2D3436",
  },
  selectedBloodTypeText: {
    color: "#FFFFFF",
  },
  compatibilityContainer: {
    padding: 16,
  },
  compatibilitySection: {
    marginBottom: 24,
  },
  compatibilityTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D3436",
    marginBottom: 12,
  },
  compatibleType: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    margin: 4,
  },
  compatibleTypeText: {
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
