import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import bloodGroupAPI from "@/apis/bloodGroup";

export default function BloodTypeListScreen({ navigation }) {
  // Mock data for blood type information
  const [bloodGroupList, setBloodGroupList] = useState([]);

  useEffect(() => {
    const fetchBloodGroupList = async () => {
      const response = await bloodGroupAPI.HandleBloodGroup();
      setBloodGroupList(response.data);
    };
    fetchBloodGroupList();
  }, []);

  const bloodCompatibility = [
    {
      type: "A+",
      canGiveTo: ["A+", "AB+"],
      canReceiveFrom: ["A+", "A-", "O+", "O-"],
    },
    {
      type: "A-",
      canGiveTo: ["A+", "A-", "AB+", "AB-"],
      canReceiveFrom: ["A-", "O-"],
    },
    {
      type: "B+",
      canGiveTo: ["B+", "AB+"],
      canReceiveFrom: ["B+", "B-", "O+", "O-"],
    },
    {
      type: "B-",
      canGiveTo: ["B+", "B-", "AB+", "AB-"],
      canReceiveFrom: ["B-", "O-"],
    },
    {
      type: "AB+",
      canGiveTo: ["AB+"],
      canReceiveFrom: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    {
      type: "AB-",
      canGiveTo: ["AB+", "AB-"],
      canReceiveFrom: ["A-", "B-", "AB-", "O-"],
    },
    {
      type: "O+",
      canGiveTo: ["O+", "A+", "B+", "AB+"],
      canReceiveFrom: ["O+", "O-"],
    },
    {
      type: "O-",
      canGiveTo: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      canReceiveFrom: ["O-"],
    },
  ];

  const renderBloodTypeCard = (group) => {
    // Find matching blood type compatibility data
    const compatibilityData = bloodCompatibility.find(
      (item) => item.type === group?.name
    );

    return (
      <TouchableOpacity
        key={group?._id}
        style={styles.bloodTypeCard}
        onPress={() => navigation.navigate("BloodTypeDetail", { group })}
      >
        <View style={styles.bloodTypeHeader}>
          <View style={styles.typeContainer}>
            <Text style={styles.bloodType}>{group?.name}</Text>
            <Text style={styles.percentage}>{group?.populationRate}%</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#95A5A6" />
        </View>

        <Text style={styles.description}>{group?.note}</Text>

        <View style={styles.compatibilityContainer}>
          <View style={styles.compatibilitySection}>
            <Text style={styles.compatibilityLabel}>Có thể cho</Text>
            <View style={styles.bloodTypeList}>
              {compatibilityData?.canGiveTo?.map((type) => (
                <View key={`give-${type}`} style={styles.smallBloodType}>
                  <Text style={styles.smallBloodTypeText}>{type}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.compatibilitySection}>
            <Text style={styles.compatibilityLabel}>Có thể nhận</Text>
            <View style={styles.bloodTypeList}>
              {compatibilityData?.canReceiveFrom?.map((type) => (
                <View key={`receive-${type}`} style={styles.smallBloodType}>
                  <Text style={styles.smallBloodTypeText}>{type}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nhóm máu</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {bloodGroupList?.map(renderBloodTypeCard)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    backgroundColor: "#FF6B6B",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  bloodTypeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bloodTypeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  typeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  bloodType: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF6B6B",
    marginRight: 8,
  },
  percentage: {
    fontSize: 16,
    color: "#95A5A6",
  },
  description: {
    fontSize: 14,
    color: "#636E72",
    marginBottom: 16,
  },
  compatibilityContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  compatibilitySection: {
    flex: 1,
  },
  compatibilityLabel: {
    fontSize: 14,
    color: "#95A5A6",
    marginBottom: 8,
  },
  bloodTypeList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  smallBloodType: {
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 4,
  },
  smallBloodTypeText: {
    fontSize: 12,
    color: "#2D3436",
  },
});
