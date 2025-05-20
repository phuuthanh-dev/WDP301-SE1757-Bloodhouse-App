import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  StatusBar,
  Dimensions,
  Image,
} from "react-native";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { useLocation } from "../../contexts/LocationContext";
import facilityAPI from "../../apis/facilityAPI";

const { width, height } = Dimensions.get("window");

export default function NearbyScreen({ navigation }) {
  const { location } = useLocation();
  const [errorMsg, setErrorMsg] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("facilities"); // 'facilities', 'donors', 'requests'
  const [facilities, setFacilities] = useState([]);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!location) return;
    const fetchFacilities = async () => {
      if (location) {
        const response = await facilityAPI.HandleFacility();
        setFacilities(response.data.result);
      }
    };
    fetchFacilities();
  }, [location]);

  // Mock data for donors and requests
  const mockData = {
    donors: [
      {
        id: 1,
        coordinate: {
          latitude: 10.7769,
          longitude: 106.7009,
        },
        bloodType: "A+",
        name: "Nguyễn Văn A",
        distance: "0.5km",
      },
      {
        id: 2,
        coordinate: {
          latitude: 10.7779,
          longitude: 106.7019,
        },
        bloodType: "O+",
        name: "Trần Thị B",
        distance: "0.7km",
      },
    ],
    requests: [
      {
        id: 1,
        coordinate: {
          latitude: 10.7789,
          longitude: 106.6989,
        },
        bloodType: "O-",
        hospital: "Bệnh viện Chợ Rẫy",
        urgency: "Khẩn cấp",
        distance: "0.8km",
      },
      {
        id: 2,
        coordinate: {
          latitude: 10.7799,
          longitude: 106.6999,
        },
        bloodType: "AB+",
        hospital: "Bệnh viện Đại học Y Dược",
        urgency: "Cần gấp",
        distance: "1.2km",
      },
    ],
  };

  const renderMarkers = (facility) => {
    if (!facility?.location?.coordinates) return null;

    if (selectedFilter === "donors") {
      // mockData?.donors.forEach((donor) => {
      //   markers.push(
      //     <Marker
      //       key={`donor-${donor.id}`}
      //       coordinate={donor.coordinate}
      //       pinColor="#4CAF50"
      //     >
      //       <Callout>
      //         <View style={styles.callout}>
      //           <Text style={styles.calloutTitle}>{donor.name}</Text>
      //           <Text style={styles.calloutBloodType}>
      //             Nhóm máu: {donor.bloodType}
      //           </Text>
      //           <Text style={styles.calloutDistance}>{donor.distance}</Text>
      //         </View>
      //       </Callout>
      //     </Marker>
      //   );
      // });
    }

    if (selectedFilter === "facilities") {
      return (
        <Marker
          key={facility?._id}
          coordinate={{
            latitude: facility?.location?.coordinates[1],
            longitude: facility?.location?.coordinates[0],
          }}
          tracksViewChanges={false}
        >
          <View style={styles.markerContainer}>
            <Image
              source={require('../../assets/images/marker.png')}
              style={styles.markerImage}
            />
          </View>
          <Callout>
            <View style={styles.callout}>
              <View style={styles.calloutHeader}>
                <Text style={styles.calloutTitle}>{facility.name}</Text>
                <View style={styles.ratingContainer}>
                  <MaterialIcons name="star" size={16} color="#FFD700" />
                  <Text style={styles.ratingText}>
                    {facility.avgRating.toFixed(1)} ({facility.totalFeedback})
                  </Text>
                </View>
              </View>

              <View style={styles.calloutInfo}>
                <View style={styles.infoRow}>
                  <MaterialIcons name="location-on" size={14} color="#636E72" />
                  <Text style={styles.calloutAddress} numberOfLines={2}>
                    {facility.address}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <MaterialIcons name="phone" size={14} color="#636E72" />
                  <Text style={styles.calloutContact}>
                    {facility.contactPhone}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <MaterialIcons name="email" size={14} color="#636E72" />
                  <Text style={styles.calloutContact}>
                    {facility.contactEmail}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <MaterialIcons name="access-time" size={14} color="#636E72" />
                  <Text style={styles.calloutSchedule}>
                    {facility.schedules[0]?.openTime} -{" "}
                    {facility.schedules[0]?.closeTime}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.calloutButton}
                onPress={() =>
                  navigation.navigate("FacilityDetail", {
                    facilityId: facility?._id,
                  })
                }
              >
                <Text style={styles.calloutButtonText}>Xem chi tiết</Text>
              </TouchableOpacity>
            </View>
          </Callout>
        </Marker>
      );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#2D3436" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tìm quanh đây</Text>
        <TouchableOpacity style={styles.filterButton}>
          <MaterialIcons name="filter-list" size={24} color="#2D3436" />
        </TouchableOpacity>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterOption,
            selectedFilter === "facilities" && styles.filterOptionSelected,
          ]}
          onPress={() => setSelectedFilter("facilities")}
        >
          <Text
            style={[
              styles.filterText,
              selectedFilter === "facilities" && styles.filterTextSelected,
            ]}
          >
            Cơ sở y tế
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterOption,
            selectedFilter === "donors" && styles.filterOptionSelected,
          ]}
          onPress={() => setSelectedFilter("donors")}
        >
          <Text
            style={[
              styles.filterText,
              selectedFilter === "donors" && styles.filterTextSelected,
            ]}
          >
            Người hiến máu
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterOption,
            selectedFilter === "requests" && styles.filterOptionSelected,
          ]}
          onPress={() => setSelectedFilter("requests")}
        >
          <Text
            style={[
              styles.filterText,
              selectedFilter === "requests" && styles.filterTextSelected,
            ]}
          >
            Yêu cầu máu
          </Text>
        </TouchableOpacity>
      </View>

      {/* Map */}
      {location ? (
        <MapView
          key={facilities?.length}
          ref={mapRef}
          style={styles.map}
          provider={MapView.PROVIDER_GOOGLE}
          initialRegion={{
            latitude: location?.latitude,
            longitude: location?.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
          mapType="standard"
          showsUserLocation
          showsMyLocationButton
        >
          {facilities?.map(renderMarkers)}
        </MapView>
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            {errorMsg || "Đang tải bản đồ..."}
          </Text>
        </View>
      )}
      <TouchableOpacity
        style={styles.locationButton}
        onPress={() => {
          if (location && mapRef.current) {
            mapRef.current.animateToRegion(
              {
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
              },
              500
            );
          }
        }}
      >
        <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2D3436",
  },
  filterButton: {
    padding: 8,
  },
  filterContainer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#FFFFFF",
    justifyContent: "space-between",
  },
  filterOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F9FA",
    minWidth: width * 0.27,
    maxWidth: width * 0.31,
  },
  filterOptionSelected: {
    backgroundColor: "#FF6B6B",
  },
  filterText: {
    fontSize: 13,
    color: "#636E72",
    textAlign: "center",
  },
  filterTextSelected: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#636E72",
  },
  callout: {
    padding: 12,
    minWidth: 250,
    maxWidth: 300,
  },
  calloutHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2D3436",
    flex: 1,
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9E6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 12,
    color: "#2D3436",
    marginLeft: 4,
  },
  calloutInfo: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  calloutAddress: {
    fontSize: 13,
    color: "#636E72",
    marginLeft: 6,
    flex: 1,
  },
  calloutContact: {
    fontSize: 13,
    color: "#636E72",
    marginLeft: 6,
  },
  calloutSchedule: {
    fontSize: 13,
    color: "#636E72",
    marginLeft: 6,
  },
  calloutButton: {
    backgroundColor: "#FF6B6B",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  calloutButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  markerContainer: {
    width: 32,
    height: 32,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FF6B6B",
  },
  markerImage: {
    width: 32,
    height: 32,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FF6B6B",
  },
  locationButton: {
    position: "absolute",
    right: 20,
    bottom: 40,
    backgroundColor: "#FF6B6B",
    padding: 15,
    borderRadius: 50,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
    flexDirection: "row",
    alignItems: "center",
  },
});
