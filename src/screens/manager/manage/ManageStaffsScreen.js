import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
  TextInput,
  Image,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import facilityStaffAPI from "@/apis/facilityStaffAPI";
import { useFacility } from "@/contexts/FacilityContext";
import { getRoleName } from "@/constants/userRole";

const staffMembers = [
  {
    id: "1",
    name: "BS. Nguyễn Thị A",
    role: "Bác Sĩ",
    department: "Thu Gom Máu",
    status: "Hoạt Động",
    phone: "0123456789",
    email: "bsnguyena@bloodbank.com",
    shift: "Sáng",
  },
  {
    id: "2",
    name: "KTV. Trần Văn B",
    role: "Kỹ Thuật Viên",
    department: "Phòng Xét Nghiệm",
    status: "Hoạt Động",
    phone: "0987654321",
    email: "ktvtranb@bloodbank.com",
    shift: "Chiều",
  },
  {
    id: "3",
    name: "YT. Lê Thị C",
    role: "Y Tá",
    department: "Chăm Sóc Người Hiến",
    status: "Nghỉ Phép",
    phone: "0123498765",
    email: "ytlec@bloodbank.com",
    shift: "Sáng",
  },
];

const getStatusColor = (status) => {
  switch (status) {
    case "Hoạt Động":
      return "#2ED573";
    case "Nghỉ Phép":
      return "#FFA502";
    case "Không Hoạt Động":
      return "#FF4757";
    default:
      return "#95A5A6";
  }
};

const getRoleIcon = (role) => {
  switch (role) {
    case "Bác Sĩ":
      return "medical-services";
    case "Kỹ Thuật Viên":
      return "science";
    case "Y Tá":
      return "healing";
    default:
      return "person";
  }
};

export default function ManageStaffsScreen({ navigation }) {
  const { facilityId } = useFacility();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("Tất Cả");
  const [staffs, setStaffs] = useState([]);

  useEffect(() => {
    const fetchStaffs = async () => {
      if (!facilityId) {
        return;
      }

      const position = filter === "Tất Cả" ? "" : filter;

      try {
        const response = await facilityStaffAPI.HandleFacilityStaff(
          `/facility/${facilityId}?position=${position}`
        );
        setStaffs(response.data.result);
      } catch (error) {
        console.error("Error fetching staffs:", error);
        // Handle error appropriately
      }
    };

    fetchStaffs();
  }, [facilityId, filter]);

  const renderStaffCard = (staff) => {
    if (staff.position === "MANAGER") {
      return null;
    }
    return (
      <TouchableOpacity
        key={staff._id}
        style={styles.card}
        onPress={() => {
          // Navigate to staff details
        }}
      >
        <View style={styles.cardHeader}>
          <View style={styles.staffInfo}>
            <Text style={styles.staffName}>{staff?.userId.fullName}</Text>
            <View style={styles.roleContainer}>
              <MaterialIcons
                name={getRoleIcon(staff.position)}
                size={16}
                color="#FF6B6B"
              />
              <Text style={styles.roleText}>
                {getRoleName(staff?.position)}
              </Text>
            </View>
          </View>
          <View style={styles.staffAvatar}>
            <Image
              source={{ uri: staff?.userId?.avatar }}
              style={styles.avatar}
            />
          </View>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.infoRow}>
            <MaterialIcons name="business" size={16} color="#636E72" />
            <Text style={styles.infoText}>{staff?.facilityId?.name}</Text>
          </View>

          {staff?.userId?.email && (
            <View style={styles.infoRow}>
              <MaterialIcons name="email" size={16} color="#636E72" />
              <Text style={styles.infoText}>{staff?.userId?.email}</Text>
            </View>
          )}

          {staff?.userId?.phone && (
            <View style={styles.infoRow}>
              <MaterialIcons name="phone" size={16} color="#636E72" />
              <Text style={styles.infoText}>{staff?.userId?.phone}</Text>
            </View>
          )}
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => {}}
          >
            <MaterialIcons name="edit" size={16} color="#1E90FF" />
            <Text style={[styles.actionText, { color: "#1E90FF" }]}>
              Chỉnh Sửa
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Nhân Viên</Text>
          <Text style={styles.subtitle}>
            Quản lý nhân viên và công việc của họ
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            // Navigate to add staff screen
          }}
        >
          <MaterialIcons name="person-add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={20} color="#95A5A6" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm nhân viên..."
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
          {["Tất Cả", "DOCTOR", "NURSE"].map((item) => (
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
                {getRoleName(item)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Staff List */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {staffs?.map(renderStaffCard)}
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  addButton: {
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
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D3436",
    marginBottom: 4,
  },
  roleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  staffAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F2F6",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  roleText: {
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
  editButton: {
    backgroundColor: "#1E90FF" + "20",
  },
  scheduleButton: {
    backgroundColor: "#FF6B6B" + "20",
  },
  actionText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "500",
  },
});
