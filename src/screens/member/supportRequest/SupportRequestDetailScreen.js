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
  Linking,
  Image,
  Modal,
  TextInput,
  RefreshControl,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { toast } from "sonner-native";
import bloodRequestSupportAPI from "@/apis/bloodRequestSupportAPI";
import { authSelector } from "@/redux/reducers/authReducer";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import RequestSupportRegistrationModal from "@/components/RequestSupportRegistrationModal";
import bloodRequestAPI from "@/apis/bloodRequestAPI";
import {
  getStatusReceiveBloodColor,
  getStatusReceiveBloodName,
} from "@/constants/receiveBloodStatus";

export const SupportRequestDetailScreen = ({ route, navigation }) => {
  const { request } = route.params;
  const [loading, setLoading] = useState(true);
  const [requestDetail, setRequestDetail] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const { user } = useSelector(authSelector);
  const [volunteers, setVolunteers] = useState(null);
  const [contactInfo, setContactInfo] = useState({
    phone: "",
    email: "",
    note: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [requestResponse, volunteerResponse] = await Promise.all([
        bloodRequestAPI.HandleBloodRequest(`/need-support/${request._id}`),
        bloodRequestSupportAPI.HandleBloodRequestSupport(`/${request._id}`),
      ]);
      if (requestResponse.status === 200 && volunteerResponse.status === 200) {
        setRequestDetail(requestResponse.data);
        setVolunteers(volunteerResponse.data || []);
      }
    } catch (error) {
      toast.error("Không thể tải thông tin yêu cầu");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setContactInfo({
      phone: user.phone || "",
      email: user.email || "",
      note: "",
    });
    setModalVisible(true);
  };

  const handleRegister = async () => {
    try {
      setRegistering(true);
      setModalVisible(false);

      const registrationData = {
        requestId: requestDetail._id,
        phone: contactInfo.phone,
        email: contactInfo.email,
        note: contactInfo.note || "Đăng ký từ ứng dụng di động",
      };

      const response = await bloodRequestSupportAPI.HandleBloodRequestSupport(
        "",
        registrationData,
        "post"
      );

      if (response.status === 201) {
        Alert.alert(
          "Đăng ký thành công",
          "Cảm ơn bạn đã đăng ký tham gia chiến dịch hiến máu. Chúng tôi sẽ liên hệ với bạn sớm nhất.",
          [{ text: "Đóng", onPress: () => navigation.goBack() }]
        );
        fetchData();
      }
    } catch (error) {
      let errorMessage = "Không thể đăng ký tham gia chiến dịch";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      Alert.alert("Lỗi", errorMessage);
    } finally {
      setRegistering(false);
    }
  };

  const openGoogleMaps = () => {
    const address = encodeURIComponent(
      requestDetail?.facilityId?.address || ""
    );
    const url = `https://www.google.com/maps/search/?api=1&query=${address}`;
    Linking.openURL(url);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <MaterialIcons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Chi tiết yêu cầu hỗ trợ</Text>
      <View style={styles.placeholder} />
    </View>
  );

  const renderStatusBadge = () => (
    <View
      style={[
        styles.statusBadge,
        { backgroundColor: getStatusReceiveBloodColor(requestDetail.status) },
      ]}
    >
      <Text style={styles.statusText}>
        {getStatusReceiveBloodName(requestDetail.status)}
      </Text>
    </View>
  );

  const renderFacilityInfo = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <MaterialIcons name="local-hospital" size={24} color="#FF6B6B" />
          <Text style={styles.cardTitle}>Thông tin cơ sở y tế</Text>
          {renderStatusBadge()}
        </View>
      </View>

      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <View style={styles.infoItemIcon}>
            <MaterialIcons name="business" size={20} color="#FF6B6B" />
            <Text style={styles.infoLabel}>Tên cơ sở</Text>
          </View>
          <Text style={styles.infoValue}>
            {requestDetail?.facilityId?.name || "Đang cập nhật"}
          </Text>
        </View>

        <TouchableOpacity style={styles.infoItem} onPress={openGoogleMaps}>
          <View style={styles.infoItemIcon}>
            <MaterialIcons name="location-on" size={20} color="#FF6B6B" />
            <Text style={styles.infoLabel}>Địa chỉ</Text>
          </View>
          <Text style={[styles.infoValue, styles.linkText]}>
            {requestDetail?.facilityId?.address || "Đang cập nhật"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderRequestStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <MaterialIcons name="event" size={24} color="#FF6B6B" />
        <Text style={styles.statNumber}>
          {format(new Date(requestDetail?.preferredDate), "dd/MM/yyyy HH:mm", {
            locale: vi,
          })}
        </Text>
        <Text style={styles.statLabel}>Hạn chót</Text>
      </View>
      <View style={styles.statCard}>
        <MaterialIcons name="opacity" size={24} color="#FF6B6B" />
        <Text style={styles.statNumber}>{requestDetail?.quantity}</Text>
        <Text style={styles.statLabel}>Số lượng cần</Text>
      </View>
      <View style={styles.statCard}>
        <MaterialIcons name="people" size={24} color="#FF6B6B" />
        <Text style={styles.statNumber}>
          {requestDetail?.numberRegistered || 0}
        </Text>
        <Text style={styles.statLabel}>Đã đăng ký</Text>
      </View>
    </View>
  );

  const renderPatientInfo = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Thông tin bệnh nhân</Text>
      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <View style={styles.infoItemIcon}>
            <MaterialIcons name="person" size={20} color="#FF6B6B" />
            <Text style={styles.infoLabel}>Họ tên</Text>
          </View>
          <Text style={styles.infoValue}>
            {requestDetail?.patientName || "N/A"}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.infoItem}
          onPress={() =>
            requestDetail?.requestId?.patientPhone &&
            Linking.openURL(`tel:${requestDetail.requestId.patientPhone}`)
          }
        >
          <View style={styles.infoItemIcon}>
            <MaterialIcons name="phone" size={20} color="#FF6B6B" />
            <Text style={styles.infoLabel}>Số điện thoại</Text>
          </View>
          <Text
            style={[
              styles.infoValue,
              requestDetail?.requestId?.patientPhone && styles.linkText,
            ]}
          >
            {requestDetail?.patientPhone || "N/A"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderBloodInfo = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Thông tin yêu cầu máu</Text>
      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <View style={styles.infoItemIcon}>
            <MaterialIcons name="bloodtype" size={20} color="#FF6B6B" />
            <Text style={styles.infoLabel}>Nhóm máu</Text>
          </View>
          <Text style={styles.infoValue}>
            {requestDetail?.groupId?.name || "N/A"}
          </Text>
        </View>

        <View style={styles.infoItem}>
          <View style={styles.infoItemIcon}>
            <MaterialIcons name="medical-services" size={20} color="#FF6B6B" />
            <Text style={styles.infoLabel}>Thành phần máu</Text>
          </View>
          <Text style={styles.infoValue}>
            {requestDetail?.componentId?.name || "N/A"}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderMedicalDocuments = () =>
    requestDetail?.medicalDocumentUrl &&
    requestDetail?.medicalDocumentUrl?.length > 0 && (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Giấy tờ y tế</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.documentsScroll}
        >
          {requestDetail?.medicalDocumentUrl?.map((url, index) => (
            <Image
              key={index}
              source={{ uri: url }}
              style={styles.medicalDocument}
              resizeMode="cover"
            />
          ))}
        </ScrollView>
      </View>
    );

  const renderRegistrationStatus = () => {
    if (requestDetail.status !== "approved") {
      return null;
    }

    // Kiểm tra nếu người dùng hiện tại là người yêu cầu máu
    if (requestDetail.userId?._id === user._id) {
      return (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Danh sách người đăng ký</Text>
          {volunteers?.length > 0 ? (
            volunteers
              .filter((v) => v.status === "approved")
              .map((volunteer, index) => (
                <View key={index} style={styles.volunteerItem}>
                  <View style={styles.volunteerInfo}>
                    <Image
                      source={{
                        uri:
                          volunteer.userId?.avatar ||
                          "https://via.placeholder.com/100",
                      }}
                      style={styles.volunteerAvatar}
                    />
                    <View style={styles.volunteerDetails}>
                      <Text style={styles.volunteerName}>
                        {volunteer.userId?.fullName}
                      </Text>
                      <Text style={styles.volunteerContact}>
                        {volunteer.phone}
                      </Text>
                      <Text style={styles.volunteerContact}>
                        {volunteer.email}
                      </Text>
                    </View>
                  </View>
                  {volunteer.note && (
                    <Text style={styles.volunteerNote}>
                      Ghi chú: {volunteer.note}
                    </Text>
                  )}
                </View>
              ))
          ) : (
            <Text style={styles.emptyText}>
              Chưa có người đăng ký được duyệt
            </Text>
          )}
        </View>
      );
    }

    // Tìm trạng thái đăng ký của người dùng hiện tại
    const userRegistration = volunteers?.find(
      (v) => v.userId?._id === user._id
    );

    if (userRegistration) {
      if (userRegistration.status === "pending") {
        return (
          <View style={styles.registrationStatusCard}>
            <View style={styles.registrationStatusHeader}>
              <MaterialIcons name="hourglass-empty" size={24} color="#FFA000" />
              <Text
                style={[styles.registrationStatusTitle, { color: "#FFA000" }]}
              >
                Đang chờ duyệt
              </Text>
            </View>
            <Text style={styles.registrationStatusText}>
              Yêu cầu đăng ký của bạn đang được xem xét. Vui lòng chờ phản hồi
              từ người cần máu.
            </Text>
            <View
              style={[
                styles.registrationStatusInfo,
                { backgroundColor: "#FFF3E0" },
              ]}
            >
              <MaterialIcons name="info" size={20} color="#FFA000" />
              <Text
                style={[
                  styles.registrationStatusInfoText,
                  { color: "#FFA000" },
                ]}
              >
                Bạn sẽ nhận được thông báo khi yêu cầu được duyệt.
              </Text>
            </View>
          </View>
        );
      } else if (userRegistration.status === "approved") {
        return (
          <View style={styles.registrationStatusCard}>
            <View style={styles.registrationStatusHeader}>
              <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
              <Text style={styles.registrationStatusTitle}>Đã được duyệt</Text>
            </View>
            <Text style={styles.registrationStatusText}>
              Yêu cầu đăng ký của bạn đã được chấp nhận. Người cần máu sẽ liên
              hệ với bạn trong thời gian sớm nhất.
            </Text>
            <View style={styles.registrationStatusInfo}>
              <MaterialIcons name="info" size={20} color="#1E88E5" />
              <Text style={styles.registrationStatusInfoText}>
                Vui lòng chú ý điện thoại để không bỏ lỡ cuộc gọi từ người cần
                máu.
              </Text>
            </View>
          </View>
        );
      } else if (userRegistration.status === "rejected") {
        return (
          <View style={styles.registrationStatusCard}>
            <View style={styles.registrationStatusHeader}>
              <MaterialIcons name="cancel" size={24} color="#F44336" />
              <Text
                style={[styles.registrationStatusTitle, { color: "#F44336" }]}
              >
                Đã bị từ chối
              </Text>
            </View>
            <Text style={styles.registrationStatusText}>
              Rất tiếc, yêu cầu đăng ký của bạn đã bị từ chối.
            </Text>
          </View>
        );
      }
    }

    return (
      <TouchableOpacity
        style={[styles.registerButton, registering && styles.disabledButton]}
        onPress={handleOpenModal}
        disabled={registering}
      >
        <MaterialIcons
          name={registering ? "hourglass-empty" : "volunteer-activism"}
          size={24}
          color="#FFFFFF"
        />
        <Text style={styles.registerButtonText}>
          {registering ? "Đang đăng ký..." : "Đăng ký hỗ trợ"}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchData} />
        }
      >
        {renderFacilityInfo()}
        {renderRequestStats()}
        {renderBloodInfo()}
        {renderPatientInfo()}
        {renderMedicalDocuments()}
        {requestDetail?.note && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Ghi chú</Text>
            <Text style={styles.noteText}>{requestDetail.note}</Text>
          </View>
        )}
        {renderRegistrationStatus()}
      </ScrollView>
      <RequestSupportRegistrationModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleRegister}
        contactInfo={contactInfo}
        setContactInfo={setContactInfo}
        loading={registering}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    paddingTop: Platform.OS === "android" ? 40 : 0,
  },
  content: {
    flex: 1,
  },
  header: {
    backgroundColor: "#FF6B6B",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    textShadowColor: "rgba(0,0,0,0.1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    margin: 16,
    marginBottom: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#E3E8F0",
  },
  cardHeader: {
    marginBottom: 16,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A237E",
    flex: 1,
    marginLeft: 12,
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: "row",
    padding: 16,
    paddingVertical: 0,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E3E8F0",
  },
  statNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A237E",
    marginVertical: 4,
    textAlign: "center",
  },
  statLabel: {
    fontSize: 12,
    color: "#5C6BC0",
    textAlign: "center",
  },
  infoGrid: {
    gap: 12,
  },
  infoItem: {
    backgroundColor: "#EEF2F7",
    padding: 12,
    borderRadius: 12,
  },
  infoItemIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 13,
    color: "#5C6BC0",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 15,
    color: "#1A237E",
    fontWeight: "600",
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  documentsScroll: {
    marginTop: 12,
  },
  medicalDocument: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E3E8F0",
  },
  noteText: {
    fontSize: 15,
    color: "#2D3436",
    fontStyle: "italic",
    lineHeight: 20,
  },
  linkText: {
    color: "#2196F3",
    textDecorationLine: "underline",
  },
  registerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
    margin: 16,
    padding: 16,
    borderRadius: 16,
    gap: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  registerButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    textShadowColor: "rgba(0,0,0,0.1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  disabledButton: {
    opacity: 0.7,
    backgroundColor: "#90A4AE",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A237E",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: "#5C6BC0",
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E3E8F0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#F8F9FA",
  },
  noteInput: {
    height: 80,
    textAlignVertical: "top",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F5F5F5",
  },
  confirmButton: {
    backgroundColor: "#4CAF50",
  },
  cancelButtonText: {
    color: "#666666",
    fontSize: 16,
    fontWeight: "600",
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  registrationStatusCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    margin: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#E3E8F0",
  },
  registrationStatusHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  registrationStatusTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  registrationStatusText: {
    fontSize: 15,
    color: "#2D3436",
    lineHeight: 20,
    marginBottom: 16,
  },
  registrationStatusInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#E3F2FD",
    padding: 12,
    borderRadius: 8,
  },
  registrationStatusInfoText: {
    flex: 1,
    fontSize: 14,
    color: "#1E88E5",
    lineHeight: 20,
  },
  volunteerItem: {
    backgroundColor: "#F5F7FA",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  volunteerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  volunteerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E3E8F0",
  },
  volunteerDetails: {
    flex: 1,
  },
  volunteerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A237E",
    marginBottom: 4,
  },
  volunteerContact: {
    fontSize: 14,
    color: "#5C6BC0",
  },
  volunteerNote: {
    fontSize: 14,
    color: "#666666",
    fontStyle: "italic",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E3E8F0",
  },
  emptyText: {
    fontSize: 14,
    color: "#666666",
    fontStyle: "italic",
    textAlign: "center",
    padding: 16,
  },
});

export default SupportRequestDetailScreen;
