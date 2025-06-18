import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  Dimensions,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import bloodDeliveryAPI from "@/apis/bloodDeliveryAPI";
import { formatDateTime } from "@/utils/formatHelpers";
import Header from "@/components/Header";
import { authSelector } from "@/redux/reducers/authReducer";
import { useSelector } from "react-redux";
import { useFacility } from "@/contexts/FacilityContext";
import * as Location from 'expo-location';
import { PieChart } from "react-native-chart-kit";

const DashboardScreen = () => {
  const navigation = useNavigation();
  const { user } = useSelector(authSelector);
  const { facilityName } = useFacility();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    in_transit: 0,
    delivered: 0,
    cancelled: 0,
  });
  const [currentDelivery, setCurrentDelivery] = useState(null);
  const [assignedDelivery, setAssignedDelivery] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [currentAddress, setCurrentAddress] = useState(null);

  const fetchLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location.coords);

      // Get address from coordinates
      const addresses = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (addresses && addresses.length > 0) {
        const address = addresses[0];
        const formattedAddress = [
          address.street,
          address.district,
          address.city,
          address.region,
        ]
          .filter(Boolean)
          .join(", ");
        setCurrentAddress(formattedAddress);
      }
    } catch (error) {
      console.error("Error getting location:", error);
    }
  };

  const fetchDeliveries = async () => {
    try {
      const response = await bloodDeliveryAPI.HandleBloodDelivery(
        `/stats/transporter/${user._id}`
      );
      if (response.status === 200) {
        setStats({
          total: response.data.total,
          pending: response.data.pending,
          in_transit: response.data.in_transit,
          delivered: response.data.delivered,
          cancelled: response.data.cancelled,
        });
      }
    } catch (error) {
      console.error("Error fetching deliveries:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchDeliveries(), fetchLocation()]);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchDeliveries();
    fetchLocation();
    const locationInterval = setInterval(fetchLocation, 30000); // Update location every 30 seconds

    return () => clearInterval(locationInterval);
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

  const renderDeliveryStats = () => {
    const chartData = [
      {
        name: "Đang giao",
        population: stats.in_transit,
        color: "#FF6B6B",
        legendFontColor: "#7F7F7F",
      },
      {
        name: "Đã giao",
        population: stats.delivered,
        color: "#4ECDC4",
        legendFontColor: "#7F7F7F",
      },
      {
        name: "Đang chờ",
        population: stats.pending,
        color: "#FFD93D",
        legendFontColor: "#7F7F7F",
      },
      {
        name: "Đã hủy",
        population: stats.cancelled,
        color: "#95A5A6",
        legendFontColor: "#7F7F7F",
      }
    ];

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Thống kê giao hàng</Text>
        <View style={styles.chartContainer}>
          {stats.total > 0 ? (
            <PieChart
              data={chartData}
              width={Dimensions.get("window").width - 40}
              height={220}
              chartConfig={{
                backgroundColor: "#ffffff",
                backgroundGradientFrom: "#ffffff",
                backgroundGradientTo: "#ffffff",
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="0"
              absolute
            />
          ) : (
            <Text style={styles.noDataText}>Chưa có dữ liệu giao hàng</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        greeting={`Xin Chào, ${user?.fullName}`}
        title="Trang chủ"
        subtitle={facilityName}
        showProfileButton
        onProfilePress={() => navigation.navigate("Profile")}
      />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Current Location */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="my-location" size={24} color="#FF6B6B" />
            <Text style={styles.cardTitle}>Vị trí hiện tại</Text>
          </View>
          <View style={styles.locationInfo}>
            {currentLocation ? (
              <>
                <View style={styles.locationDetail}>
                  <MaterialIcons name="my-location" size={20} color="#FF6B6B" />
                  <Text style={styles.locationText}>
                    {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                  </Text>
                </View>
                <View style={styles.locationDetail}>
                  <MaterialIcons name="gps-not-fixed" size={20} color="#FF6B6B" />
                  <Text style={styles.locationText}>
                    Độ chính xác: {currentLocation.accuracy?.toFixed(0)}m
                  </Text>
                </View>
                {currentAddress && (
                  <View style={styles.locationDetail}>
                    <MaterialIcons name="place" size={20} color="#FF6B6B" />
                    <Text style={styles.locationText}>{currentAddress}</Text>
                  </View>
                )}
              </>
            ) : (
              <Text style={styles.noLocationText}>Đang tải vị trí...</Text>
            )}
          </View>
        </View>

        {/* Delivery Stats */}
        {renderDeliveryStats()}

        {/* Current and Assigned Deliveries */}
        {renderCurrentDelivery()}
        {renderAssignedDelivery()}
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
  scrollView: {
    flex: 1,
  },
  card: {
    backgroundColor: "white",
    margin: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2D3436",
    marginLeft: 8,
  },
  locationInfo: {
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  locationDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: "#2D3436",
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  statsContainer: {
    margin: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2D3436",
    marginBottom: 16,
    marginLeft: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  statItem: {
    width: '47%',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statBorder: {
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 13,
    color: "#2D3436",
    textAlign: "center",
    fontWeight: "500",
  },
  deliveryInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF5F5",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  deliveryDetails: {
    marginLeft: 12,
    flex: 1,
  },
  deliveryId: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF6B6B",
    marginBottom: 4,
  },
  deliveryAddress: {
    fontSize: 14,
    color: "#2D3436",
    marginBottom: 4,
    lineHeight: 20,
  },
  deliveryTime: {
    fontSize: 14,
    color: "#636E72",
    lineHeight: 20,
  },
  viewButton: {
    backgroundColor: "#F8F9FA",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  viewButtonText: {
    color: "#2D3436",
    fontSize: 14,
    fontWeight: "600",
  },
  startButton: {
    backgroundColor: "#FF6B6B",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },
  startButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  noDataText: {
    fontSize: 16,
    color: '#7F7F7F',
    textAlign: 'center',
    marginVertical: 20,
  },
  noLocationText: {
    fontSize: 16,
    color: '#7F7F7F',
    textAlign: 'center',
    marginVertical: 20,
  },
});

export default DashboardScreen;
