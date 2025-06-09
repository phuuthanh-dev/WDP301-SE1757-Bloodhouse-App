import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Linking,
  SafeAreaView,
  RefreshControl,
  Modal,
  Image,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { formatDateTime } from "@/utils/formatHelpers";
import Toast from "react-native-toast-message";
import bloodDonationRegistrationAPI from "@/apis/bloodDonationRegistration";
import {
  getStatusDonationColor,
  getStatusDonationName,
} from "@/constants/donationStatus";

const QRCodeModal = ({ visible, onClose, qrCodeUrl }) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Mã QR xác nhận hiến máu</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#636E72" />
            </TouchableOpacity>
          </View>

          <View style={styles.qrCodeContainer}>
            <Image
              source={{ uri: qrCodeUrl }}
              style={styles.qrCode}
              resizeMode="contain"
            />
          </View>

          <View style={styles.notesContainer}>
            <View style={styles.notesTitleContainer}>
              <MaterialIcons name="info-outline" size={24} color="#FF6B6B" />
              <Text style={styles.notesTitle}>Lưu ý quan trọng</Text>
            </View>

            <View style={styles.notesContent}>
              <View style={styles.noteItem}>
                <View style={styles.noteIconContainer}>
                  <MaterialIcons
                    name="qr-code-scanner"
                    size={20}
                    color="#FF6B6B"
                  />
                </View>
                <Text style={styles.noteText}>
                  Vui lòng giữ mã QR này để xuất trình cho nhân viên khi đến
                  hiến máu
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.noteItem}>
                <View style={styles.noteIconContainer}>
                  <MaterialIcons name="security" size={20} color="#FF6B6B" />
                </View>
                <Text style={styles.noteText}>
                  Mã QR này là duy nhất và chỉ có giá trị cho lần hiến máu này
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.noteItem}>
                <View style={styles.noteIconContainer}>
                  <MaterialIcons
                    name="verified-user"
                    size={20}
                    color="#FF6B6B"
                  />
                </View>
                <Text style={styles.noteText}>
                  Việc quét mã QR sẽ giúp xác nhận danh tính của bạn và đảm bảo
                  an toàn
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function DonationRegistrationDetailScreen({
  route,
  navigation,
}) {
  const { donationReId } = route.params;
  const [registration, setRegistration] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isQRModalVisible, setIsQRModalVisible] = useState(false);

  useEffect(() => {
    fetchRegistration();
  }, [donationReId]);

  const fetchRegistration = async () => {
    try {
      setIsLoading(true);
      // Replace with your actual API call
      const response =
        await bloodDonationRegistrationAPI.HandleBloodDonationRegistration(
          `/${donationReId}`
        );
      if (response.status === 200) {
        setRegistration(response.data);
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể tải dữ liệu. Vui lòng thử lại sau.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenMap = () => {
    const scheme = Platform.select({
      ios: "maps:0,0?q=",
      android: "geo:0,0?q=",
    });
    const latLng = `${registration.location.coordinates[1]},${registration.location.coordinates[0]}`;
    const label = registration.facilityId.address;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });

    Linking.openURL(url);
  };

  const handleCall = () => {
    Linking.openURL(`tel:${registration.facilityId.contactPhone}`);
  };

  const showQRCode = () => {
    setIsQRModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.title}>Chi tiết đăng ký hiến máu</Text>
          <Text style={styles.subtitle}>
            Thông tin chi tiết về lịch hẹn hiến máu của bạn
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchRegistration}
          />
        }
      >
        {registration?.status === "registered" && registration?.qrCodeUrl && (
          <View style={styles.section}>
            <TouchableOpacity style={styles.qrButton} onPress={showQRCode}>
              <MaterialIcons name="qr-code-2" size={24} color="white" />
              <Text style={styles.qrButtonText}>Hiển thị mã QR xác nhận</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Timeline Section */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.timelineCard}
            onPress={() =>
              navigation.navigate("DonationTimeline", {
                currentStatus: registration?.status,
                registrationId: registration?._id,
              })
            }
          >
            <View style={styles.timelineHeader}>
              <View style={styles.timelineIcon}>
                <MaterialIcons name="timeline" size={24} color="#FF6B6B" />
                <Text style={styles.timelineTitle}>Tiến trình hiến máu</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#B2BEC3" />
            </View>

            <View style={styles.timelineInfo}>
              <View style={styles.timelineStatusContainer}>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: getStatusDonationColor(
                        registration?.status
                      ),
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.timelineStatus,
                    { color: getStatusDonationColor(registration?.status) },
                  ]}
                >
                  {getStatusDonationName(registration?.status)}
                </Text>
              </View>
              <Text style={styles.timelineDescription}>
                Theo dõi chi tiết quá trình hiến máu của bạn
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Donor Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="person" size={24} color="#FF6B6B" />
            <Text style={styles.sectionTitle}>Thông tin người hiến máu</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Họ và tên:</Text>
            <Text style={styles.value}>{registration?.userId?.fullName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Số điện thoại:</Text>
            <Text style={styles.value}>{registration?.userId?.phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{registration?.userId?.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Nhóm máu:</Text>
            <Text style={styles.value}>
              {registration?.userId?.bloodId?.name}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Giới tính:</Text>
            <Text style={styles.value}>
              {registration?.userId?.sex === "male" ? "Nam" : "Nữ"}
            </Text>
          </View>
        </View>

        {/* Donation Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="bloodtype" size={24} color="#FF6B6B" />
            <Text style={styles.sectionTitle}>Thông tin đăng ký hiến máu</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Mã đăng ký:</Text>
            <Text style={styles.value}>{registration?.code}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Lượng máu dự kiến:</Text>
            <Text style={styles.value}>
              {registration?.expectedQuantity} ml
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Thời gian hẹn:</Text>
            <Text style={styles.value}>
              {formatDateTime(registration?.preferredDate)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Trạng thái:</Text>
            <Text
              style={[
                styles.value,
                { color: getStatusDonationColor(registration?.status) },
              ]}
            >
              {getStatusDonationName(registration?.status)}
            </Text>
          </View>
        </View>

        {/* Facility Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="local-hospital" size={24} color="#FF6B6B" />
            <Text style={styles.sectionTitle}>Thông tin cơ sở y tế</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Tên cơ sở:</Text>
            <Text style={styles.value}>{registration?.facilityId?.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Số điện thoại:</Text>
            <TouchableOpacity onPress={handleCall}>
              <Text style={[styles.value, styles.link]}>
                {registration?.facilityId?.contactPhone}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>
              {registration?.facilityId?.contactEmail}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Địa chỉ:</Text>
            <TouchableOpacity
              onPress={handleOpenMap}
              style={styles.addressContainer}
            >
              <Text style={[styles.value, styles.link]} numberOfLines={2}>
                {registration?.facilityId?.address}
              </Text>
              <MaterialIcons name="location-on" size={20} color="#FF6B6B" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Additional Notes Section */}
        {registration?.notes && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="notes" size={24} color="#FF6B6B" />
              <Text style={styles.sectionTitle}>Ghi chú thêm</Text>
            </View>
            <Text style={styles.noteText}>{registration?.notes}</Text>
          </View>
        )}

        <QRCodeModal
          visible={isQRModalVisible}
          onClose={() => setIsQRModalVisible(false)}
          qrCodeUrl={registration?.qrCodeUrl}
        />
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    alignItems: "flex-start",
    flex: 1,
    marginLeft: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    textAlign: "left",
  },
  subtitle: {
    fontSize: 14,
    color: "white",
    opacity: 0.9,
    textAlign: "center",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D3436",
    marginLeft: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  label: {
    width: 140,
    fontSize: 14,
    color: "#636E72",
  },
  value: {
    flex: 1,
    fontSize: 14,
    color: "#2D3436",
    fontWeight: "500",
  },
  link: {
    color: "#FF6B6B",
    textDecorationLine: "underline",
  },
  addressContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  noteText: {
    fontSize: 14,
    color: "#2D3436",
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2D3436",
  },
  qrCodeContainer: {
    alignItems: "center",
    marginBottom: 24,
    padding: 20,
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
  },
  qrCode: {
    width: 250,
    height: 250,
  },
  notesContainer: {
    backgroundColor: "#FFF5F5",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#FFE5E5",
  },
  notesTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFE5E5",
    padding: 16,
    gap: 8,
  },
  notesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF6B6B",
  },
  notesContent: {
    padding: 16,
  },
  noteItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
  },
  noteIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFE5E5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  noteText: {
    flex: 1,
    fontSize: 15,
    color: "#2D3436",
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: "#FFE5E5",
    marginHorizontal: 44,
  },
  qrButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF6B6B",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  qrButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  timelineCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
  },
  timelineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  timelineIcon: {
    flexDirection: "row",
    alignItems: "center",
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D3436",
    marginLeft: 8,
  },
  timelineInfo: {
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingTop: 12,
  },
  timelineStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  timelineStatus: {
    fontSize: 16,
    fontWeight: "500",
  },
  timelineDescription: {
    fontSize: 14,
    color: "#636E72",
  },
});
