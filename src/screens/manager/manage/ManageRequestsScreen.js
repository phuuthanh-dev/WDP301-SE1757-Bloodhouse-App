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
import { toast } from "sonner-native";
import bloodRequestAPI from "@/apis/bloodRequestAPI";
import ReceiveRequestCard from "@/components/ReceiveRequestCard";
import { useSelector } from "react-redux";
import { authSelector } from "@/redux/reducers/authReducer";
import Toast from "react-native-toast-message";

export default function ManageRequestsScreen({ navigation }) {
  const { facilityId } = useFacility();
  const { user } = useSelector(authSelector);
  const [activeTab, setActiveTab] = useState("urgent");
  const [searchQuery, setSearchQuery] = useState("");
  const [donationRequests, setDonationRequests] = useState([]);
  const [receiveRequests, setReceiveRequests] = useState([]);
  const [emergencyRequests, setEmergencyRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDonationRequests();
    fetchReceiveRequests();
    fetchEmergencyRequests();
  }, []);

  const fetchReceiveRequests = async () => {
    setLoading(true);
    const response = await bloodRequestAPI.HandleBloodRequest(
      `/facility/${facilityId}?isUrgent=false&status=pending_approval`
    );
    setReceiveRequests(response.data.data);
    setLoading(false);
  };

  const fetchEmergencyRequests = async () => {
    setLoading(true);
    const response = await bloodRequestAPI.HandleBloodRequest(
      `/facility/${facilityId}?isUrgent=true&status=pending_approval`
    );
    setEmergencyRequests(response.data.data);
    setLoading(false);
  };

  const fetchDonationRequests = async () => {
    setLoading(true);
    const response =
      await bloodDonationRegistrationAPI.HandleBloodDonationRegistration(
        `?status=pending_approval&limit=10&page=1&facilityId=${facilityId}`
      );
    setDonationRequests(response.data.data);
    setLoading(false);
  };

  const handleApproveDonation = async (requestId) => {
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
                  donationRequests.filter(
                    (request) => request._id !== request._id
                  )
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

  const handleRejectDonation = async (requestId) => {
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
                  donationRequests.filter(
                    (request) => request._id !== request._id
                  )
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

  const handleApproveReceive = (requestId) => {
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
                  staffId: user._id,
                },
                "patch"
              );
              if (response.status === 200) {
                Toast.show({
                  type: "success",
                  text1: "Duyệt yêu cầu thành công",
                });
                // navigation.navigate("DistributeBloodScreen", {
                //   request: response.data.data,
                // });
                setReceiveRequests(
                  receiveRequests.filter(
                    (request) => request._id !== requestId
                  )
                );
                setEmergencyRequests(
                  emergencyRequests.filter(
                    (request) => request._id !== requestId
                  )
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

  const handleRejectReceive = () => {
    console.log("Reject");
  };

  const handleUpdateComponentSuccess = async (requestId, componentId) => {
    try {
      const response = await bloodRequestAPI.HandleBloodRequest(
        `/facility/${facilityId}/${requestId}/component`,
        { componentId },
        "patch"
      );
      if (response.status === 200) {
        Toast.show({
          type: "success",
          text1: "Cập nhật thành phần máu thành công",
        });
        fetchReceiveRequests();
      }
    } catch (error) {
      Alert.alert(
        "Lỗi",
        "Không thể cập nhật thành phần máu. Vui lòng thử lại sau."
      );
    }
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

      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "urgent" && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab("urgent")}
          >
            <MaterialIcons
              name="warning"
              size={20}
              color={activeTab === "urgent" ? "#FF6B6B" : "#95A5A6"}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "urgent" && styles.activeTabText,
              ]}
            >
              Khẩn Cấp
            </Text>
          </TouchableOpacity>

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
              activeTab === "received" && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab("received")}
          >
            <MaterialIcons
              name="assignment"
              size={20}
              color={activeTab === "received" ? "#FF6B6B" : "#95A5A6"}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "received" && styles.activeTabText,
              ]}
            >
              Yêu Cầu Nhận Máu
            </Text>
          </TouchableOpacity>
        </ScrollView>
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
              fetchReceiveRequests();
              fetchEmergencyRequests();
            }}
          />
        }
      >
        {activeTab === "donation"
          ? donationRequests.map((request) => (
              <DonationRequestCard
                key={request._id}
                request={request}
                handleApprove={handleApproveDonation}
                handleReject={handleRejectDonation}
              />
            ))
          : activeTab === "urgent"
          ? emergencyRequests.map((request) => (
              <ReceiveRequestCard
                key={request._id}
                request={request}
                handleReject={() => handleRejectReceive(request._id)}
                onViewDetails={() =>
                  navigation.navigate("ReceiveRequestDetailScreen", {
                    requestId: request._id,
                  })
                }
                handleApproveReceive={handleApproveReceive}
                onUpdateComponentSuccess={handleUpdateComponentSuccess}
              />
            ))
          : receiveRequests.map((request) => (
              <ReceiveRequestCard
                key={request._id}
                request={request}
                handleReject={() => handleRejectReceive(request._id)}
                onViewDetails={() =>
                  navigation.navigate("ReceiveRequestDetailScreen", {
                    requestId: request._id,
                  })
                }
                handleApproveReceive={() => handleApproveReceive(request._id)}
                onUpdateComponentSuccess={handleUpdateComponentSuccess}
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
    gap: 12,
  },
  tabButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#F1F2F6",
    minWidth: 140,
    marginRight: 12,
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
