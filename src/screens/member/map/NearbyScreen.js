import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  StatusBar,
  Dimensions,
  Image,
  SafeAreaView,
  Modal,
} from "react-native";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useLocation } from "@/contexts/LocationContext";
import facilityAPI from "@/apis/facilityAPI";
import Toast from "react-native-toast-message";
import eventAPI from "@/apis/eventAPI";
import CustomMapViewDirections from "@/components/CustomMapViewDirections";
import { formatDateTime } from "@/utils/formatHelpers";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import Header from "@/components/Header";

const { width, height } = Dimensions.get("window");

const FacilityDetails = ({ facility, onShowDirections, onViewDetails }) => {
  return (
    <View style={styles.detailsContainer}>
      <View style={styles.detailsHeader}>
        <View>
          <Text style={styles.detailsTitle}>{facility?.name}</Text>
          <View style={styles.ratingContainer}>
            <MaterialIcons name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>
              {facility?.avgRating?.toFixed(1)} ({facility?.totalFeedback})
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.detailsInfo}>
        <View style={styles.infoRow}>
          <MaterialIcons name="location-on" size={20} color="#636E72" />
          <Text style={styles.infoText}>{facility?.address}</Text>
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons name="phone" size={20} color="#636E72" />
          <Text style={styles.infoText}>{facility?.contactPhone}</Text>
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons name="email" size={20} color="#636E72" />
          <Text style={styles.infoText}>{facility?.contactEmail}</Text>
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons name="access-time" size={20} color="#636E72" />
          <Text style={styles.infoText}>
            {facility?.schedules[0]?.openTime} - {facility?.schedules[0]?.closeTime}
          </Text>
        </View>
      </View>

      <View style={styles.detailsActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.detailsButton]}
          onPress={onViewDetails}
        >
          <MaterialIcons name="info" size={24} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Xem chi tiết</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.directionsButton]}
          onPress={onShowDirections}
        >
          <MaterialIcons name="directions" size={24} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Xem đường đi</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const EventDetails = ({ event, onShowDirections, onViewDetails }) => {
  return (
    <View style={styles.detailsContainer}>
      <View style={styles.detailsHeader}>
        <View>
          <Text style={styles.detailsTitle}>{event?.title}</Text>
          <View style={styles.statusContainer}>
            <Text
              style={[
                styles.statusText,
                { color: event?.status === "published" ? "#00B894" : "#FF6B6B" },
              ]}
            >
              {event?.status === "published" ? "Đang diễn ra" : "Sắp diễn ra"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.detailsInfo}>
        <View style={styles.infoRow}>
          <MaterialIcons name="event" size={20} color="#636E72" />
          <Text style={styles.infoText}>
            {formatDateTime(event?.startTime)} - {formatDateTime(event?.endTime)}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons name="location-on" size={20} color="#636E72" />
          <Text style={styles.infoText}>{event?.address}</Text>
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons name="people" size={20} color="#636E72" />
          <Text style={styles.infoText}>
            Số người tham gia dự kiến: {event?.expectedParticipants}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons name="phone" size={20} color="#636E72" />
          <Text style={styles.infoText}>{event?.contactPhone}</Text>
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons name="email" size={20} color="#636E72" />
          <Text style={styles.infoText}>{event?.contactEmail}</Text>
        </View>
      </View>

      <View style={styles.detailsActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.detailsButton]}
          onPress={onViewDetails}
        >
          <MaterialIcons name="info" size={24} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Xem chi tiết</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.directionsButton]}
          onPress={onShowDirections}
        >
          <MaterialIcons name="directions" size={24} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Xem đường đi</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function NearbyScreen({ navigation }) {
  const { location } = useLocation();
  const [errorMsg, setErrorMsg] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("facilities"); // 'facilities', 'donors', 'requests'
  const [facilities, setFacilities] = useState([]);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const mapRef = useRef(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showDirections, setShowDirections] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // BottomSheet configuration
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ["25%", "50%", "90%"], []);

  useEffect(() => {
    if (!location) return;
    if (selectedFilter === "facilities") {
      fetchFacilities();
    } else if (selectedFilter === "events") {
      fetchEvents();
    }
  }, [location, selectedFilter]);

  useEffect(() => {
    if (selectedFilter === 'facilities') {
      setImageLoaded(true);
    }
  }, [selectedFilter]);

  const fetchFacilities = async () => {
    if (location) {
      try {
        const response = await facilityAPI.HandleFacility();
        setFacilities(response.data.result);
      } catch (error) {
        setErrorMsg("Lỗi khi tải cơ sở y tế");
      }
    }
  };

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const response = await eventAPI.HandleEvent("?page=1&limit=10");
      setEvents(response.data.data);
    } catch (error) {
      console.log(error);
      Toast.show({
        type: "error",
        text1: "Lỗi khi tải sự kiện",
      });
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleSheetChanges = useCallback((index) => {
    if (index === -1) {
      setSelectedItem(null);
    }
  }, []);

  const handleMarkerPress = (item) => {
    setSelectedItem(item);
    bottomSheetRef.current?.snapToIndex(1);
  };

  const handleShowDirections = (item) => {
    setSelectedLocation(item);
    setShowDirections(true);
    bottomSheetRef.current?.snapToIndex(0);
  };

  const handleFilterPress = (filter) => {
    setSelectedFilter(filter);
    setShowDirections(false);
    setSelectedLocation(null);
    setSelectedItem(null);
    bottomSheetRef.current?.close();
  };

  const renderMarkers = (item) => {
    if (selectedFilter === "facilities") {
      return (
        <Marker
          key={item?._id}
          coordinate={{
            latitude: item?.location?.coordinates[1],
            longitude: item?.location?.coordinates[0],
          }}
          onPress={() => handleMarkerPress(item)}
        >
          <View style={styles.markerContainer}>
            <Image
              source={require('@/assets/images/marker.png')}
              style={styles.markerImage}
              onLoad={() => setImageLoaded(true)}
            />
          </View>
        </Marker>
      );
    }

    if (selectedFilter === "events") {
      return (
        <Marker
          key={item?._id}
          coordinate={{
            latitude: item?.location?.coordinates[1],
            longitude: item?.location?.coordinates[0],
          }}
          onPress={() => handleMarkerPress(item)}
        >
          <View style={styles.eventMarkerContainer}>
            <Image
              source={require('@/assets/images/event.png')}
              style={styles.eventMarkerImage}
            />
          </View>
        </Marker>
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <Header title="Tìm quanh đây" showBackButton={true} onBackPress={() => navigation.goBack()} />

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterOption,
            selectedFilter === "facilities" && styles.filterOptionSelected,
          ]}
          onPress={() => handleFilterPress("facilities")}
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
            selectedFilter === "events" && styles.filterOptionSelected,
          ]}
          onPress={() => handleFilterPress("events")}
        >
          <Text
            style={[
              styles.filterText,
              selectedFilter === "events" && styles.filterTextSelected,
            ]}
          >
            Sự kiện
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterOption,
            selectedFilter === "requests" && styles.filterOptionSelected,
          ]}
          onPress={() => handleFilterPress("requests")}
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
          {selectedFilter === "facilities" && facilities?.map(renderMarkers)}
          {selectedFilter === "events" && events?.map(renderMarkers)}

          {showDirections && selectedLocation && location && (
            <CustomMapViewDirections
              origin={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              destination={{
                latitude: selectedLocation.location.coordinates[1],
                longitude: selectedLocation.location.coordinates[0],
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

      {/* Route Info Card */}
      {showDirections && routeInfo && (
        <View style={styles.routeInfoCard}>
          <View style={styles.routeInfoHeader}>
            <MaterialIcons name="directions" size={24} color="#FF6B6B" />
            <Text style={styles.routeInfoTitle}>Thông tin đường đi</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => {
                setShowDirections(false);
                setSelectedLocation(null);
                setRouteInfo(null);
              }}
            >
              <MaterialIcons name="close" size={24} color="#636E72" />
            </TouchableOpacity>
          </View>
          <View style={styles.routeInfoContent}>
            <View style={styles.routeInfoRow}>
              <MaterialCommunityIcons name="map-marker-distance" size={20} color="#636E72" />
              <Text style={styles.routeInfoText}>
                Khoảng cách: {routeInfo?.distance?.toFixed(1)} km
              </Text>
            </View>
            <View style={styles.routeInfoRow}>
              <MaterialIcons name="access-time" size={20} color="#636E72" />
              <Text style={styles.routeInfoText}>
                Thời gian: {Math.ceil(routeInfo?.duration)} phút
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enablePanDownToClose
      >
        <BottomSheetScrollView contentContainerStyle={styles.bottomSheetContent}>
          {selectedItem && selectedFilter === "facilities" && (
            <FacilityDetails
              facility={selectedItem}
              onShowDirections={() => handleShowDirections(selectedItem)}
              onViewDetails={() => {
                navigation.navigate("FacilityDetail", {
                  facilityId: selectedItem._id,
                });
                bottomSheetRef.current?.close();
              }}
            />
          )}
          {selectedItem && selectedFilter === "events" && (
            <EventDetails
              event={selectedItem}
              onShowDirections={() => handleShowDirections(selectedItem)}
              onViewDetails={() => {
                navigation.navigate("EventDetail", {
                  eventId: selectedItem._id,
                });
                bottomSheetRef.current?.close();
              }}
            />
          )}
        </BottomSheetScrollView>
      </BottomSheet>
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
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
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
  calloutActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  calloutButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  detailsButton: {
    backgroundColor: '#FF6B6B',
  },
  directionsButton: {
    backgroundColor: '#00B894',
  },
  calloutButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  statusContainer: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  calloutText: {
    fontSize: 13,
    color: "#636E72",
    marginLeft: 6,
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
  eventMarkerContainer: {
    width: 32,
    height: 32,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FF6B6B",
    alignItems: "center",
    justifyContent: "center",
  },
  eventMarkerImage: {
    width: 26,
    height: 26,
    borderRadius: 20,
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
  routeInfoCard: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  routeInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  routeInfoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3436',
    marginLeft: 8,
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  routeInfoContent: {
    marginTop: 8,
  },
  routeInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  routeInfoText: {
    fontSize: 16,
    color: '#2D3436',
    marginLeft: 8,
  },
  tapText: {
    fontSize: 12,
    color: "#636E72",
    textAlign: "center",
    marginTop: 8,
    fontStyle: "italic",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 200,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2D3436",
    flex: 1,
    marginRight: 16,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalButtons: {
    flexDirection: "column",
    gap: 12,
  },
  modalButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  bottomSheetContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  detailsContainer: {
    flex: 1,
  },
  detailsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2D3436",
    marginBottom: 8,
  },
  detailsInfo: {
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: "#2D3436",
    marginLeft: 12,
    flex: 1,
  },
  detailsActions: {
    flexDirection: "column",
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
