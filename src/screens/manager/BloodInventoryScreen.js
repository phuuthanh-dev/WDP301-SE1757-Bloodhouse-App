import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const bloodTypes = [
  { type: "A+", quantity: 150, status: "Đủ" },
  { type: "A-", quantity: 50, status: "Thấp" },
  { type: "B+", quantity: 200, status: "Đủ" },
  { type: "B-", quantity: 30, status: "Nguy Cấp" },
  { type: "AB+", quantity: 80, status: "Đủ" },
  { type: "AB-", quantity: 25, status: "Nguy Cấp" },
  { type: "O+", quantity: 180, status: "Đủ" },
  { type: "O-", quantity: 45, status: "Thấp" },
];

const getStatusColor = (status) => {
  switch (status) {
    case "Nguy Cấp":
      return "#FF4757";
    case "Thấp":
      return "#FFA502";
    case "Đủ":
      return "#2ED573";
    default:
      return "#95A5A6";
  }
};

export default function BloodInventoryScreen({ navigation }) {
  const [filter, setFilter] = useState("Tất Cả");

  const renderInventoryCard = (item) => (
    <View key={item.type} style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.bloodTypeContainer}>
          <Text style={styles.bloodType}>{item.type}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) + "20" },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(item.status) },
              ]}
            >
              {item.status}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.quantityContainer}>
          <Text style={styles.quantityValue}>{item.quantity}</Text>
          <Text style={styles.quantityUnit}>đơn vị</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Cập Nhật Cuối</Text>
            <Text style={styles.statValue}>2 giờ trước</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Sắp Hết Hạn</Text>
            <Text style={styles.statValue}>5 đơn vị</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kho Máu</Text>
        <TouchableOpacity style={styles.filterButton}>
          <MaterialIcons name="filter-list" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          {["Tất Cả", "Nguy Cấp", "Thấp", "Đủ"].map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.filterChip,
                filter === item && styles.filterChipActive,
              ]}
              onPress={() => setFilter(item)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filter === item && styles.filterChipTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Inventory List */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {bloodTypes.map(renderInventoryCard)}
      </ScrollView>
    </SafeAreaView>
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
    paddingTop: Platform.OS === "ios" ? 20 : 40,
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
  filterButton: {
    padding: 8,
  },
  filterContainer: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
  },
  filterContent: {
    paddingHorizontal: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F1F2F6",
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: "#FF6B6B",
  },
  filterChipText: {
    color: "#636E72",
    fontSize: 14,
    fontWeight: "500",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  bloodTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bloodType: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2D3436",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  cardContent: {
    padding: 16,
  },
  quantityContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  quantityValue: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FF6B6B",
  },
  quantityUnit: {
    fontSize: 14,
    color: "#95A5A6",
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#E9ECEF",
    paddingTop: 16,
  },
  statItem: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    color: "#95A5A6",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    color: "#2D3436",
    fontWeight: "500",
  },
});
