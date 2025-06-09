import React, {
  useRef,
  useMemo,
  useCallback,
  useState,
  useEffect,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import MapView, { Marker, Polyline } from "react-native-maps";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import bloodDeliveryAPI from "@/apis/bloodDeliveryAPI";
import { formatDateTime } from "@/utils/formatHelpers";
import CustomMapViewDirections from "@/components/CustomMapViewDirections";
import { formatDurationRoute } from "@/utils/formatHelpers";
import { useSocket } from "@/contexts/SocketContext";

// Mock data for delivery timeline
const deliveryTimeline = [
  {
    time: "20 Th02\n16:02",
    status: "Giao hàng thành công",
    description: "Người nhận: Phùng Hữu Thành",
    isCompleted: true,
    isActive: true,
  },
  {
    time: "20 Th02\n07:34",
    status: "Đơn hàng sẽ sớm được giao",
    description: "vui lòng chú ý điện thoại",
    isCompleted: true,
    isActive: false,
  },
  {
    time: "20 Th02\n07:34",
    status: "Đã sắp xếp tài xế giao hàng",
    isCompleted: true,
    isActive: false,
  },
  {
    time: "20 Th02\n06:06",
    status: "Đơn hàng đã đến trạm giao hàng tại khu vực của bạn",
    description: "và sẽ được giao trong vòng 24 giờ tiếp theo",
    isCompleted: true,
    isActive: false,
  },
  {
    time: "20 Th02\n03:55",
    status: "Đơn hàng đã rời kho phân loại tới 51-HCM",
    description: "D9/Nguyen Van Tang Hub",
    isCompleted: true,
    isActive: false,
  },
  {
    time: "19 Th02\n23:17",
    status: "Đơn hàng đã đến kho phân loại Xã Tân Phú Trung",
    description: "Huyện Củ Chi, TP. Hồ Chí Minh",
    isCompleted: true,
    isActive: false,
  },
  {
    time: "19 Th02\n22:59",
    status: "Đơn hàng đã đến bưu cục",
    isCompleted: true,
    isActive: false,
  },
  {
    time: "19 Th02\n19:53",
    status: "Đơn hàng đã rời bưu cục",
    isCompleted: true,
    isActive: false,
  },
  {
    time: "19 Th02\n19:12",
    status: "Đơn hàng đã đến bưu cục Phường 4",
    description: "Quận Phú Nhuận, TP. Hồ Chí Minh",
    isCompleted: true,
    isActive: false,
  },
  {
    time: "19 Th02\n16:18",
    status: "Đơn vị vận chuyển lấy hàng thành công",
    isCompleted: true,
    isActive: false,
  },
  {
    time: "19 Th02\n09:09",
    status: "Người gửi đang chuẩn bị hàng",
    isCompleted: true,
    isActive: false,
  },
  {
    time: "18 Th02\n17:00",
    status: "Đơn hàng đã được đặt",
    isCompleted: true,
    isActive: false,
  },
];

const TimelineItem = ({ item, isLast }) => {
  const dotColor = item.isActive ? "#00B894" : "#B2BEC3";
  const textColor = item.isActive ? "#2D3436" : "#636E72";

  return (
    <View style={styles.timelineItem}>
      {/* Time */}
      <View style={styles.timeColumn}>
        <Text style={[styles.timeText, { color: textColor }]}>{item.time}</Text>
      </View>

      {/* Dot and Line */}
      <View style={styles.dotLineColumn}>
        <View style={[styles.dot, { backgroundColor: dotColor }]} />
        {!isLast && (
          <View style={[styles.line, { backgroundColor: "#E9ECEF" }]} />
        )}
      </View>

      {/* Content */}
      <View style={styles.contentColumn}>
        <Text style={[styles.statusText, { color: textColor }]}>
          {item.status}
        </Text>
        {item.description && (
          <Text style={[styles.descriptionText, { color: textColor }]}>
            {item.description}
          </Text>
        )}
      </View>
    </View>
  );
};

const DeliveryProgress = ({ bloodDelivery }) => {
  const getDeliveryStatus = () => {
    switch (bloodDelivery?.status) {
      case "delivered":
        return 3;
      case "in_transit":
        return 2;
      case "pending":
        return 1;
      default:
        return 1;
    }
  };

  const status = getDeliveryStatus();

  return (
    <View style={styles.deliveryTimeContainer}>
      <Text style={styles.deliveryTimeText}>
        Giao vào{" "}
        {formatDateTime(bloodDelivery?.bloodRequestId?.scheduledDeliveryDate)}
      </Text>
      <View style={styles.deliveryProgress}>
        <View style={[styles.progressDot, status >= 1 && styles.activeDot]} />
        <View style={[styles.progressLine, status >= 2 && styles.activeLine]} />
        <View style={[styles.progressDot, status >= 2 && styles.activeDot]} />
        <View style={[styles.progressLine, status >= 3 && styles.activeLine]} />
        <View style={[styles.progressDot, status >= 3 && styles.activeDot]} />
      </View>
      <View style={styles.progressLabels}>
        <View style={styles.progressLabelContainer}>
          <Text
            style={[styles.progressLabel, status >= 1 && styles.activeLabel]}
          >
            Chờ giao
          </Text>
        </View>
        <View style={styles.progressLabelContainer}>
          <Text
            style={[styles.progressLabel, status >= 2 && styles.activeLabel]}
          >
            Đang vận chuyển
          </Text>
        </View>
        <View style={styles.progressLabelContainer}>
          <Text
            style={[styles.progressLabel, status >= 3 && styles.activeLabel]}
          >
            Đã giao
          </Text>
        </View>
      </View>
    </View>
  );
};

const CarrierInfo = ({ transporter, trackingId }) => {
  return (
    <View style={styles.carrierInfo}>
      <Image source={{ uri: transporter?.avatar }} style={styles.carrierLogo} />
      <View style={styles.carrierDetails}>
        <Text style={styles.carrierName}>{transporter?.fullName}</Text>
        <Text style={styles.trackingId}>Mã vận đơn: {trackingId}</Text>
      </View>
      <TouchableOpacity style={styles.orderButton}>
        <Text style={styles.orderButtonText}>Thông tin đơn hàng</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function DeliveryTrackingScreen({ route, navigation }) {
  const { deliveryId } = route.params;
  const { socket } = useSocket();
  const bottomSheetRef = useRef(null);
  const mapRef = useRef(null);
  const snapPoints = useMemo(() => ["25%", "50%", "90%"], []);
  const [bloodDelivery, setBloodDelivery] = useState(null);
  const [transporter, setTransporter] = useState(null);
  const [mapRoute, setMapRoute] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);

  useEffect(() => {
    const fetchBloodDelivery = async () => {
      const response = await bloodDeliveryAPI.HandleBloodDelivery(
        `/${deliveryId}`
      );
      setBloodDelivery(response.data);
      setTransporter(response.data.transporterId.userId);

      // Set map route based on facility and delivery locations
      const facilityLocation = response.data.facilityId.location.coordinates;
      const deliveryLocation =
        response.data.bloodRequestId.location.coordinates;

      // Nếu có currentLocation trong response, sử dụng nó làm vị trí ban đầu của tài xế
      if (response.data.currentLocation?.coordinates) {
        setDriverLocation({
          latitude: response.data.currentLocation.coordinates[1],
          longitude: response.data.currentLocation.coordinates[0],
        });
      }

      setMapRoute({
        origin: {
          latitude: facilityLocation[1],
          longitude: facilityLocation[0],
          title: response.data.facilityId.name,
        },
        destination: {
          latitude: deliveryLocation[1],
          longitude: deliveryLocation[0],
          title: response.data.facilityToAddress,
        },
        routeCoordinates: [
          { latitude: facilityLocation[1], longitude: facilityLocation[0] },
          { latitude: deliveryLocation[1], longitude: deliveryLocation[0] },
        ],
      });
    };
    fetchBloodDelivery();
  }, []);

  // Listen for real-time location updates
  useEffect(() => {
    if (socket && deliveryId) {
      // Subscribe to location updates for this specific delivery
      socket.on(`delivery:${deliveryId}:location`, (data) => {
        setDriverLocation({
          latitude: data.latitude,
          longitude: data.longitude,
        });

        // Optional: Auto-center map on new driver location
        if (mapRef.current && driverLocation) {
          mapRef.current.animateToRegion({
            latitude: data.latitude,
            longitude: data.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }, 1000);
        }
      });

      // Cleanup subscription on unmount
      return () => {
        socket.off(`delivery:${deliveryId}:location`);
      };
    }
  }, [socket, deliveryId]);

  const handleSheetChanges = useCallback((index) => {
    console.log("handleSheetChanges", index);
  }, []);

  if (!mapRoute) return null;

  const destination = {
    latitude: bloodDelivery?.bloodRequestId?.location?.coordinates[1],
    longitude: bloodDelivery?.bloodRequestId?.location?.coordinates[0],
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#2D3436" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Theo dõi vận chuyển</Text>
        <TouchableOpacity style={styles.helpButton}>
          <MaterialIcons name="help-outline" size={24} color="#2D3436" />
        </TouchableOpacity>
      </View>

      {/* Map View */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude:
            (mapRoute.origin.latitude + mapRoute.destination.latitude) / 2,
          longitude:
            (mapRoute.origin.longitude + mapRoute.destination.longitude) / 2,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        <Marker coordinate={mapRoute.origin} title={mapRoute.origin.title}>
          <Image
            source={require("@/assets/images/marker.png")}
            style={styles.markerImage}
          />
        </Marker>
        <Marker
          coordinate={destination}
          title={bloodDelivery?.bloodRequestId?.address}
        >
          <MaterialIcons name="location-on" size={30} color="#00B894" />
        </Marker>

        {/* Driver Location Marker */}
        {driverLocation && (
          <Marker
            coordinate={driverLocation}
            title={`Tài xế: ${transporter?.fullName}`}
          >
            <Image
              source={require("@/assets/images/truck.png")}
              style={styles.truckImage}
            />
          </Marker>
        )}

        {/* Update CustomMapViewDirections to use driver's location as origin */}
        {driverLocation && (
          <CustomMapViewDirections
            origin={driverLocation}
            destination={destination}
            strokeWidth={3}
            strokeColor="#FF6B6B"
            onReady={(result) => {
              setRouteInfo(result);
              if (mapRef.current) {
                mapRef.current.fitToCoordinates(result.coordinates, {
                  edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                  animated: true,
                });
              }
            }}
          />
        )}
      </MapView>

      {/* Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        backgroundStyle={styles.bottomSheetBackground}
      >
        <BottomSheetScrollView
          contentContainerStyle={styles.bottomSheetContent}
        >
          <DeliveryProgress bloodDelivery={bloodDelivery} />
          <CarrierInfo
            transporter={transporter}
            trackingId={bloodDelivery?.code}
          />

          {/* Timeline */}
          <View style={styles.timeline}>
            {deliveryTimeline.map((item, index) => (
              <TimelineItem
                key={index}
                item={item}
                isLast={index === deliveryTimeline.length - 1}
              />
            ))}
          </View>
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 48 : 16,
    paddingBottom: 16,
    backgroundColor: "white",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  markerImage: {
    width: 32,
    height: 32,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FF6B6B",
  },
  bottomSheetBackground: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  bottomSheetContent: {
    backgroundColor: "#F8F9FA",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D3436",
  },
  helpButton: {
    padding: 8,
  },
  deliveryTimeContainer: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingBottom: 12,
    marginBottom: 8,
  },
  deliveryTimeText: {
    fontSize: 14,
    color: "#2D3436",
    marginBottom: 12,
  },
  deliveryProgress: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    paddingHorizontal: 60,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#E9ECEF",
  },
  activeDot: {
    backgroundColor: "#00B894",
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#E9ECEF",
    marginHorizontal: 4,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  progressLabelContainer: {
    flex: 1,
    alignItems: "center",
  },
  progressLabel: {
    fontSize: 12,
    color: "#636E72",
    textAlign: "center",
    width: "100%",
  },
  activeLabel: {
    color: "#00B894",
    fontWeight: "500",
  },
  carrierInfo: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginBottom: 8,
  },
  carrierLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#2D3436",
  },
  carrierDetails: {
    flex: 1,
  },
  carrierName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2D3436",
    marginBottom: 4,
  },
  trackingId: {
    fontSize: 14,
    color: "#636E72",
  },
  orderButton: {
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  orderButtonText: {
    fontSize: 14,
    color: "#2D3436",
  },
  timeline: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 16,
  },
  timelineItem: {
    flexDirection: "row",
    paddingVertical: 12,
  },
  timeColumn: {
    width: 80,
    paddingRight: 12,
  },
  timeText: {
    fontSize: 12,
    color: "#636E72",
  },
  dotLineColumn: {
    width: 20,
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#B2BEC3",
    marginTop: 6,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: "#E9ECEF",
    marginTop: 4,
  },
  contentColumn: {
    flex: 1,
    paddingLeft: 12,
  },
  statusText: {
    fontSize: 14,
    color: "#2D3436",
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 12,
    color: "#636E72",
  },
  activeLine: {
    backgroundColor: "#00B894",
  },
  truckImage: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
});
