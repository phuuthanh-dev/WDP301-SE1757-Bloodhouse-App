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
  Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

// Sample data - replace with actual API calls
const donationRequests = [
  {
    id: "1",
    donorName: "Nguyễn Văn A",
    bloodType: "A+",
    status: "Chờ Duyệt",
    date: "25/03/2024",
    time: "09:30",
    location: "Trung Tâm Chính",
    phone: "0123456789",
    lastDonation: "15/12/2023",
  },
  {
    id: "2",
    donorName: "Trần Thị B",
    bloodType: "O-",
    status: "Đã Duyệt",
    date: "26/03/2024",
    time: "14:00",
    location: "Chi Nhánh Nam",
    phone: "0987654321",
    lastDonation: "20/01/2024",
  },
];

const emergencyRequests = [
  {
    id: "1",
    hospitalName: "Bệnh Viện Trung Ương",
    bloodType: "B+",
    units: 3,
    status: "Khẩn Cấp",
    requestDate: "24/03/2024",
    requiredBy: "25/03/2024",
    contact: "BS. Nguyễn Văn C",
    phone: "0123456789",
    reason: "Phẫu Thuật",
  },
  {
    id: "2",
    hospitalName: "Trung Tâm Y Tế",
    bloodType: "AB-",
    units: 2,
    status: "Đang Xử Lý",
    requestDate: "24/03/2024",
    requiredBy: "26/03/2024",
    contact: "BS. Lê Thị D",
    phone: "0987654321",
    reason: "Cấp Cứu",
  },
];

const getStatusColor = (status) => {
  switch (status) {
    case "Chờ Duyệt":
      return "#FFA502";
    case "Đã Duyệt":
      return "#2ED573";
    case "Khẩn Cấp":
      return "#FF4757";
    case "Đang Xử Lý":
      return "#1E90FF";
    default:
      return "#95A5A6";
  }
};

const DonationRequestCard = ({ request }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <View style={styles.headerLeft}>
        <Text style={styles.name}>{request.donorName}</Text>
        <View style={styles.bloodTypeContainer}>
          <MaterialIcons name="water-drop" size={16} color="#FF6B6B" />
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
          style={[styles.statusText, { color: getStatusColor(request.status) }]}
        >
          {request.status}
        </Text>
      </View>
    </View>

    <View style={styles.cardContent}>
      <View style={styles.infoRow}>
        <MaterialIcons name="event" size={16} color="#636E72" />
        <Text style={styles.infoText}>
          {request.date} at {request.time}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <MaterialIcons name="location-on" size={16} color="#636E72" />
        <Text style={styles.infoText}>{request.location}</Text>
      </View>

      <View style={styles.infoRow}>
        <MaterialIcons name="phone" size={16} color="#636E72" />
        <Text style={styles.infoText}>{request.phone}</Text>
      </View>

      <View style={styles.infoRow}>
        <MaterialIcons name="history" size={16} color="#636E72" />
        <Text style={styles.infoText}>
          Last donation: {request.lastDonation}
        </Text>
      </View>
    </View>

    <View style={styles.cardActions}>
      <TouchableOpacity
        style={[styles.actionButton, styles.approveButton]}
        onPress={() => {}}
      >
        <MaterialIcons name="check" size={16} color="#2ED573" />
        <Text style={[styles.actionText, { color: "#2ED573" }]}>Approve</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, styles.rejectButton]}
        onPress={() => {}}
      >
        <MaterialIcons name="close" size={16} color="#FF4757" />
        <Text style={[styles.actionText, { color: "#FF4757" }]}>Reject</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const EmergencyRequestCard = ({ request }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <View style={styles.headerLeft}>
        <Text style={styles.name}>{request.hospitalName}</Text>
        <View style={styles.bloodTypeContainer}>
          <MaterialIcons name="water-drop" size={16} color="#FF6B6B" />
          <Text style={styles.bloodType}>
            {request.bloodType} ({request.units} units)
          </Text>
        </View>
      </View>
      <View
        style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(request.status) + "20" },
        ]}
      >
        <Text
          style={[styles.statusText, { color: getStatusColor(request.status) }]}
        >
          {request.status}
        </Text>
      </View>
    </View>

    <View style={styles.cardContent}>
      <View style={styles.infoRow}>
        <MaterialIcons name="error" size={16} color="#636E72" />
        <Text style={styles.infoText}>{request.reason}</Text>
      </View>

      <View style={styles.infoRow}>
        <MaterialIcons name="event" size={16} color="#636E72" />
        <Text style={styles.infoText}>Required by: {request.requiredBy}</Text>
      </View>

      <View style={styles.infoRow}>
        <MaterialIcons name="person" size={16} color="#636E72" />
        <Text style={styles.infoText}>{request.contact}</Text>
      </View>

      <View style={styles.infoRow}>
        <MaterialIcons name="phone" size={16} color="#636E72" />
        <Text style={styles.infoText}>{request.phone}</Text>
      </View>
    </View>

    <View style={styles.cardActions}>
      <TouchableOpacity
        style={[styles.actionButton, styles.processButton]}
        onPress={() => {}}
      >
        <MaterialIcons name="play-arrow" size={16} color="#1E90FF" />
        <Text style={[styles.actionText, { color: "#1E90FF" }]}>Process</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, styles.completeButton]}
        onPress={() => {}}
      >
        <MaterialIcons name="check-circle" size={16} color="#2ED573" />
        <Text style={[styles.actionText, { color: "#2ED573" }]}>Complete</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default function ManageRequestsScreen() {
  const [activeTab, setActiveTab] = useState("donation");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Quản Lý Yêu Cầu</Text>
        <Text style={styles.subtitle}>
          Quản lý yêu cầu hiến máu và khẩn cấp
        </Text>
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

      {/* Tab Buttons */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "donation" && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab("donation")}
        >
          <MaterialIcons
            name="assignment"
            size={20}
            color={activeTab === "donation" ? "#FF6B6B" : "#95A5A6"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "donation" && styles.activeTabText,
            ]}
          >
            Yêu Cầu Hiến Máu
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "emergency" && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab("emergency")}
        >
          <MaterialIcons
            name="warning"
            size={20}
            color={activeTab === "emergency" ? "#FF6B6B" : "#95A5A6"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "emergency" && styles.activeTabText,
            ]}
          >
            Yêu Cầu Khẩn Cấp
          </Text>
        </TouchableOpacity>
      </View>

      {/* Request List */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {activeTab === "donation"
          ? donationRequests.map((request) => (
              <DonationRequestCard key={request.id} request={request} />
            ))
          : emergencyRequests.map((request) => (
              <EmergencyRequestCard key={request.id} request={request} />
            ))}
      </ScrollView>
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
    padding: 20,
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
  searchContainer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
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
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: "#F1F2F6",
  },
  activeTabButton: {
    backgroundColor: "#FF6B6B20",
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
    color: "#95A5A6",
  },
  activeTabText: {
    color: "#FF6B6B",
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
  headerLeft: {
    flex: 1,
  },
  name: {
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
    backgroundColor: "#2ED57320",
  },
  rejectButton: {
    backgroundColor: "#FF475720",
  },
  processButton: {
    backgroundColor: "#1E90FF20",
  },
  completeButton: {
    backgroundColor: "#2ED57320",
  },
  actionText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "500",
  },
});
