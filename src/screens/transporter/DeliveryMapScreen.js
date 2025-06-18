import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import bloodDeliveryAPI from "@/apis/bloodDeliveryAPI";
import Header from "@/components/Header";
import { useFacility } from "@/contexts/FacilityContext";
import CustomMapViewDirections from "@/components/CustomMapViewDirections";
import { formatDurationRoute } from "@/utils/formatHelpers";
import { useSocket } from "@/contexts/SocketContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const DeliveryMapScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const { facilityId } = useFacility();
  const { stopLocationTracking } = useSocket();
  const mapRef = useRef(null);
  const [delivery, setDelivery] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [facilityInfo] = useState({
    name: "Bệnh viện Chợ Rẫy",
    address: "201B Nguyễn Chí Thanh, Phường 12, Quận 5, TP.HCM",
    location: {
      latitude: 10.756334,
      longitude: 106.657351,
    },
  });

  const fetchDelivery = async () => {
    try {
      const response = await bloodDeliveryAPI.HandleBloodDelivery(
        `/${id}/facility/${facilityId}`
      );
      setDelivery(response.data);

      // If delivery is completed or failed, stop location tracking
      if (response.data.status === "delivered" || response.data.status === "failed") {
        await stopLocationTracking();
      }
    } catch (error) {
      console.error("Error fetching delivery:", error);
    }
  };

  useEffect(() => {
    fetchDelivery();

    // Request location permission and get current location
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location.coords);

      // Start watching position
      const locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (location) => {
          setCurrentLocation(location.coords);
        }
      );

      // Cleanup subscription on unmount
      return () => {
        locationSubscription.remove();
      };
    })();
  }, []);

  const fitToMarkers = () => {
    if (!mapRef.current || !delivery || !currentLocation) return;

    const points = [
      facilityInfo.location,
      {
        latitude: delivery.bloodRequestId.location.coordinates[1],
        longitude: delivery.bloodRequestId.location.coordinates[0],
      },
      {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
      },
    ];

    mapRef.current.fitToCoordinates(points, {
      edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
      animated: true,
    });
  };

  if (!delivery || !currentLocation) return null;

  const destination = {
    latitude: delivery?.bloodRequestId?.location?.coordinates[1],
    longitude: delivery?.bloodRequestId?.location?.coordinates[0],
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Bản đồ giao hàng" showBackButton />
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: currentLocation?.latitude || 10.756334,
            longitude: currentLocation?.longitude || 106.657351,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          showsUserLocation={true}
          // followsUserLocation={true}
        >
          {/* Origin Marker (Facility) */}
          <Marker coordinate={facilityInfo.location} title={facilityInfo.name}>
            <MaterialIcons name="local-hospital" size={30} color="#FF6B6B" />
          </Marker>

          {/* Destination Marker */}
          {delivery && (
            <Marker
              coordinate={{
                latitude: delivery.bloodRequestId.location.coordinates[1],
                longitude: delivery.bloodRequestId.location.coordinates[0],
              }}
              title={delivery.facilityToAddress}
            >
              <MaterialIcons name="location-on" size={30} color="#00B894" />
            </Marker>
          )}

          {/* Route Directions */}
          {delivery && currentLocation && (
            <CustomMapViewDirections
              origin={{
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
              }}
              destination={{
                latitude: delivery.bloodRequestId.location.coordinates[1],
                longitude: delivery.bloodRequestId.location.coordinates[0],
              }}
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

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={fitToMarkers}>
            <MaterialIcons name="center-focus-strong" size={24} color="#2D3436" />
          </TouchableOpacity>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <MaterialIcons name="local-shipping" size={24} color="#FF6B6B" />
            <Text style={styles.infoTitle}>Thông tin giao hàng</Text>
          </View>
          <View style={styles.infoContent}>
            {delivery && (
              <>
                <View style={styles.infoRow}>
                  <MaterialIcons name="local-hospital" size={16} color="#636E72" />
                  <Text style={styles.infoText}>{facilityInfo.name}</Text>
                </View>
                <View style={styles.infoRow}>
                  <MaterialIcons name="location-on" size={16} color="#636E72" />
                  <Text style={styles.infoText}>{delivery.facilityToAddress}</Text>
                </View>
                <View style={styles.infoRow}>
                  <MaterialIcons name="person" size={16} color="#636E72" />
                  <Text style={styles.infoText}>
                    {delivery.bloodRequestId.patientName}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <MaterialIcons name="phone" size={16} color="#636E72" />
                  <Text style={styles.infoText}>
                    {delivery.bloodRequestId.patientPhone}
                  </Text>
                </View>
                {routeInfo && (
                  <>
                    <View style={styles.infoRow}>
                      <MaterialCommunityIcons name="map-marker-distance" size={16} color="#636E72" />
                      <Text style={styles.infoText}>
                        Khoảng cách: {routeInfo.distance.toFixed(1)} km
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <MaterialIcons name="timer" size={16} color="#636E72" />
                      <Text style={styles.infoText}>
                        Thời gian dự kiến: {formatDurationRoute(routeInfo.duration)}
                      </Text>
                    </View>
                  </>
                )}
              </>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    paddingTop: Platform.OS === "android" ? 40 : 0,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    width: Dimensions.get("window").width,
    height: "100%",
  },
  buttonContainer: {
    position: "absolute",
    right: 16,
    bottom: 200,
  },
  button: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoCard: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2D3436",
    marginLeft: 8,
  },
  infoContent: {
    marginTop: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#2D3436",
    marginLeft: 8,
    flex: 1,
  },
});

export default DeliveryMapScreen; 