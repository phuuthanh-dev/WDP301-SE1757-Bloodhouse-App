import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const donors = [
  {
    id: "1",
    name: "Nguyễn Văn A",
    bloodType: "A+",
    age: 28,
    gender: "Nam",
    lastDonation: "15/03/2024",
    status: "Chưa Khám",
    appointmentTime: "09:00",
  },
  {
    id: "2",
    name: "Vũ Thị F",
    bloodType: "B-",
    age: 27,
    gender: "Nữ",
    lastDonation: "25/02/2024",
    status: "Đã Khám",
    appointmentTime: "09:30",
  },
  {
    id: "3",
    name: "Lê Văn C",
    bloodType: "B+",
    age: 42,
    gender: "Nam",
    lastDonation: "05/01/2024",
    status: "Đang Hiến",
    appointmentTime: "10:00",
  },
  {
    id: "4",
    name: "Trần Thị B",
    bloodType: "O+",
    age: 35,
    gender: "Nữ",
    lastDonation: "10/12/2023",
    status: "Đã Hiến",
    appointmentTime: "10:30",
  },
  {
    id: "5",
    name: "Phạm Thị D",
    bloodType: "AB-",
    age: 29,
    gender: "Nữ",
    lastDonation: "20/02/2024",
    status: "Đã Theo Dõi",
    appointmentTime: "11:00",
  },
  {
    id: "6",
    name: "Hoàng Văn E",
    bloodType: "A-",
    age: 31,
    gender: "Nam",
    lastDonation: "01/03/2024",
    status: "Không Đủ Điều Kiện",
    appointmentTime: "11:30",
  },
];

const getStatusColor = (status) => {
  switch (status) {
    case "Chưa Khám":
      return "#FFA502"; // Xám
    case "Đã Khám":
      return "#1E90FF"; // Xanh dương
    case "Không Đủ Điều Kiện":
      return "#FF4757"; // Đỏ
    case "Đang Hiến":
      return "#FF6B6B"; // Hồng
    case "Đã Hiến":
      return "#20C997"; // Xanh ngọc
    case "Đã Theo Dõi":
      return "#2ED573"; // Xanh lá
    default:
      return "#95A5A6"; // Xám mặc định
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case "Chưa Khám":
      return "schedule";
    case "Đã Khám":
      return "check-circle-outline";
    case "Không Đủ Điều Kiện":
      return "cancel";
    case "Đang Hiến":
      return "bloodtype";
    case "Đã Hiến":
      return "volunteer-activism";
    case "Đã Theo Dõi":
      return "verified";
    default:
      return "help-outline";
  }
};

export default function DonorListScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("Tất Cả");

  const renderActionButtons = (donor) => {
    const renderHistoryButton = () => (
      <TouchableOpacity
        style={[styles.actionButton, styles.historyButton]}
        onPress={() => navigation.navigate("DonorHistory", { id: donor.id })}
      >
        <MaterialIcons name="history" size={16} color="#1E90FF" />
        <Text style={[styles.actionText, { color: "#1E90FF" }]}>Lịch Sử</Text>
      </TouchableOpacity>
    );

    const renderExamButton = () => (
      <TouchableOpacity
        style={[styles.actionButton, styles.examButton]}
        onPress={() => navigation.navigate("DonorExamination", { id: donor.id })}
      >
        <MaterialIcons name="medical-services" size={16} color="#FF6B6B" />
        <Text style={[styles.actionText, { color: "#FF6B6B" }]}>Khám Sàng Lọc</Text>
      </TouchableOpacity>
    );

    const renderMonitorButton = () => (
      <TouchableOpacity
        style={[styles.actionButton, styles.monitorButton]}
        onPress={() =>
          navigation.navigate("PostDonation", {
            donorId: donor.id,
            donorName: donor.name,
            bloodType: donor.bloodType,
            age: donor.age,
            gender: donor.gender
          })
        }
      >
        <MaterialIcons name="monitor-heart" size={16} color="#FF6B6B" />
        <Text style={[styles.actionText, { color: "#FF6B6B" }]}>Theo Dõi Sau Hiến</Text>
      </TouchableOpacity>
    );

    const renderStartDonationButton = () => (
      <TouchableOpacity
        style={[styles.actionButton, styles.donateButton]}
        onPress={() => {
          // TODO: Implement start donation logic
          Alert.alert("Bắt đầu hiến máu", "Chức năng đang được phát triển");
        }}
      >
        <MaterialIcons name="bloodtype" size={16} color="#FF6B6B" />
        <Text style={[styles.actionText, { color: "#FF6B6B" }]}>Bắt Đầu Hiến</Text>
      </TouchableOpacity>
    );

    return (
      <View style={styles.cardActions}>
        {/* Luôn hiển thị nút Lịch Sử */}
        {renderHistoryButton()}

        {/* Hiển thị nút theo trạng thái */}
        {(() => {
          switch (donor.status) {
            case "Chưa Khám":
              return renderExamButton();
            case "Đã Khám":
              return renderStartDonationButton();
            case "Đã Hiến":
              return renderMonitorButton();
            default:
              return null;
          }
        })()}
      </View>
    );
  };

  const renderStatusBadge = (status) => (
    <View
      style={[
        styles.statusBadge,
        { backgroundColor: getStatusColor(status) + "20" },
      ]}
    >
      <MaterialIcons
        name={getStatusIcon(status)}
        size={16}
        color={getStatusColor(status)}
        style={styles.statusIcon}
      />
      <Text
        style={[
          styles.statusText,
          { color: getStatusColor(status) },
        ]}
      >
        {status}
      </Text>
    </View>
  );

  const renderDonorCard = (donor) => (
    <TouchableOpacity
      key={donor.id}
      style={styles.card}
      onPress={() => navigation.navigate("DonorHistory", { id: donor.id })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.appointmentTime}>{donor.appointmentTime}</Text>
          {renderStatusBadge(donor.status)}
        </View>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.donorName}>{donor.name}</Text>
        <View style={styles.donorInfo}>
          <View style={styles.infoItem}>
            <MaterialIcons name="opacity" size={16} color="#FF6B6B" />
            <Text style={styles.infoText}>{donor.bloodType}</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialIcons name="person" size={16} color="#636E72" />
            <Text style={styles.infoText}>
              {donor.age} tuổi • {donor.gender}
            </Text>
          </View>
        </View>
        <View style={styles.lastDonation}>
          <MaterialIcons name="event" size={16} color="#636E72" />
          <Text style={styles.lastDonationText}>
            Lần hiến gần nhất: {donor.lastDonation}
          </Text>
        </View>
      </View>

      {renderActionButtons(donor)}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Danh Sách Người Hiến</Text>
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
            placeholder="Tìm kiếm người hiến..."
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
          {[
            "Tất Cả",
            "Chưa Khám",
            "Đã Khám",
            "Không Đủ Điều Kiện",
            "Đang Hiến",
            "Đã Hiến",
            "Đã Theo Dõi",
          ].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                selectedFilter === filter && {
                  backgroundColor: filter === "Tất Cả" ? "#FF6B6B" : getStatusColor(filter)
                },
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              {filter !== "Tất Cả" && (
                <MaterialIcons
                  name={getStatusIcon(filter)}
                  size={16}
                  color={selectedFilter === filter ? "#FFFFFF" : getStatusColor(filter)}
                  style={styles.filterIcon}
                />
              )}
              <Text
                style={[
                  styles.filterChipText,
                  selectedFilter === filter && styles.filterChipTextActive,
                ]}
              >
                {filter}
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
        {donors
          .filter(donor => selectedFilter === "Tất Cả" || donor.status === selectedFilter)
          .map(renderDonorCard)}
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
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F1F2F6",
    marginRight: 8,
  },
  filterIcon: {
    marginRight: 4,
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
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  appointmentTime: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2D3436",
    marginRight: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardContent: {
    padding: 16,
  },
  donorName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D3436",
    marginBottom: 8,
  },
  donorInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  infoText: {
    marginLeft: 4,
    fontSize: 14,
    color: "#636E72",
  },
  lastDonation: {
    flexDirection: "row",
    alignItems: "center",
  },
  lastDonationText: {
    marginLeft: 4,
    fontSize: 14,
    color: "#636E72",
  },
  cardActions: {
    flexDirection: "row",
    padding: 12,
    justifyContent: "flex-end",
    borderTopWidth: 1,
    borderTopColor: "#E9ECEF",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  historyButton: {
    backgroundColor: "#1E90FF20",
  },
  examButton: {
    backgroundColor: "#FF6B6B20",
  },
  actionText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "500",
  },
  monitorButton: {
    backgroundColor: "#FF6B6B20",
  },
  donateButton: {
    backgroundColor: "#FF6B6B20",
  },
});
