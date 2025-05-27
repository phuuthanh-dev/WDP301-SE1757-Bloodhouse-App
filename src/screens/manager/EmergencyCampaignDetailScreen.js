import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { toast } from "sonner-native";
import emergencyCampaignAPI from "@/apis/emergencyCampaignAPI";
import bloodRequestAPI from "@/apis/bloodRequestAPI";
import { authSelector } from "@/redux/reducers/authReducer";
import { useFacility } from "@/contexts/FacilityContext";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const EmergencyCampaignDetailScreen = ({ route, navigation }) => {
  const { campaign } = route.params;
  const [loading, setLoading] = useState(true);
  const [requestDetails, setRequestDetails] = useState(null);
  const user = useSelector(authSelector);
  const { facilityId } = useFacility();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const requestResponse = await bloodRequestAPI.HandleBloodRequest(
        `/facility/${facilityId}/${campaign.requestId._id}`
      );

      if (requestResponse.status === 200) {
        setRequestDetails(requestResponse.data);
      }
    } catch (error) {
      toast.error("Không thể tải thông tin chiến dịch");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseCampaign = () => {
    Alert.alert(
      "Xác nhận đóng chiến dịch",
      "Bạn có chắc chắn muốn đóng chiến dịch này không?",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Đồng ý",
          onPress: async () => {
            try {
              const response =
                await emergencyCampaignAPI.HandleEmergencyCampaign(
                  `/${campaign._id}/close`,
                  {},
                  "put"
                );
              if (response.status === 200) {
                toast.success("Đã đóng chiến dịch thành công");
                navigation.goBack();
              }
            } catch (error) {
              toast.error("Không thể đóng chiến dịch");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết chiến dịch</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Campaign Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <MaterialIcons name="people" size={24} color="#FF6B6B" />
            <Text style={styles.statNumber}>{0}</Text>
            <Text style={styles.statLabel}>Người đăng ký</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialIcons name="opacity" size={24} color="#00B894" />
            <Text style={styles.statNumber}>{campaign.quantityNeeded}</Text>
            <Text style={styles.statLabel}>Số lượng cần</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialIcons name="event" size={24} color="#1E90FF" />
            <Text style={styles.statNumber}>
              {format(new Date(campaign.deadline), "dd/MM/yyyy HH:mm", {
                locale: vi,
              })}
            </Text>
            <Text style={styles.statLabel}>Hạn chiến dịch</Text>
          </View>
        </View>

        {/* Campaign Info */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Thông tin chiến dịch</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(campaign.status) },
              ]}
            >
              <Text style={styles.statusText}>
                {getStatusText(campaign.status)}
              </Text>
            </View>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <View style={styles.infoItemIcon}>
                <MaterialIcons name="person" size={20} color="#FF6B6B" />
                <Text style={styles.infoLabel}>Người tạo</Text>
              </View>
              <Text style={styles.infoValue}>
                {campaign.createdBy?.fullName || "N/A"}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoItemIcon}>
                <MaterialIcons name="access-time" size={20} color="#FF6B6B" />
                <Text style={styles.infoLabel}>Ngày tạo</Text>
              </View>
              <Text style={styles.infoValue}>
                {format(new Date(campaign.createdAt), "dd/MM/yyyy HH:mm", {
                  locale: vi,
                })}
              </Text>
            </View>
          </View>

          {campaign.requestId.isFullfill && (
            <View style={styles.fulfillContainer}>
              <MaterialIcons name="check-circle" size={24} color="#2ED573" />
              <View style={styles.fulfillContent}>
                <Text style={styles.fulfillTitle}>Đã đủ số lượng yêu cầu</Text>
                <Text style={styles.fulfillText}>
                  Yêu cầu máu đã được đáp ứng đủ số lượng cần thiết
                </Text>
              </View>
            </View>
          )}

          {campaign.note && (
            <View style={styles.noteContainer}>
              <MaterialIcons name="note" size={20} color="#FF6B6B" />
              <View style={styles.noteContent}>
                <Text style={styles.infoLabel}>Ghi chú</Text>
                <Text style={styles.noteText}>{campaign.note}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Blood Request Info */}
        {requestDetails && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Thông tin yêu cầu máu</Text>

            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <View style={styles.infoItemIcon}>
                  <MaterialIcons name="person" size={20} color="#FF6B6B" />
                  <Text style={styles.infoLabel}>Họ tên</Text>
                </View>
                <Text style={styles.infoValue}>
                  {requestDetails.patientName}
                </Text>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.infoItemIcon}>
                  <MaterialIcons name="phone" size={20} color="#FF6B6B" />
                  <Text style={styles.infoLabel}>Số điện thoại</Text>
                </View>
                <Text style={styles.infoValue}>
                  {requestDetails.patientPhone}
                </Text>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.infoItemIcon}>
                  <MaterialIcons name="bloodtype" size={20} color="#FF6B6B" />
                  <Text style={styles.infoLabel}>Nhóm máu</Text>
                </View>
                <Text style={styles.infoValue}>
                  {requestDetails.groupId?.name || "Chưa xác định"}
                </Text>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.infoItemIcon}>
                  <MaterialIcons
                    name="medical-services"
                    size={20}
                    color="#FF6B6B"
                  />
                  <Text style={styles.infoLabel}>Thành phần máu</Text>
                </View>
                <Text style={styles.infoValue}>
                  {requestDetails.componentId?.name || "Chưa xác định"}
                </Text>
              </View>
            </View>

            <View style={styles.addressContainer}>
              <MaterialIcons name="location-on" size={20} color="#FF6B6B" />
              <View style={styles.addressContent}>
                <Text style={styles.infoLabel}>Địa chỉ</Text>
                <Text style={styles.addressText}>{requestDetails.address}</Text>
              </View>
            </View>

            {requestDetails.note && (
              <View style={styles.noteContainer}>
                <MaterialIcons name="note" size={20} color="#FF6B6B" />
                <View style={styles.noteContent}>
                  <Text style={styles.infoLabel}>Ghi chú</Text>
                  <Text style={styles.noteText}>{requestDetails.note}</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {campaign.status === "open" && (
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleCloseCampaign}
          >
            <Text style={styles.closeButtonText}>Đóng chiến dịch</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const getStatusColor = (status) => {
  switch (status) {
    case "open":
      return "#FF6B6B";
    case "closed":
      return "#636E72";
    case "completed":
      return "#00B894";
    case "expired":
      return "#FFA502";
    default:
      return "#636E72";
  }
};

const getStatusText = (status) => {
  switch (status) {
    case "open":
      return "Đang mở";
    case "closed":
      return "Đã đóng";
    case "completed":
      return "Hoàn thành";
    case "expired":
      return "Hết hạn";
    default:
      return status;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    paddingTop: Platform.OS === "android" ? 40 : 0,
  },
  header: {
    backgroundColor: "#FF6B6B",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  statsContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D3436",
    marginVertical: 8,
    textAlign: "center",
  },
  statLabel: {
    fontSize: 12,
    color: "#636E72",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
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
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D3436",
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 16,
  },
  infoItem: {
    width: "45%",
    gap: 4,
  },
  infoItemIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: "#636E72",
    marginTop: 4,
  },
  infoValue: {
    fontSize: 14,
    color: "#2D3436",
    fontWeight: "500",
    marginTop: 4,
    marginLeft: 4,
  },
  addressContainer: {
    flexDirection: "row",
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E9ECEF",
  },
  addressContent: {
    flex: 1,
  },
  addressText: {
    fontSize: 14,
    color: "#2D3436",
    marginTop: 4,
  },
  noteContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E9ECEF",
  },
  noteContent: {
    flex: 1,
  },
  noteText: {
    fontSize: 14,
    color: "#2D3436",
    marginTop: 4,
    fontStyle: "italic",
  },
  closeButton: {
    backgroundColor: "#FF6B6B",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 16,
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  fulfillContainer: {
    flexDirection: "row",
    backgroundColor: "#2ED57320",
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    gap: 12,
  },
  fulfillContent: {
    flex: 1,
  },
  fulfillTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2ED573",
    marginBottom: 4,
  },
  fulfillText: {
    fontSize: 14,
    color: "#636E72",
  },
});

export default EmergencyCampaignDetailScreen;
