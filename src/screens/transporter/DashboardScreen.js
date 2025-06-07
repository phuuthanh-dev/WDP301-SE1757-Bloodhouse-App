import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import bloodDeliveryAPI from "@/apis/bloodDeliveryAPI";
import { formatDateTime } from "@/utils/formatHelpers";
import Header from "@/components/Header";

const DashboardScreen = () => {
  const navigation = useNavigation();
  const [currentDelivery, setCurrentDelivery] = useState(null);
  const [assignedDelivery, setAssignedDelivery] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [facilityInfo, setFacilityInfo] = useState({
    name: "Bệnh viện Chợ Rẫy",
    address: "201B Nguyễn Chí Thanh, Phường 12, Quận 5, TP.HCM",
  });

  const fetchDeliveries = async () => {
    try {
      // TODO: Implement API calls to get current and assigned deliveries
      // const response = await bloodDeliveryAPI.getCurrentDelivery();
      // setCurrentDelivery(response.data);
      // const assignedResponse = await bloodDeliveryAPI.getAssignedDelivery();
      // setAssignedDelivery(assignedResponse.data);
    } catch (error) {
      console.error("Error fetching deliveries:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDeliveries();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const handleStartDelivery = async () => {
    try {
      // TODO: Implement API call to start delivery
      // await bloodDeliveryAPI.startDelivery(assignedDelivery.id);
      await fetchDeliveries();
    } catch (error) {
      console.error("Error starting delivery:", error);
    }
  };

  const renderCurrentDelivery = () => {
    if (!currentDelivery) return null;

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Đơn giao hiện tại</Text>
        <View style={styles.deliveryInfo}>
          <MaterialIcons name="local-shipping" size={24} color="#FF6B6B" />
          <View style={styles.deliveryDetails}>
            <Text style={styles.deliveryId}>#{currentDelivery.code}</Text>
            <Text style={styles.deliveryAddress}>
              {currentDelivery.facilityToAddress}
            </Text>
            <Text style={styles.deliveryTime}>
              Giao vào: {formatDateTime(currentDelivery.scheduledDeliveryDate)}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() =>
            navigation.navigate("DeliveryDetail", { id: currentDelivery.id })
          }
        >
          <Text style={styles.viewButtonText}>Xem chi tiết</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderAssignedDelivery = () => {
    if (!assignedDelivery) return null;

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Đơn giao mới được gán</Text>
        <View style={styles.deliveryInfo}>
          <MaterialIcons name="assignment" size={24} color="#FF6B6B" />
          <View style={styles.deliveryDetails}>
            <Text style={styles.deliveryId}>#{assignedDelivery.code}</Text>
            <Text style={styles.deliveryAddress}>
              {assignedDelivery.facilityToAddress}
            </Text>
            <Text style={styles.deliveryTime}>
              Giao vào: {formatDateTime(assignedDelivery.scheduledDeliveryDate)}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartDelivery}
        >
          <Text style={styles.startButtonText}>Bắt đầu nhiệm vụ</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Trang chủ" />
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Facility Info */}
        <View style={styles.facilityCard}>
          <Text style={styles.facilityTitle}>Cơ sở làm việc</Text>
          <View style={styles.facilityInfo}>
            <MaterialIcons name="local-hospital" size={24} color="#FF6B6B" />
            <View style={styles.facilityDetails}>
              <Text style={styles.facilityName}>{facilityInfo.name}</Text>
              <Text style={styles.facilityAddress}>{facilityInfo.address}</Text>
            </View>
          </View>
        </View>

        {renderCurrentDelivery()}
        {renderAssignedDelivery()}

        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Thống kê hôm nay</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <MaterialIcons name="local-shipping" size={24} color="#FF6B6B" />
              <Text style={styles.statNumber}>5</Text>
              <Text style={styles.statLabel}>Đơn đã giao</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialIcons name="pending" size={24} color="#FF6B6B" />
              <Text style={styles.statNumber}>2</Text>
              <Text style={styles.statLabel}>Đơn đang giao</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialIcons name="error" size={24} color="#FF6B6B" />
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Đơn thất bại</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollView: {
    flex: 1,
  },
  facilityCard: {
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
  facilityTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2D3436",
    marginBottom: 12,
  },
  facilityInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  facilityDetails: {
    marginLeft: 12,
    flex: 1,
  },
  facilityName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2D3436",
    marginBottom: 4,
  },
  facilityAddress: {
    fontSize: 14,
    color: "#636E72",
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
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2D3436",
    marginBottom: 12,
  },
  deliveryInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  deliveryDetails: {
    marginLeft: 12,
    flex: 1,
  },
  deliveryId: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2D3436",
    marginBottom: 4,
  },
  deliveryAddress: {
    fontSize: 14,
    color: "#636E72",
    marginBottom: 4,
  },
  deliveryTime: {
    fontSize: 14,
    color: "#636E72",
  },
  viewButton: {
    backgroundColor: "#F8F9FA",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  viewButtonText: {
    color: "#2D3436",
    fontSize: 14,
    fontWeight: "500",
  },
  startButton: {
    backgroundColor: "#FF6B6B",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  startButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  statsCard: {
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
  statsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2D3436",
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2D3436",
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#636E72",
    textAlign: "center",
  },
});

export default DashboardScreen; 