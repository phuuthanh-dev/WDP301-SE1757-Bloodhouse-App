import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  StatusBar,
  Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";

const { width, height } = Dimensions.get("window");

export default function NearbyScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("all"); // 'all', 'donors', 'requests'

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

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  const renderMarkers = () => {
    const markers = [];
    if (selectedFilter === "all" || selectedFilter === "donors") {
      mockData?.donors.forEach((donor) => {
        markers.push(
          <Marker
            key={`donor-${donor.id}`}
            coordinate={donor.coordinate}
            pinColor="#4CAF50"
          >
            <Callout>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{donor.name}</Text>
                <Text style={styles.calloutBloodType}>
                  Nhóm máu: {donor.bloodType}
                </Text>
                <Text style={styles.calloutDistance}>{donor.distance}</Text>
              </View>
            </Callout>
          </Marker>
        );
      });
    }

    if (selectedFilter === "all" || selectedFilter === "requests") {
      mockData.requests.forEach((request) => {
        markers.push(
          <Marker
            key={`request-${request.id}`}
            coordinate={request.coordinate}
            pinColor="#FF6B6B"
          >
            <Callout>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{request.hospital}</Text>
                <Text style={styles.calloutBloodType}>
                  Cần máu: {request.bloodType}
                </Text>
                <Text style={styles.calloutUrgency}>{request.urgency}</Text>
                <Text style={styles.calloutDistance}>{request.distance}</Text>
              </View>
            </Callout>
          </Marker>
        );
      });
    }

    return markers;
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
            selectedFilter === "all" && styles.filterOptionSelected,
          ]}
          onPress={() => setSelectedFilter("all")}
        >
          <Text
            style={[
              styles.filterText,
              selectedFilter === "all" && styles.filterTextSelected,
            ]}
          >
            Tất cả
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
          style={styles.map}
          provider={MapView.PROVIDER_GOOGLE}
          initialRegion={{
            latitude: location?.coords?.latitude,
            longitude: location?.coords?.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          mapType="standard"
          showsUserLocation
          showsMyLocationButton
        >
          {renderMarkers()}
        </MapView>
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            {errorMsg || "Đang tải bản đồ..."}
          </Text>
        </View>
      )}
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
    padding: 8,
    minWidth: 150,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2D3436",
    marginBottom: 4,
  },
  calloutBloodType: {
    fontSize: 12,
    color: "#636E72",
    marginBottom: 2,
  },
  calloutUrgency: {
    fontSize: 12,
    color: "#FF6B6B",
    fontWeight: "bold",
    marginBottom: 2,
  },
  calloutDistance: {
    fontSize: 12,
    color: "#95A5A6",
  },
});
