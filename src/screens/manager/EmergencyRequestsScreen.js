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
  RefreshControl,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import bloodRequestAPI from "@/apis/bloodRequestAPI";
import { useFacility } from "@/contexts/FacilityContext";
import ReceiveRequestCard from "@/components/ReceiveRequestCard";
import { RECEIVE_BLOOD_STATUS_NAME_LABELS } from "@/constants/receiveBloodStatus";

const emergencyRequests = [
  {
    id: "1",
    patientName: "Nguyễn Thị D",
    bloodType: "O-",
    hospital: "Bệnh Viện Đa Khoa",
    urgency: "Nguy Cấp",
    unitsNeeded: 3,
    status: "Chờ Xử Lý",
    requestTime: "2 giờ trước",
    contact: "BS. Trần Văn E",
    phone: "0123456789",
  },
  {
    id: "2",
    patientName: "Lê Minh F",
    bloodType: "AB+",
    hospital: "Bệnh Viện Quốc Tế",
    urgency: "Khẩn Cấp",
    unitsNeeded: 2,
    status: "Đang Xử Lý",
    requestTime: "1 giờ trước",
    contact: "BS. Phạm Thị G",
    phone: "0987654321",
  },
  {
    id: "3",
    patientName: "Hoàng Văn H",
    bloodType: "B-",
    hospital: "Trung Tâm Y Tế",
    urgency: "Bình Thường",
    unitsNeeded: 1,
    status: "Hoàn Thành",
    requestTime: "3 giờ trước",
    contact: "BS. Nguyễn Văn I",
    phone: "0123498765",
  },
];

export default function EmergencyRequestsScreen({ navigation }) {
  const { facilityId } = useFacility();
  const [emergencyRequests, setEmergencyRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmergencyRequests();
  }, [filter]);

  const fetchEmergencyRequests = async () => {
    try {
      setLoading(true);
      const status = filter === "all" ? "" : filter;
      const response = await bloodRequestAPI.HandleBloodRequest(
        `/facility/${facilityId}?isUrgent=true&status=${status}`
      );
      setEmergencyRequests(response.data.data);
    } catch (error) {
      console.error("Error fetching emergency requests:", error);
    } finally {
      setLoading(false);
    }
  };

  // const renderEmergencyCard = (request) => (
  //   <TouchableOpacity
  //     key={request._id}
  //     style={styles.card}
  //     onPress={() => {
  //       // Navigate to emergency details
  //     }}
  //   >
  //     <View style={styles.cardHeader}>
  //       <View style={styles.headerLeft}>
  //         <View style={styles.urgencyBadge}>
  //           <View
  //             style={[
  //               styles.urgencyDot,
  //               { backgroundColor: getUrgencyColor(request.urgency) },
  //             ]}
  //           />
  //           <Text style={styles.urgencyText}>{request.urgency}</Text>
  //         </View>
  //         <Text style={styles.requestTime}>{request.requestTime}</Text>
  //       </View>
  //       <View
  //         style={[
  //           styles.statusBadge,
  //           { backgroundColor: getStatusColor(request.status) + "20" },
  //         ]}
  //       >
  //         <Text
  //           style={[
  //             styles.statusText,
  //             { color: getStatusColor(request.status) },
  //           ]}
  //         >
  //           {request.status}
  //         </Text>
  //       </View>
  //     </View>

  //     <View style={styles.cardContent}>
  //       <View style={styles.patientInfo}>
  //         <Text style={styles.patientName}>{request.userId.fullName}</Text>
  //         <View style={styles.bloodTypeContainer}>
  //           <MaterialIcons name="opacity" size={20} color="#FF6B6B" />
  //           <Text style={styles.bloodType}>{request.userId.bloodId}</Text>
  //           <Text style={styles.unitsNeeded}>
  //             • {request.unitsNeeded} đơn vị
  //           </Text>
  //         </View>
  //       </View>

  //       <View style={styles.divider} />

  //       <View style={styles.infoRow}>
  //         <MaterialIcons name="local-hospital" size={16} color="#636E72" />
  //         <Text style={styles.infoText}>{request.hospital}</Text>
  //       </View>

  //       <View style={styles.infoRow}>
  //         <MaterialIcons name="person" size={16} color="#636E72" />
  //         <Text style={styles.infoText}>{request.contact}</Text>
  //       </View>

  //       <View style={styles.infoRow}>
  //         <MaterialIcons name="phone" size={16} color="#636E72" />
  //         <Text style={styles.infoText}>{request.phone}</Text>
  //       </View>
  //     </View>

  //     <View style={styles.cardActions}>
  //       <TouchableOpacity
  //         style={[styles.actionButton, styles.primaryButton]}
  //         onPress={() => {}}
  //       >
  //         <Text style={styles.actionButtonText}>Phản Hồi</Text>
  //       </TouchableOpacity>
  //     </View>
  //   </TouchableOpacity>
  // );
  const handleApproveReceive = (requestId, scheduleDate) => {
    Alert.alert(
      "Xác nhận duyệt",
      "Bạn có chắc chắn muốn duyệt yêu cầu nhận máu này?",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Duyệt",
          style: "default",
          onPress: async () => {
            try {
              const response = await bloodRequestAPI.HandleBloodRequest(
                `/facility/${facilityId}/${requestId}/status`,
                {
                  status: "approved",
                  scheduleDate: scheduleDate,
                  staffId: user._id,
                },
                "patch"
              );
              if (response.status === 200) {
                toast.success("Duyệt yêu cầu thành công");
                fetchEmergencyRequests();
              }
            } catch (error) {
              toast.error("Duyệt yêu cầu thất bại");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleRejectReceive = () => {
    console.log("Reject");
  };

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
        <Text style={styles.headerTitle}>Yêu Cầu Khẩn Cấp</Text>
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
            placeholder="Tìm kiếm yêu cầu khẩn cấp..."
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
          {RECEIVE_BLOOD_STATUS_NAME_LABELS.map((item) => (
            <TouchableOpacity
              key={item.value}
              style={[
                styles.filterChip,
                filter === item.value && styles.filterChipActive,
              ]}
              onPress={() => setFilter(item.value)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filter === item.value && styles.filterChipTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Emergency List */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchEmergencyRequests} />
        }
      >
        {emergencyRequests.map((request) => (
          <ReceiveRequestCard
            key={request._id}
            request={request}
            handleReject={() => handleRejectReceive(request._id)}
            onViewDetails={() =>
              navigation.navigate("ReceiveRequestDetailScreen", { request })
            }
            onApproveSuccess={handleApproveReceive}
          />
        ))}
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
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  urgencyBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  urgencyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  urgencyText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2D3436",
  },
  requestTime: {
    fontSize: 12,
    color: "#95A5A6",
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
  patientInfo: {
    marginBottom: 16,
  },
  patientName: {
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
    fontSize: 16,
    color: "#FF6B6B",
    fontWeight: "600",
  },
  unitsNeeded: {
    fontSize: 14,
    color: "#636E72",
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#E9ECEF",
    marginVertical: 16,
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
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E9ECEF",
  },
  actionButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: "#FF6B6B",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
