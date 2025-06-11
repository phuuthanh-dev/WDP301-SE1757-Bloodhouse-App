import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import bloodDeliveryAPI from "@/apis/bloodDeliveryAPI";
import { formatDateTime } from "@/utils/formatHelpers";
import Header from "@/components/Header";
import { authSelector } from "@/redux/reducers/authReducer";
import { useSelector } from "react-redux";
import { useFacility } from "@/contexts/FacilityContext";
import {
  getStatusColorDelivery,
  getStatusNameDelivery,
} from "@/constants/deliveryStatus";
import Toast from "react-native-toast-message";
import { useSocket } from "@/contexts/SocketContext";

const DeliveryListScreen = ({ navigation }) => {
  const { user } = useSelector(authSelector);
  const { facilityId } = useFacility();
  const { startLocationTracking } = useSocket();
  const [deliveries, setDeliveries] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchDeliveries();
    }, [])
  );

  useEffect(() => {
    fetchDeliveries();
  }, [selectedStatus]);

  const fetchDeliveries = async () => {
    try {
      const status = selectedStatus === "all" ? "" : selectedStatus;
      const response = await bloodDeliveryAPI.HandleBloodDelivery(
        `/all/transporter/facility/${facilityId}?status=${status}`
      );
      setDeliveries(response.data.data);
    } catch (error) {
      console.error("Error fetching deliveries:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDeliveries();
    setRefreshing(false);
  };

  const renderStatusFilter = () => {
    const filters = [
      { id: "all", label: "Tất cả" },
      { id: "pending", label: "Chờ giao" },
      { id: "in_transit", label: "Đang giao" },
      { id: "delivered", label: "Đã giao" },
      { id: "failed", label: "Thất bại" },
    ];

    return (
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filters}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedStatus === item.id && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedStatus(item.id)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedStatus === item.id && styles.filterTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.filterList}
        />
      </View>
    );
  };

  const handleStartDelivery = async (deliveryId) => {
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
            try {
              const response = await bloodDeliveryAPI.HandleBloodDelivery(
                `/${deliveryId}/start/facility/${facilityId}`,
                {},
                "put"
              );
              if (response.status === 200) {
                // Start location tracking after successful API call
                try {
                  await startLocationTracking(deliveryId);
                  Toast.show({
                    type: "success",
                    text1: "Thành công",
                    text2: "Bắt đầu giao hàng và theo dõi vị trí thành công!",
                  });
                  fetchDeliveries();
                  // Navigate to delivery map screen
                  navigation.navigate("DeliveryMap", { id: deliveryId });
                } catch (error) {
                  console.error("Error starting location tracking:", error);
                  Toast.show({
                    type: "error",
                    text1: "Lỗi",
                    text2: "Không thể bắt đầu theo dõi vị trí. Vui lòng kiểm tra quyền truy cập vị trí.",
                  });
                }
              }
            } catch (error) {
              console.error("Error starting delivery:", error);
              Toast.show({
                type: "error",
                text1: "Lỗi",
                text2: "Không thể bắt đầu giao hàng. Vui lòng thử lại sau.",
              });
            }
          },
        },
      ]
    );
  };

  const handleCompleteDelivery = (delivery) => {
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
            id: delivery._id,
            requireReceiverInfo: true,
          }),
      },
    ]);
  };

  const renderDeliveryItem = ({ item }) => {
    const renderActionButton = () => {
      switch (item.status) {
        case "pending":
          return (
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton]}
              onPress={() => handleStartDelivery(item._id)}
            >
              <MaterialIcons name="play-arrow" size={20} color="white" />
              <Text style={styles.actionButtonText}>Bắt đầu giao</Text>
            </TouchableOpacity>
          );
        case "in_transit":
          return (
            <View style={styles.actionButtonGroup}>
              <TouchableOpacity
                style={[styles.actionButton, styles.primaryButton]}
                onPress={() => handleCompleteDelivery(item)}
              >
                <MaterialIcons name="check" size={20} color="white" />
                <Text style={styles.actionButtonText}>Xác nhận giao</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.secondaryButton]}
                onPress={() =>
                  navigation.navigate("DeliveryDetail", {
                    id: item._id,
                    action: "report",
                  })
                }
              >
                <MaterialIcons name="error" size={20} color="#FF6B6B" />
                <Text style={[styles.actionButtonText, { color: "#FF6B6B" }]}>
                  Báo cáo
                </Text>
              </TouchableOpacity>
            </View>
          );
        case "delivered":
          return (
            <TouchableOpacity
              style={[styles.actionButton, styles.viewButton]}
              onPress={() =>
                navigation.navigate("DeliveryDetail", { id: item._id })
              }
            >
              <MaterialIcons name="visibility" size={20} color="#00B894" />
              <Text style={[styles.actionButtonText, { color: "#00B894" }]}>
                Xem chi tiết
              </Text>
            </TouchableOpacity>
          );
        case "failed":
          return (
            <TouchableOpacity
              style={[styles.actionButton, styles.viewButton]}
              onPress={() =>
                navigation.navigate("DeliveryDetail", { id: item._id })
              }
            >
              <MaterialIcons name="info" size={20} color="#FF7675" />
              <Text style={[styles.actionButtonText, { color: "#FF7675" }]}>
                Xem lý do
              </Text>
            </TouchableOpacity>
          );
        default:
          return null;
      }
    };

    return (
      <View style={styles.deliveryItem}>
        <TouchableOpacity
          style={styles.deliveryContent}
          onPress={() =>
            navigation.navigate("DeliveryDetail", { id: item._id })
          }
        >
          <View style={styles.deliveryHeader}>
            <View style={styles.deliveryId}>
              <MaterialIcons name="local-shipping" size={24} color="#636E72" />
              <Text style={styles.deliveryCode}>Mã đơn: #{item.code}</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColorDelivery(item.status) + "20" },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColorDelivery(item.status) },
                ]}
              >
                {getStatusNameDelivery(item.status)}
              </Text>
            </View>
          </View>

          <View style={styles.deliveryInfo}>
            <View style={styles.deliveryRow}>
              <MaterialIcons name="location-on" size={16} color="#636E72" />
              <Text style={styles.deliveryAddress}>
                Đến: {item?.facilityToAddress}
              </Text>
            </View>
            <View style={styles.deliveryRow}>
              <MaterialIcons name="person" size={16} color="#636E72" />
              <Text style={styles.deliveryAddress}>
                Người nhận: {item?.bloodRequestId?.userId?.fullName}
              </Text>
            </View>
            <View style={styles.deliveryRow}>
              <MaterialIcons name="call" size={16} color="#636E72" />
              <Text style={styles.deliveryAddress}>
                Số điện thoại: {item?.bloodRequestId?.userId?.phone}
              </Text>
            </View>
            <View style={styles.deliveryRow}>
              <MaterialIcons name="schedule" size={16} color="#636E72" />
              <Text style={styles.deliveryTime}>
                Thời gian hẹn:{" "}
                {formatDateTime(item?.bloodRequestId?.scheduledDeliveryDate)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {renderActionButton()}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Danh sách đơn giao"
      />
      {renderStatusFilter()}
      <FlatList
        data={deliveries}
        renderItem={renderDeliveryItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.deliveryList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="inbox" size={64} color="#CED4DA" />
            <Text style={styles.emptyText}>Không có đơn giao nào</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  filterContainer: {
    backgroundColor: "white",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  filterList: {
    paddingHorizontal: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F8F9FA",
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: "#FF6B6B",
  },
  filterText: {
    color: "#636E72",
    fontSize: 14,
  },
  filterTextActive: {
    color: "white",
    fontWeight: "500",
  },
  deliveryList: {
    padding: 16,
  },
  deliveryItem: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deliveryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  deliveryId: {
    flexDirection: "row",
    alignItems: "center",
  },
  deliveryCode: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2D3436",
    marginLeft: 8,
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
  deliveryContent: {
    flex: 1,
  },
  deliveryInfo: {
    marginTop: 8,
  },
  deliveryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  deliveryAddress: {
    fontSize: 14,
    color: "#636E72",
    marginLeft: 8,
    flex: 1,
  },
  deliveryTime: {
    fontSize: 14,
    color: "#636E72",
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: "#636E72",
    marginTop: 16,
  },
  actionButtonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  primaryButton: {
    backgroundColor: "#FF6B6B",
    flex: 1,
  },
  secondaryButton: {
    backgroundColor: "#FFF0F0",
    borderWidth: 1,
    borderColor: "#FF6B6B",
    flex: 1,
  },
  viewButton: {
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#CED4DA",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "white",
    marginLeft: 4,
  },
});

export default DeliveryListScreen;
