import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
  SafeAreaView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import facilityAPI from "../apis/facilityAPI";

// Mock data (in a real app, this would come from an API)
const mockCenters = [
  {
    id: 1,
    name: "Bệnh viện Chợ Rẫy",
    address: "201B Nguyễn Chí Thanh, Phường 12, Quận 5, TP.HCM",
    distance: "2.5 km",
    rating: 4.8,
    openHours: "7:00 - 16:30",
    image:
      "https://images2.thanhnien.vn/528068263637045248/2024/2/15/img3752-17079665726211198504579.jpg",
    status: "Đang mở cửa",
    bloodTypes: ["A+", "B+", "O+", "AB+"],
    urgentNeed: true,
  },
  {
    id: 2,
    name: "Viện Huyết học - Truyền máu TW",
    address: "118 Hồng Bàng, Phường 12, Quận 5, TP.HCM",
    distance: "3.2 km",
    rating: 4.9,
    openHours: "7:30 - 16:00",
    image:
      "https://www.vienhuyethoc.vn/wp-content/uploads/2019/07/vien-huyet-hoc-truyen-mau-trung-uong.jpg",
    status: "Đang mở cửa",
    bloodTypes: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
    urgentNeed: false,
  },
];

const districts = [
  "Quận 1",
  "Quận 3",
  "Quận 5",
  "Quận 10",
  "Bình Thạnh",
  "Phú Nhuận",
];

export default function SearchScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBloodType, setSelectedBloodType] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [showUrgentOnly, setShowUrgentOnly] = useState(false);
  const [sortBy, setSortBy] = useState("distance"); // 'distance' or 'rating'
  const [facilities, setFacilities] = useState([]);

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const response = await facilityAPI.HandleFacility();
        setFacilities(response.data.result);
      } catch (error) {
        console.error("Error fetching facilities:", error);
      }
    };
    fetchFacilities();
  }, []);

  const filteredCenters = mockCenters
    .filter((center) => {
      const matchesSearch =
        center.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        center.address.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBloodType =
        !selectedBloodType || center.bloodTypes.includes(selectedBloodType);
      const matchesDistrict =
        !selectedDistrict || center.address.includes(selectedDistrict);
      const matchesUrgent = !showUrgentOnly || center.urgentNeed;

      return (
        matchesSearch && matchesBloodType && matchesDistrict && matchesUrgent
      );
    })
    .sort((a, b) => {
      if (sortBy === "distance") {
        return parseFloat(a.distance) - parseFloat(b.distance);
      }
      return b.rating - a.rating;
    });

  const renderFilterChip = (label, isSelected, onPress) => (
    <TouchableOpacity
      key={`chip-${label}`}
      style={[styles.filterChip, isSelected && styles.filterChipSelected]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.filterChipText,
          isSelected && styles.filterChipTextSelected,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderCenter = (facility) => (
    <TouchableOpacity
      key={facility._id}
      style={styles.centerCard}
      onPress={() =>
        navigation.navigate("FacilityDetail", { facilityId: facility._id })
      }
    >
      <Image
        source={{ uri: facility?.mainImage?.url }}
        style={styles.centerImage}
      />
      <View style={styles.centerInfo}>
        <View style={styles.centerHeader}>
          <Text style={styles.centerName}>{facility?.name}</Text>
          <View style={styles.ratingContainer}>
            <MaterialIcons name="star" size={16} color="#FFD700" />
            <Text style={styles.rating}>{facility?.avgRating}</Text>
          </View>
        </View>

        <View style={styles.addressRow}>
          <MaterialIcons name="location-on" size={16} color="#95A5A6" />
          <Text style={styles.infoText}>{facility?.address}</Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.timeContainer}>
            <MaterialIcons name="access-time" size={16} color="#95A5A6" />
            <Text style={styles.infoText}>
              {facility?.schedules[0]?.openTime} -{" "}
              {facility?.schedules[0]?.closeTime}
            </Text>
          </View>
          <View style={styles.statusContainer}>
            {facility?.schedules[0] && (
              <View
                style={[
                  styles.statusBadge,
                  facility?.schedules[0]?.isOpen
                    ? styles.openBadge
                    : styles.closedBadge,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    facility?.schedules[0]?.isOpen
                      ? styles.openText
                      : styles.closedText,
                  ]}
                >
                  {facility?.schedules[0]?.isOpen
                    ? "Đang mở cửa"
                    : "Đang đóng cửa"}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={24} color="#95A5A6" />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm theo tên hoặc địa chỉ..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.districtFilter}
        >
          {/* District Filter */}
          {districts.map((district) => (
            <React.Fragment key={`district-${district}`}>
              {renderFilterChip(district, selectedDistrict === district, () =>
                setSelectedDistrict(
                  selectedDistrict === district ? null : district
                )
              )}
            </React.Fragment>
          ))}
        </ScrollView>

        {/* Additional Filters */}
        <View style={styles.additionalFilters}>
          {renderFilterChip("Cần máu khẩn cấp", showUrgentOnly, () =>
            setShowUrgentOnly(!showUrgentOnly)
          )}
          {renderFilterChip(
            sortBy === "distance" ? "Gần nhất" : "Đánh giá cao nhất",
            true,
            () => setSortBy(sortBy === "distance" ? "rating" : "distance")
          )}
        </View>
      </View>

      {/* Results */}
      <ScrollView
        style={styles.resultsList}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {facilities.map(renderCenter)}
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    margin: 16,
    padding: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  filtersContainer: {
    paddingHorizontal: 16,
  },
  districtFilter: {
    marginTop: 8,
  },
  additionalFilters: {
    flexDirection: "row",
    marginTop: 8,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  filterChipSelected: {
    backgroundColor: "#FF6B6B",
    borderColor: "#FF6B6B",
  },
  filterChipText: {
    color: "#2D3436",
    fontSize: 14,
  },
  filterChipTextSelected: {
    color: "#FFFFFF",
  },
  resultsList: {
    flex: 1,
    padding: 16,
  },
  centerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderColor: "#E2E8F0",
    borderWidth: 1,
    marginBottom: 16,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: "hidden",
  },
  centerImage: {
    width: "100%",
    height: 200,
  },
  centerInfo: {
    padding: 16,
  },
  centerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  centerName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D3436",
    flex: 1,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9C4",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rating: {
    marginLeft: 4,
    fontWeight: "bold",
    color: "#FFB300",
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    justifyContent: "flex-start",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    justifyContent: "space-between",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoText: {
    marginLeft: 8,
    color: "#636E72",
  },
  statusContainer: {
    marginLeft: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  openBadge: {
    backgroundColor: "#E8F5E9",
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  closedBadge: {
    backgroundColor: "#FFEBEE",
    borderWidth: 1,
    borderColor: "#F44336",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  openText: {
    color: "#2E7D32",
  },
  closedText: {
    color: "#C62828",
  },
  bloodTypesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  bloodTypeChip: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 4,
    marginBottom: 4,
  },
  bloodTypeText: {
    color: "#4CAF50",
    fontSize: 12,
    fontWeight: "bold",
  },
});
