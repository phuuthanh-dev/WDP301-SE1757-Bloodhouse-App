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
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import bloodDonationRegistrationAPI from "@/apis/bloodDonationRegistration";
import { useFacility } from "@/contexts/FacilityContext";
import DonationRequestCard from "@/components/DonationRequestCard";
import EmergencyRequestCard from "@/components/EmergencyRequestCard";
import { toast } from "sonner-native";

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

// const EmergencyRequestCard = ({ request, handleProcess, handleComplete }) => (
//   <View style={styles.card}>
//     <View style={styles.cardHeader}>
//       <View style={styles.headerLeft}>
//         <Text style={styles.name}>{request.hospitalName}</Text>
//         <View style={styles.bloodTypeContainer}>
//           <MaterialIcons name="water-drop" size={16} color="#FF6B6B" />
//           <Text style={styles.bloodType}>
//             {request.bloodType} ({request.units} units)
//           </Text>
//         </View>
//       </View>
//       <View
//         style={[
//           styles.statusBadge,
//           { backgroundColor: getStatusColor(request.status) + "20" },
//         ]}
//       >
//         <Text
//           style={[styles.statusText, { color: getStatusColor(request.status) }]}
//         >
//           {request.status}
//         </Text>
//       </View>
//     </View>

//     <View style={styles.cardContent}>
//       <View style={styles.infoRow}>
//         <MaterialIcons name="error" size={16} color="#636E72" />
//         <Text style={styles.infoText}>{request.reason}</Text>
//       </View>

//       <View style={styles.infoRow}>
//         <MaterialIcons name="event" size={16} color="#636E72" />
//         <Text style={styles.infoText}>Required by: {request.requiredBy}</Text>
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
//         style={[styles.actionButton, styles.processButton]}
//         onPress={() => {}}
//       >
//         <MaterialIcons name="play-arrow" size={16} color="#1E90FF" />
//         <Text style={[styles.actionText, { color: "#1E90FF" }]}>Process</Text>
//       </TouchableOpacity>

//       <TouchableOpacity
//         style={[styles.actionButton, styles.completeButton]}
//         onPress={() => {}}
//       >
//         <MaterialIcons name="check-circle" size={16} color="#2ED573" />
//         <Text style={[styles.actionText, { color: "#2ED573" }]}>Complete</Text>
//       </TouchableOpacity>
//     </View>
//   </View>
// );

export default function ManageRequestsScreen() {
  const { facilityId } = useFacility();
  const [activeTab, setActiveTab] = useState("donation");
  const [searchQuery, setSearchQuery] = useState("");
  const [donationRequests, setDonationRequests] = useState([]);
  // const [emergencyRequests, setEmergencyRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // const fetchEmergencyRequests = async () => {
    //   const response =
    //     await bloodDonationRegistrationAPI.getEmergencyRequests();
    //   setEmergencyRequests(data);
    // };

    fetchDonationRequests();
    // fetchEmergencyRequests();
  }, []);

  const fetchDonationRequests = async () => {
    setLoading(true);
    const response =
      await bloodDonationRegistrationAPI.HandleBloodDonationRegistration(
        `?status=pending_approval&limit=10&page=1&facilityId=${facilityId}`
      );
    setDonationRequests(response.data);
    setLoading(false);
  };

  const handleApprove = async (requestId) => {
    Alert.alert(
      "Xác nhận duyệt",
      "Bạn có chắc chắn muốn duyệt yêu cầu hiến máu này?",
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
              const response =
                await bloodDonationRegistrationAPI.HandleBloodDonationRegistration(
                  `/${requestId}`,
                  {
                    status: "registered",
                  },
                  "put"
                );
              if (response.status === 200) {
                toast.success("Duyệt yêu cầu thành công");
                setDonationRequests(
                  donationRequests.filter((request) => request._id !== request._id)
                );
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

  const handleReject = async (requestId) => {
    Alert.alert(
      "Xác nhận từ chối",
      "Bạn có chắc chắn muốn từ chối yêu cầu hiến máu này?",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Từ chối",
          style: "destructive",
          onPress: async () => {
            try {
              const response =
                await bloodDonationRegistrationAPI.HandleBloodDonationRegistration(
                  `/${requestId}`,
                  {
                    status: "rejected_registration",
                  },
                  "put"
                );
              if (response.status === 200) {
                toast.success("Từ chối yêu cầu thành công");
                setDonationRequests(
                  donationRequests.filter((request) => request._id !== request._id)
                );
              }
            } catch (error) {
              toast.error("Từ chối yêu cầu thất bại");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleProcess = () => {
    console.log("Process");
  };

  const handleComplete = () => {
    console.log("Complete");
  };

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
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => {
              fetchDonationRequests();
            }}
          />
        }
      >
        {activeTab === "donation"
          ? donationRequests.map((request) => (
              <DonationRequestCard
                key={request._id}
                request={request}
                handleApprove={handleApprove}
                handleReject={handleReject}
              />
            ))
          : emergencyRequests.map((request) => (
              <EmergencyRequestCard
                key={request.id}
                request={request}
                handleProcess={handleProcess}
                handleComplete={handleComplete}
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
  avatarNameContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  nameBloodContainer: {
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
