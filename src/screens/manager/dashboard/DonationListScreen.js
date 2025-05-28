import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
  TextInput,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import bloodDonationRegistrationAPI from "@/apis/bloodDonationRegistration";

const donors = [
  {
    id: "1",
    name: "Nguyễn Văn A",
    bloodType: "A+",
    lastDonation: "15/02/2024",
    totalDonations: 5,
    status: "Hoạt Động",
    phone: "0123456789",
  },
  {
    id: "2",
    name: "Trần Thị B",
    bloodType: "O-",
    lastDonation: "01/03/2024",
    totalDonations: 8,
    status: "Hoạt Động",
    phone: "0987654321",
  },
  {
    id: "3",
    name: "Lê Văn C",
    bloodType: "B+",
    lastDonation: "20/01/2024",
    totalDonations: 3,
    status: "Không Hoạt Động",
    phone: "0123498765",
  },
  // Add more mock data as needed
];

export default function DonorListScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("Tất Cả");

  const renderDonorCard = (donor) => (
    <TouchableOpacity
      key={donor.id}
      style={styles.card}
      onPress={() => {
        // Navigate to donor details
      }}
    >
      <View style={styles.cardHeader}>
        <View style={styles.donorInfo}>
          <Text style={styles.donorName}>{donor.name}</Text>
          <View style={styles.bloodTypeContainer}>
            <MaterialIcons name="opacity" size={16} color="#FF6B6B" />
            <Text style={styles.bloodType}>{donor.bloodType}</Text>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                donor.status === "Hoạt Động"
                  ? "#2ED573" + "20"
                  : "#FF4757" + "20",
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              {
                color: donor.status === "Hoạt Động" ? "#2ED573" : "#FF4757",
              },
            ]}
          >
            {donor.status}
          </Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <MaterialIcons name="event" size={16} color="#636E72" />
          <Text style={styles.infoText}>
            Lần hiến cuối: {donor.lastDonation}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons name="favorite" size={16} color="#636E72" />
          <Text style={styles.infoText}>
            Tổng số lần hiến: {donor.totalDonations}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons name="phone" size={16} color="#636E72" />
          <Text style={styles.infoText}>{donor.phone}</Text>
        </View>
      </View>
    </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Danh Sách Người Hiến Máu</Text>
        <TouchableOpacity style={styles.filterButton}>
          <MaterialIcons name="filter-list" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={20} color="#95A5A6" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm người hiến máu..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          {["Tất Cả", "Hoạt Động", "Không Hoạt Động"].map((item) => (
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

      {/* Donor List */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {donors.map(renderDonorCard)}
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
  searchContainer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F2F6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: "#2D3436",
  },
  filterContainer: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  donorInfo: {
    flex: 1,
  },
  donorName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D3436",
    marginBottom: 4,
  },
  bloodTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  bloodType: {
    marginLeft: 4,
    fontSize: 14,
    color: "#FF6B6B",
    fontWeight: "500",
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
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#636E72",
  },
});
