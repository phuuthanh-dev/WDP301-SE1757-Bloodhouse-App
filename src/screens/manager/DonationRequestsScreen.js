import React, { useState } from "react";
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

const donationRequests = [
  {
    id: "1",
    donorName: "Nguyễn Văn A",
    bloodType: "A+",
    date: "20/03/2024",
    time: "09:30",
    status: "Chờ Duyệt",
    location: "Trung Tâm Hiến Máu",
    notes: "Lần đầu hiến máu",
  },
  {
    id: "2",
    donorName: "Trần Thị B",
    bloodType: "O-",
    date: "20/03/2024",
    time: "10:00",
    status: "Đã Duyệt",
    location: "Bệnh Viện Thành Phố",
    notes: "Người hiến thường xuyên",
  },
  {
    id: "3",
    donorName: "Lê Văn C",
    bloodType: "B+",
    date: "20/03/2024",
    time: "11:30",
    status: "Hoàn Thành",
    location: "Trung Tâm Y Tế",
    notes: "Đã đổi lịch hẹn",
  },
];

const getStatusColor = (status) => {
  switch (status) {
    case "Chờ Duyệt":
      return "#FFA502";
    case "Đã Duyệt":
      return "#2ED573";
    case "Hoàn Thành":
      return "#1E90FF";
    case "Đã Hủy":
      return "#FF4757";
    default:
      return "#95A5A6";
  }
};

export default function DonationRequestsScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("Tất Cả");

  const renderRequestCard = (request) => (
    <TouchableOpacity
      key={request.id}
      style={styles.card}
      onPress={() => {
        // Navigate to request details
      }}
    >
      <View style={styles.cardHeader}>
        <View style={styles.donorInfo}>
          <Text style={styles.donorName}>{request.donorName}</Text>
          <View style={styles.bloodTypeContainer}>
            <MaterialIcons name="opacity" size={16} color="#FF6B6B" />
            <Text style={styles.bloodType}>{request.bloodType}</Text>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(request.status) + "20" },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: getStatusColor(request.status) },
            ]}
          >
            {request.status}
          </Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <MaterialIcons name="event" size={16} color="#636E72" />
          <Text style={styles.infoText}>
            {request.date} • {request.time}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons name="location-on" size={16} color="#636E72" />
          <Text style={styles.infoText}>{request.location}</Text>
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons name="note" size={16} color="#636E72" />
          <Text style={styles.infoText}>{request.notes}</Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.approveButton]}
          onPress={() => {}}
        >
          <MaterialIcons name="check" size={16} color="#2ED573" />
          <Text style={[styles.actionText, { color: "#2ED573" }]}>Duyệt</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => {}}
        >
          <MaterialIcons name="close" size={16} color="#FF4757" />
          <Text style={[styles.actionText, { color: "#FF4757" }]}>Từ Chối</Text>
        </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Yêu Cầu Hiến Máu</Text>
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
            placeholder="Tìm kiếm yêu cầu..."
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
          {["Tất Cả", "Chờ Duyệt", "Đã Duyệt", "Hoàn Thành", "Đã Hủy"].map(
            (item) => (
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
            )
          )}
        </ScrollView>
      </View>

      {/* Request List */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {donationRequests.map(renderRequestCard)}
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
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
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
  cardActions: {
    flexDirection: "row",
    padding: 12,
    justifyContent: "flex-end",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  approveButton: {
    backgroundColor: "#2ED573" + "20",
  },
  rejectButton: {
    backgroundColor: "#FF4757" + "20",
  },
  actionText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "500",
  },
});
