import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  Image,
  Linking,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useFacility } from "@/contexts/FacilityContext";
import bloodRequestAPI from "@/apis/bloodRequestAPI";
import { formatDateTime } from "@/utils/formatHelpers";
import Header from "@/components/Header";
import bloodRequestSupportAPI from "@/apis/bloodRequestSupportAPI";
import { toast } from "sonner-native";

export const MOCK_VOLUNTEERS = [
  {
    _id: "v1",
    fullName: "Nguyễn Văn An",
    bloodGroup: "A+",
    phone: "0901234567",
    status: "pending",
    lastDonation: "2024-02-15",
    donationCount: 5,
    healthStatus: "Healthy",
    age: 28,
  },
  {
    _id: "v2",
    fullName: "Trần Thị Bình",
    bloodGroup: "O-",
    phone: "0912345678",
    status: "approved",
    lastDonation: "2024-01-20",
    donationCount: 8,
    healthStatus: "Healthy",
    age: 35,
  },
  {
    _id: "v3",
    fullName: "Lê Văn Cường",
    bloodGroup: "B+",
    phone: "0923456789",
    status: "rejected",
    lastDonation: "2024-03-01",
    donationCount: 3,
    healthStatus: "Recent Surgery",
    age: 42,
  },
  {
    _id: "v4",
    fullName: "Phạm Thị Dung",
    bloodGroup: "AB+",
    phone: "0934567890",
    status: "pending",
    lastDonation: "2024-02-28",
    donationCount: 6,
    healthStatus: "Healthy",
    age: 31,
  },
];

export const MEDICAL_THEME = {
  primary: "#FF6B6B",
  secondary: "#2ED573",
  tertiary: "#1E90FF",
  warning: "#FFA502",
  danger: "#FF4757",
  neutral: "#636E72",
  background: "#F8F9FA",
  surface: "#FFFFFF",
  border: "#E9ECEF",

  status: {
    pending: {
      bg: "#FFA50220",
      text: "#FFA502",
      border: "#FFA502",
    },
    approved: {
      bg: "#2ED57320",
      text: "#2ED573",
      border: "#2ED573",
    },
    rejected: {
      bg: "#FF475720",
      text: "#FF4757",
      border: "#FF4757",
    },
    urgent: {
      bg: "#FF6B6B20",
      text: "#FF6B6B",
      border: "#FF6B6B",
    },
  },

  bloodType: {
    "A+": { bg: "#FF6B6B20", text: "#FF6B6B" },
    "A-": { bg: "#FF878720", text: "#FF8787" },
    "B+": { bg: "#1E90FF20", text: "#1E90FF" },
    "B-": { bg: "#4DABFF20", text: "#4DABFF" },
    "O+": { bg: "#2ED57320", text: "#2ED573" },
    "O-": { bg: "#54E08B20", text: "#54E08B" },
    "AB+": { bg: "#FFA50220", text: "#FFA502" },
    "AB-": { bg: "#FFB73220", text: "#FFB732" },
  },
};

const SupportRequestDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { facilityId } = useFacility();
  const { requestId } = route.params;

  const [request, setRequest] = useState(null);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequestDetails = async () => {
    try {
      setLoading(true);

      const [requestResponse, volunteersResponse] = await Promise.all([
        bloodRequestAPI.HandleBloodRequest(`/need-support/${requestId}`),
        bloodRequestSupportAPI.HandleBloodRequestSupport(`/${requestId}`),
      ]);
      if (requestResponse.status === 200 && volunteersResponse.status === 200) {
        setRequest(requestResponse.data);
        setVolunteers(volunteersResponse.data || []);
      }
    } catch (error) {
      console.error("Error fetching request details:", error);
      Alert.alert("Lỗi", "Không thể tải thông tin yêu cầu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequestDetails();
    setVolunteers(MOCK_VOLUNTEERS);
  }, [requestId]);

  const handleApproveVolunteer = async (volunteerId) => {
    Alert.alert(
      "Xác nhận duyệt",
      "Bạn có chắc chắn muốn duyệt người tình nguyện này?",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Duyệt",
          onPress: async () => {
            try {
              const response =
                await bloodRequestSupportAPI.HandleBloodRequestSupport(
                  `/${volunteerId}/status`,
                  { status: "approved" },
                  "patch"
                );
              if (response.status === 200) {
                toast.success("Đã duyệt người tình nguyện");
                fetchRequestDetails();
              }
            } catch (error) {
              toast.error("Không thể duyệt người tình nguyện");
            }
          },
        },
      ]
    );
  };

  const handleRejectVolunteer = async (volunteerId) => {
    Alert.alert(
      "Xác nhận từ chối",
      "Bạn có chắc chắn muốn từ chối người tình nguyện này?",
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
                await bloodRequestSupportAPI.HandleBloodRequestSupport(
                  `/${volunteerId}/status`,
                  { status: "rejected" },
                  "patch"
                );
              if (response.status === 200) {
                toast.success("Đã từ chối người tình nguyện");
                fetchRequestDetails();
              }
            } catch (error) {
              toast.error("Không thể từ chối người tình nguyện");
            }
          },
        },
      ]
    );
  };

  const getStatusStyle = (status) => ({
    backgroundColor:
      MEDICAL_THEME.status[status]?.bg || MEDICAL_THEME.status.pending.bg,
    borderColor:
      MEDICAL_THEME.status[status]?.border ||
      MEDICAL_THEME.status.pending.border,
  });

  const getStatusTextStyle = (status) => ({
    color:
      MEDICAL_THEME.status[status]?.text || MEDICAL_THEME.status.pending.text,
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Chi Tiết Yêu Cầu" showBackButton />
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={MEDICAL_THEME.primary} />
          <Text style={styles.loadingText}>Đang tải thông tin...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!request) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Chi Tiết Yêu Cầu" showBackButton />
        <View style={styles.errorContainer}>
          <FontAwesome5
            name="exclamation-circle"
            size={48}
            color={MEDICAL_THEME.danger}
          />
          <Text style={styles.errorText}>Không tìm thấy thông tin yêu cầu</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: MEDICAL_THEME.background }]}
    >
      <Header
        title="Yêu cầu hỗ trợ máu"
        showBackButton
        rightComponent={
          <FontAwesome5
            name="ellipsis-v"
            size={20}
            color={MEDICAL_THEME.primary}
          />
        }
      />

      <ScrollView style={styles.scrollView}>
        {/* Blood Request Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FontAwesome5
              name="info-circle"
              size={20}
              color={MEDICAL_THEME.primary}
            />
            <Text style={styles.sectionTitle}>Thông Tin Yêu Cầu</Text>
          </View>

          <View
            style={[styles.card, { backgroundColor: MEDICAL_THEME.surface }]}
          >
            <View style={styles.bloodInfoContainer}>
              <View style={styles.bloodTypeContainer}>
                <Text
                  style={[
                    styles.bloodType,
                    {
                      backgroundColor:
                        MEDICAL_THEME.bloodType[request.groupId.name]?.bg,
                      color:
                        MEDICAL_THEME.bloodType[request.groupId.name]?.text,
                    },
                  ]}
                >
                  {request.groupId.name}
                </Text>
                <Text style={styles.component}>{request.componentId.name}</Text>
              </View>
              <View style={styles.quantityBadge}>
                <Text style={styles.quantityText}>
                  {request.quantity} đơn vị
                </Text>
              </View>
            </View>

            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <FontAwesome5
                  name="user"
                  size={16}
                  color={MEDICAL_THEME.primary}
                />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Bệnh nhân</Text>
                  <Text style={styles.infoValue}>{request.patientName}</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <FontAwesome5
                  name="phone-alt"
                  size={16}
                  color={MEDICAL_THEME.primary}
                />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Số điện thoại</Text>
                  <Text style={styles.infoValue}>{request.patientPhone}</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <FontAwesome5
                  name="calendar-alt"
                  size={16}
                  color={MEDICAL_THEME.primary}
                />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Ngày nhận mong muốn</Text>
                  <Text style={styles.infoValue}>
                    {formatDateTime(request.preferredDate)}
                  </Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <FontAwesome5
                  name="map-marker-alt"
                  size={16}
                  color={MEDICAL_THEME.primary}
                />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Địa chỉ</Text>
                  <Text style={styles.infoValue}>{request.address}</Text>
                </View>
              </View>

              {request.note && (
                <View style={styles.infoItem}>
                  <FontAwesome5
                    name="sticky-note"
                    size={16}
                    color={MEDICAL_THEME.primary}
                  />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Ghi chú</Text>
                    <Text style={styles.infoValue}>{request.note}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Medical Documents */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FontAwesome5
              name="file-medical"
              size={20}
              color={MEDICAL_THEME.primary}
            />
            <Text style={styles.sectionTitle}>Tài Liệu Y Tế</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.documentsScroll}
          >
            {request.medicalDocumentUrl.map((url, index) => (
              <Image
                key={index}
                source={{ uri: url }}
                style={styles.documentImage}
              />
            ))}
          </ScrollView>
        </View>

        {/* Volunteers List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FontAwesome5
              name="users"
              size={20}
              color={MEDICAL_THEME.primary}
            />
            <Text style={styles.sectionTitle}>Người Đăng Ký Hỗ Trợ</Text>
          </View>

          {volunteers.length === 0 ? (
            <View
              style={[
                styles.emptyContainer,
                { backgroundColor: MEDICAL_THEME.surface },
              ]}
            >
              <FontAwesome5
                name="user-friends"
                size={48}
                color={MEDICAL_THEME.neutral}
              />
              <Text style={styles.emptyText}>
                Chưa có người đăng ký tình nguyện
              </Text>
            </View>
          ) : (
            volunteers.map((volunteer) => (
              <View
                key={volunteer._id}
                style={[
                  styles.volunteerCard,
                  { backgroundColor: MEDICAL_THEME.surface },
                ]}
              >
                <View style={styles.volunteerHeader}>
                  <View style={styles.volunteerProfile}>
                    <Image
                      source={{
                        uri:
                          volunteer.userId?.avatar ||
                          "https://via.placeholder.com/100",
                      }}
                      style={styles.volunteerAvatar}
                    />
                    <View style={styles.volunteerInfo}>
                      <Text style={styles.volunteerName}>
                        {volunteer.userId?.fullName}
                      </Text>
                      <View
                        style={[
                          styles.statusBadge,
                          getStatusStyle(volunteer.status),
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            getStatusTextStyle(volunteer.status),
                          ]}
                        >
                          {volunteer.status === "pending"
                            ? "Chờ duyệt"
                            : volunteer.status === "approved"
                            ? "Đã duyệt"
                            : "Từ chối"}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.volunteerDetails}>
                  <View style={styles.detailRow}>
                    <FontAwesome5
                      name="envelope"
                      size={16}
                      color={MEDICAL_THEME.primary}
                    />
                    <Text style={styles.detailText}>
                      Email:
                      <Text style={styles.detailValue}>
                        {" "}
                        {volunteer?.email}
                      </Text>
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <FontAwesome5
                      name="phone-alt"
                      size={16}
                      color={MEDICAL_THEME.primary}
                    />
                    <Text style={styles.detailText}>
                      Số điện thoại:
                      <Text style={styles.detailValue}>
                        {" "}
                        {volunteer?.phone}
                      </Text>
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <FontAwesome5
                      name="tint"
                      size={16}
                      color={MEDICAL_THEME.primary}
                    />
                    <Text style={styles.detailText}>
                      Nhóm máu:{" "}
                      <Text style={styles.detailValue}>
                        {volunteer.userId.bloodId.name}
                      </Text>
                    </Text>
                  </View>

                  {volunteer?.eligibility?.lastDonationDate && (
                    <View style={styles.detailRow}>
                      <FontAwesome5
                        name="calendar-check"
                        size={16}
                        color={MEDICAL_THEME.primary}
                      />
                      <Text style={styles.detailText}>
                        Lần hiến gần nhất:{" "}
                        <Text style={styles.detailValue}>
                          {volunteer?.eligibility?.lastDonationDate}
                        </Text>
                      </Text>
                    </View>
                  )}

                  <View style={styles.detailRow}>
                    <FontAwesome5
                      name="history"
                      size={16}
                      color={MEDICAL_THEME.primary}
                    />
                    <Text style={styles.detailText}>
                      Số lần hiến:
                      <Text style={styles.detailValue}>
                        {" "}
                        {volunteer?.eligibility?.totalDonations}
                      </Text>
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <FontAwesome5
                      name="sticky-note"
                      size={16}
                      color={MEDICAL_THEME.primary}
                    />
                    <Text style={styles.detailText}>
                      Ghi chú:
                      <Text style={styles.detailValue}> {volunteer?.note}</Text>
                    </Text>
                  </View>

                  {volunteer.status === "pending" && (
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={[
                          styles.actionButton,
                          { backgroundColor: MEDICAL_THEME.secondary },
                        ]}
                        onPress={() => handleApproveVolunteer(volunteer._id)}
                      >
                        <FontAwesome5
                          name="check"
                          size={16}
                          color={MEDICAL_THEME.surface}
                        />
                        <Text style={styles.actionButtonText}>Duyệt</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.actionButton,
                          { backgroundColor: MEDICAL_THEME.danger },
                        ]}
                        onPress={() => handleRejectVolunteer(volunteer._id)}
                      >
                        <FontAwesome5
                          name="times"
                          size={16}
                          color={MEDICAL_THEME.surface}
                        />
                        <Text style={styles.actionButtonText}>Từ chối</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? 40 : 0,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: MEDICAL_THEME.neutral,
  },
  scrollView: {
    flex: 1,
  },
  statusBanner: {
    padding: 20,
    marginBottom: 16,
  },
  statusContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: MEDICAL_THEME.surface,
  },
  urgentBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 8,
  },
  urgentText: {
    color: MEDICAL_THEME.surface,
    fontWeight: "600",
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: MEDICAL_THEME.primary,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    elevation: 3,
    shadowColor: MEDICAL_THEME.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  bloodInfoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: MEDICAL_THEME.border,
  },
  bloodTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  bloodType: {
    fontSize: 24,
    fontWeight: "bold",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  component: {
    fontSize: 16,
    color: MEDICAL_THEME.neutral,
    fontWeight: "500",
  },
  quantityBadge: {
    backgroundColor: MEDICAL_THEME.primary + "20",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "600",
    color: MEDICAL_THEME.primary,
  },
  infoGrid: {
    gap: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: MEDICAL_THEME.neutral,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: "#2D3436",
    fontWeight: "500",
  },
  documentsScroll: {
    flexDirection: "row",
    paddingVertical: 8,
  },
  documentCard: {
    backgroundColor: MEDICAL_THEME.surface,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    alignItems: "center",
    width: 120,
    elevation: 2,
    shadowColor: MEDICAL_THEME.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  documentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: MEDICAL_THEME.primary + "20",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  documentText: {
    fontSize: 14,
    color: MEDICAL_THEME.neutral,
    textAlign: "center",
  },
  volunteerCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: MEDICAL_THEME.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  volunteerHeader: {
    marginBottom: 16,
  },
  volunteerProfile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  volunteerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: MEDICAL_THEME.primary + "40",
  },
  volunteerInfo: {
    flex: 1,
  },
  volunteerName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2D3436",
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  volunteerDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  detailText: {
    fontSize: 14,
    color: MEDICAL_THEME.neutral,
  },
  detailValue: {
    color: "#2D3436",
    fontWeight: "500",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: MEDICAL_THEME.border,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    color: MEDICAL_THEME.surface,
    fontSize: 14,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    padding: 32,
    borderRadius: 16,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: MEDICAL_THEME.neutral,
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: MEDICAL_THEME.danger,
    textAlign: "center",
  },
  documentImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
});

export default SupportRequestDetailScreen;
