import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  Linking,
  Dimensions,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  Modal,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { formatDateTime } from "@/utils/formatHelpers";
import bloodDeliveryAPI from "@/apis/bloodDeliveryAPI";
import bloodRequestAPI from "@/apis/bloodRequestAPI";
import Toast from "react-native-toast-message";
import { STATUS_DELIVERY } from "@/constants/receiveBloodStatus";

const DeliveryTrackingCard = ({ bloodDelivery, onPress }) => {
  const renderDeliveryStatus = () => {
    if (bloodDelivery?.status === "pending") {
      return (
        <Text style={[styles.deliveryStatus, { color: "#FBBF24" }]}>
          Chờ xử lý
        </Text>
      );
    } else if (bloodDelivery?.status === "in_transit") {
      return (
        <Text style={[styles.deliveryStatus, { color: "#0EA5E9" }]}>
          Đang vận chuyển
        </Text>
      );
    } else if (bloodDelivery?.status === "delivered") {
      return (
        <Text style={[styles.deliveryStatus, { color: "#2ED573" }]}>
          Đã giao hàng
        </Text>
      );
    } else if (bloodDelivery?.status === "cancelled") {
      return (
        <Text style={[styles.deliveryStatus, { color: "#FF4757" }]}>
          Đã hủy
        </Text>
      );
    }
  };

  const deliveryStatusColor = {
    pending: "#FBBF24",
    in_transit: "#0EA5E9",
    delivered: "#2ED573",
    cancelled: "#FF4757",
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <MaterialIcons name="local-shipping" size={24} color="#FF6B6B" />
        <Text style={styles.sectionTitle}>Thông tin vận chuyển</Text>
      </View>

      <TouchableOpacity style={styles.deliveryCard} onPress={onPress}>
        <View style={styles.deliveryHeader}>
          <View style={styles.deliveryCarrier}>
            <MaterialIcons name="local-shipping" size={20} color="#2D3436" />
            <Text style={styles.carrierName}>
              Được{" "}
              <Text style={styles.carrierNameBold}>
                {bloodDelivery.transporterId?.userId?.fullName}
              </Text>{" "}
              vận chuyển
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#B2BEC3" />
        </View>

        <View style={styles.deliveryInfo}>
          <Text style={styles.trackingId}>
            Mã vận đơn: {bloodDelivery.code}
          </Text>
          <View style={styles.deliveryStatusContainer}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: deliveryStatusColor[bloodDelivery.status] },
              ]}
            />
            {renderDeliveryStatus()}
          </View>
        </View>

        <View style={styles.deliveryFooter}>
          <Text style={styles.deliveryTime}>
            Thời gian dự kiến:{" "}
            {formatDateTime(bloodDelivery.bloodRequestId.scheduledDeliveryDate)}
          </Text>
          <Text style={styles.recipient}>
            Cơ sở nhận: {bloodDelivery.facilityToAddress}
          </Text>
          <Text style={styles.recipient}>
            Địa chỉ nhận: {bloodDelivery.facilityId?.address}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

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
            <Text style={styles.modalTitle}>Mã QR xác nhận nhận máu</Text>
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
                  Vui lòng giữ mã QR này để xuất trình cho nhân viên vận chuyển
                  khi nhận máu
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.noteItem}>
                <View style={styles.noteIconContainer}>
                  <MaterialIcons name="security" size={20} color="#FF6B6B" />
                </View>
                <Text style={styles.noteText}>
                  Mã QR này là duy nhất và chỉ có giá trị cho đơn giao hàng này
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

export default function ReceiveRequestDetailScreen({ route, navigation }) {
  const { requestId } = route.params;
  const [bloodDelivery, setBloodDelivery] = useState(null);
  const [request, setRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isQRModalVisible, setIsQRModalVisible] = useState(false);

  useEffect(() => {
    fetchRequest();
  }, [requestId]);

  useEffect(() => {
    if (STATUS_DELIVERY.includes(request?.status)) {
      fetchBloodDelivery();
    }
  }, [request]);

  const fetchBloodDelivery = async () => {
    try {
      setIsLoading(true);
      const response = await bloodDeliveryAPI.HandleBloodDelivery(
        `/request/${request._id}`
      );
      setBloodDelivery(response.data);
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

  const fetchRequest = async () => {
    try {
      setIsLoading(true);
      const response = await bloodRequestAPI.HandleBloodRequest(
        `/user/${requestId}`
      );
      if (response.status === 200) {
        setRequest(response.data);
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
    const latLng = `${request.location.coordinates[1]},${request.location.coordinates[0]}`;
    const label = request.address;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });

    Linking.openURL(url);
  };

  const handleCall = () => {
    Linking.openURL(`tel:${request.patientPhone}`);
  };

  const handleViewDeliveryDetails = () => {
    navigation.navigate("DeliveryTrackingScreen", {
      deliveryId: bloodDelivery._id,
    });
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
          <Text style={styles.title}>Chi tiết yêu cầu nhận máu</Text>
          <Text style={styles.subtitle}>
            Thông tin chi tiết về yêu cầu nhận máu của bạn
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={() => {
            fetchRequest();
            fetchBloodDelivery();
          }} />
        }
      >
        {STATUS_DELIVERY.includes(request?.status) &&
          bloodDelivery && (
            <DeliveryTrackingCard
              bloodDelivery={bloodDelivery}
              onPress={handleViewDeliveryDetails}
            />
          )}

        {request?.status === "assigned" && request?.qrCodeUrl && (
          <View style={styles.section}>
            <TouchableOpacity style={styles.qrButton} onPress={showQRCode}>
              <MaterialIcons name="qr-code-2" size={24} color="white" />
              <Text style={styles.qrButtonText}>Hiển thị mã QR xác nhận</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Blood Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="bloodtype" size={24} color="#FF6B6B" />
            <Text style={styles.sectionTitle}>Thông tin yêu cầu máu</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Nhóm máu:</Text>
            <Text style={styles.value}>{request?.groupId?.name}</Text>
          </View>
          {request?.componentId?.name && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Thành phần máu:</Text>
              <Text style={styles.value}>{request?.componentId?.name}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Số lượng:</Text>
            <Text style={styles.value}>{request?.quantity} đơn vị</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Thời gian mong muốn:</Text>
            <Text style={styles.value}>
              {formatDateTime(request?.preferredDate)}
            </Text>
          </View>
        </View>

        {/* Patient Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="person" size={24} color="#FF6B6B" />
            <Text style={styles.sectionTitle}>Thông tin bệnh nhân</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Tên bệnh nhân:</Text>
            <Text style={styles.value}>{request?.patientName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Số điện thoại:</Text>
            <TouchableOpacity onPress={handleCall}>
              <Text style={[styles.value, styles.link]}>
                {request?.patientPhone}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Địa chỉ cơ sở điều trị:</Text>
            <TouchableOpacity
              onPress={handleOpenMap}
              style={styles.addressContainer}
            >
              <Text style={[styles.value, styles.link]} numberOfLines={2}>
                {request?.address}
              </Text>
              <MaterialIcons name="location-on" size={20} color="#FF6B6B" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Medical Documents Section */}
        {request?.medicalDocumentUrl &&
          request?.medicalDocumentUrl?.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="description" size={24} color="#FF6B6B" />
                <Text style={styles.sectionTitle}>Giấy tờ y tế</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {request?.medicalDocumentUrl?.map((url, index) => (
                  <Image
                    key={index}
                    source={{ uri: url }}
                    style={styles.documentImage}
                  />
                ))}
              </ScrollView>
            </View>
          )}

        {/* Additional Information Section */}
        {request?.note && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="notes" size={24} color="#FF6B6B" />
              <Text style={styles.sectionTitle}>Ghi chú thêm</Text>
            </View>
            <Text style={styles.noteText}>{request?.note}</Text>
          </View>
        )}

        {/* Staff Information Section */}
        {request?.staffId && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons
                name="admin-panel-settings"
                size={24}
                color="#FF6B6B"
              />
              <Text style={styles.sectionTitle}>Thông tin xử lý</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Nhân viên xử lý:</Text>
              <Text style={styles.value}>{request?.staffId?.fullName}</Text>
            </View>
          </View>
        )}

        <QRCodeModal
          visible={isQRModalVisible}
          onClose={() => setIsQRModalVisible(false)}
          qrCodeUrl={request?.qrCodeUrl}
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
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  urgentBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFE5E5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  urgentText: {
    marginLeft: 4,
    color: "#FF6B6B",
    fontWeight: "500",
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
  documentImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginRight: 12,
  },
  noteText: {
    fontSize: 14,
    color: "#2D3436",
    lineHeight: 20,
  },
  deliveryCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
  },
  deliveryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  deliveryCarrier: {
    flexDirection: "row",
    alignItems: "center",
  },
  carrierName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2D3436",
    marginLeft: 8,
  },
  deliveryInfo: {
    marginBottom: 12,
  },
  trackingId: {
    fontSize: 14,
    color: "#636E72",
    marginBottom: 8,
  },
  deliveryStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#00B894",
    marginRight: 8,
  },
  deliveryStatus: {
    fontSize: 14,
    color: "#00B894",
    fontWeight: "500",
  },
  deliveryFooter: {
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingTop: 12,
  },
  deliveryTime: {
    fontSize: 13,
    color: "#636E72",
    marginBottom: 4,
  },
  recipient: {
    fontSize: 13,
    color: "#636E72",
    marginBottom: 4,
  },
  carrierNameBold: {
    fontWeight: "bold",
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
});
