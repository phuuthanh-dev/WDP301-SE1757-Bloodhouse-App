import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  SafeAreaView,
  RefreshControl,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import bloodDeliveryAPI from "@/apis/bloodDeliveryAPI";
import { formatDateTime } from "@/utils/formatHelpers";
import Header from "@/components/Header";
import { useFacility } from "@/contexts/FacilityContext";
import {
  getStatusColorDelivery,
  getStatusNameDelivery,
} from "@/constants/deliveryStatus";
import Toast from "react-native-toast-message";

const DeliveryDetailScreen = ({ route }) => {
  const { id, action } = route.params;
  const { facilityId } = useFacility();
  const navigation = useNavigation();
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchDelivery = async () => {
    try {
      setLoading(true);
      const response = await bloodDeliveryAPI.HandleBloodDelivery(
        `/${id}/facility/${facilityId}`
      );
      setDelivery(response.data);
    } catch (error) {
      console.error("Error fetching delivery:", error);
      Alert.alert(
        "Lỗi",
        "Không thể tải thông tin đơn giao. Vui lòng thử lại sau."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDelivery();
  }, [id]);

  useEffect(() => {
    if (action && delivery) {
      switch (action) {
        case "start":
          handleStartDelivery();
          break;
        case "complete":
          handleCompleteDelivery();
          break;
        case "report":
          handleReportIssue();
          break;
      }
    }
  }, [delivery, action]);

  const handleStartDelivery = async () => {
    try {
      Alert.alert(
        "Xác nhận",
        "Bạn có chắc chắn muốn bắt đầu giao đơn hàng này?",
        [
          {
            text: "Hủy",
            style: "cancel",
          },
          {
            text: "Đồng ý",
            onPress: async () => {
              setLoading(true);
              // TODO: Implement API call to start delivery
              // await bloodDeliveryAPI.startDelivery(id);
              Alert.alert("Thành công", "Bắt đầu giao hàng thành công!", [
                { text: "OK", onPress: () => fetchDelivery() },
              ]);
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error starting delivery:", error);
      Alert.alert("Lỗi", "Không thể bắt đầu giao hàng. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteDelivery = () => {
    Alert.alert("Xác nhận giao hàng", "Vui lòng chọn phương thức xác nhận:", [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Quét mã QR",
        onPress: () =>
          navigation.navigate("QRScanner", {
            mode: "delivery_verification",
            expectedDeliveryId: delivery._id,
            expectedType: "blood_delivery",
            expectedRequestId: delivery.bloodRequestId._id,
            expectedFacilityId: delivery.facilityId._id,
            expectedRecipientId: delivery.bloodRequestId.userId._id,
          }),
      },
      {
        text: "Nhập thông tin",
        onPress: () =>
          navigation.navigate("DeliveryConfirm", {
            id,
            requireReceiverInfo: true,
          }),
      },
    ]);
  };

  const handleReportIssue = () => {
    Alert.alert(
      "Xác nhận",
      "Bạn có chắc chắn muốn báo cáo sự cố cho đơn hàng này?",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Đồng ý",
          onPress: () => navigation.navigate("DeliveryReport", { id }),
        },
      ]
    );
  };

  const renderActionButtons = () => {
    if (loading) {
      return (
        <View style={[styles.actionButton, styles.primaryButton]}>
          <Text style={styles.actionButtonText}>Đang xử lý...</Text>
        </View>
      );
    }

    switch (delivery.status) {
      case "pending":
        return (
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={handleStartDelivery}
          >
            <MaterialIcons name="play-arrow" size={24} color="white" />
            <Text style={styles.actionButtonText}>Bắt đầu giao hàng</Text>
          </TouchableOpacity>
        );
      case "in_transit":
        return (
          <>
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton]}
              onPress={handleCompleteDelivery}
            >
              <MaterialIcons name="check" size={24} color="white" />
              <Text style={styles.actionButtonText}>Xác nhận đã giao</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={handleReportIssue}
            >
              <MaterialIcons name="error" size={24} color="#FF6B6B" />
              <Text style={[styles.actionButtonText, { color: "#FF6B6B" }]}>
                Báo cáo sự cố
              </Text>
            </TouchableOpacity>
          </>
        );
      case "delivered":
        return (
          <View style={[styles.actionButton, styles.successButton]}>
            <MaterialIcons name="check-circle" size={24} color="white" />
            <Text style={styles.actionButtonText}>Đã giao thành công</Text>
          </View>
        );
      case "failed":
        return (
          <View style={[styles.actionButton, styles.failedButton]}>
            <MaterialIcons name="error" size={24} color="white" />
            <Text style={styles.actionButtonText}>Giao hàng thất bại</Text>
          </View>
        );
      default:
        return null;
    }
  };

  if (!delivery) return null;

  const renderBloodUnit = (unit) => (
    <View key={unit._id} style={styles.bloodUnit}>
      <View style={styles.bloodUnitHeader}>
        <View style={styles.bloodUnitType}>
          <MaterialIcons name="opacity" size={20} color="#FF6B6B" />
          <Text style={styles.bloodUnitCode}>
            Mã đơn vị: {unit.unitId.code}
          </Text>
        </View>
      </View>
      <View style={styles.bloodUnitDetails}>
        <View style={styles.bloodUnitInfo}>
          <Text style={styles.infoLabel}>Nhóm máu:</Text>
          <Text style={styles.infoValue}>{unit.unitId.bloodGroupId.name}</Text>
        </View>
        <View style={styles.bloodUnitInfo}>
          <Text style={styles.infoLabel}>Thành phần:</Text>
          <Text style={styles.infoValue}>{unit.unitId.componentId.name}</Text>
        </View>
        <View style={styles.bloodUnitInfo}>
          <Text style={styles.infoLabel}>Số lượng:</Text>
          <Text style={styles.infoValue}>{unit.quantity}ml</Text>
        </View>
        <View style={styles.bloodUnitInfo}>
          <Text style={styles.infoLabel}>Hạn sử dụng:</Text>
          <Text style={styles.infoValue}>
            {formatDateTime(unit.unitId.expiresAt)}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Chi tiết đơn giao" showBackButton />
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchDelivery} />
        }
      >
        {/* Status Card */}
        <View style={styles.card}>
          <View style={styles.statusHeader}>
            <MaterialIcons name="local-shipping" size={24} color="#636E72" />
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    getStatusColorDelivery(delivery.status) + "20",
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColorDelivery(delivery.status) },
                ]}
              >
                {getStatusNameDelivery(delivery.status)}
              </Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mã đơn:</Text>
            <Text style={styles.infoValue}>#{delivery.code}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Thời gian hẹn:</Text>
            <Text style={styles.infoValue}>
              {formatDateTime(delivery.bloodRequestId.scheduledDeliveryDate)}
            </Text>
          </View>
          {delivery.note && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ghi chú:</Text>
              <Text style={styles.infoValue}>{delivery.note}</Text>
            </View>
          )}
        </View>

        {/* Delivery Route Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Lộ trình giao hàng</Text>
          <View style={styles.routeContainer}>
            {/* Origin */}
            <View style={styles.routePoint}>
              <View style={styles.facilityIcon}>
                <MaterialIcons
                  name="local-hospital"
                  size={24}
                  color="#FF6B6B"
                />
              </View>
              <View style={styles.facilityDetails}>
                <Text style={styles.facilityName} numberOfLines={1}>
                  {delivery.facilityId.name}
                </Text>
                <Text style={styles.facilityAddress} numberOfLines={2}>
                  {delivery.facilityId.address}
                </Text>
              </View>
            </View>

            {/* Direction Arrow */}
            <View style={styles.directionContainer}>
              <MaterialIcons name="arrow-forward" size={24} color="#636E72" />
            </View>

            {/* Destination */}
            <View style={styles.routePoint}>
              <View style={styles.facilityIcon}>
                <MaterialIcons name="location-on" size={24} color="#FF6B6B" />
              </View>
              <View style={styles.facilityDetails}>
                <Text style={styles.facilityName} numberOfLines={1}>
                  Điểm giao hàng
                </Text>
                <Text style={styles.facilityAddress} numberOfLines={2}>
                  {delivery.facilityToAddress}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.mapButton}
            onPress={() => navigation.navigate("DeliveryMap", { id })}
          >
            <MaterialIcons name="map" size={20} color="#FF6B6B" />
            <Text style={styles.mapButtonText}>Xem trên bản đồ</Text>
          </TouchableOpacity>
        </View>

        {/* Contact Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Thông tin người nhận</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Người nhận:</Text>
            <Text style={styles.infoValue}>
              {delivery.bloodRequestId.userId.fullName}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Số điện thoại:</Text>
            <Text style={styles.infoValue}>
              {delivery.bloodRequestId.userId.phone}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>
              {delivery.bloodRequestId.userId.email}
            </Text>
          </View>
        </View>

        {/* Blood Units */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Danh sách đơn vị máu</Text>
          {delivery.bloodUnits.map(renderBloodUnit)}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>{renderActionButtons()}</View>
      </ScrollView>
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
  card: {
    backgroundColor: "white",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#E9ECEF",
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: "#636E72",
  },
  infoValue: {
    fontSize: 14,
    color: "#2D3436",
    fontWeight: "500",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3436",
    marginBottom: 12,
  },
  routeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  routePoint: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
  },
  facilityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFF0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  facilityDetails: {
    alignItems: "center",
  },
  facilityName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2D3436",
    textAlign: "center",
  },
  facilityAddress: {
    fontSize: 12,
    color: "#636E72",
    textAlign: "center",
  },
  directionContainer: {
    width: 48,
    alignItems: "center",
  },
  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF0F0",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  mapButtonText: {
    fontSize: 14,
    color: "#FF6B6B",
    marginLeft: 8,
    fontWeight: "500",
  },
  bloodUnit: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  bloodUnitHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  bloodUnitType: {
    flexDirection: "row",
    alignItems: "center",
  },
  bloodUnitCode: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2D3436",
    marginLeft: 8,
  },
  bloodUnitBarcode: {
    fontSize: 12,
    color: "#636E72",
  },
  bloodUnitDetails: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
  },
  bloodUnitInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  actionContainer: {
    padding: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: "#FF6B6B",
  },
  secondaryButton: {
    backgroundColor: "#FFF0F0",
    borderWidth: 1,
    borderColor: "#FF6B6B",
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "white",
    marginLeft: 8,
  },
  successButton: {
    backgroundColor: "#00B894",
  },
  failedButton: {
    backgroundColor: "#FF7675",
  },
});

export default DeliveryDetailScreen;
