import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
  TextInput,
  RefreshControl,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import bloodRequestAPI from "@/apis/bloodRequestAPI";
import { useFacility } from "@/contexts/FacilityContext";
import Header from "@/components/Header";

const SUPPORT_STATUS = [
  { value: "all", label: "Tất Cả" },
  { value: "pending", label: "Chờ Duyệt" },
  { value: "approved", label: "Đã Duyệt" },
  { value: "rejected", label: "Từ Chối" },
];

export default function SupportRequestListScreen({ navigation }) {
  const { facilityId } = useFacility();
  const [supportRequests, setSupportRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSupportRequests();
  }, [filter]);

  const fetchSupportRequests = async () => {
    try {
      setLoading(true);
      const response = await bloodRequestAPI.HandleBloodRequest(
        `/facility/${facilityId}/support-requests?status=${filter !== "all" ? filter : ""}`,
        null,
        "get"
      );
      if (response.status === 200) {
        setSupportRequests(response.data);
      }
    } catch (error) {
      console.error("Error fetching support requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderRequestCard = (request) => (
    <TouchableOpacity
      key={request._id}
      style={styles.card}
      onPress={() => navigation.navigate("SupportRequestDetail", { requestId: request._id })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.bloodInfo}>
          <Text style={styles.bloodType}>{request.groupId.name}</Text>
          <Text style={styles.component}>{request.componentId.name}</Text>
        </View>
        <View style={styles.quantityContainer}>
          <Text style={styles.quantity}>{request.quantity} đơn vị</Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <MaterialIcons name="person" size={18} color="#7a5545" />
          <Text style={styles.infoText}>{request.patientName}</Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialIcons name="access-time" size={18} color="#7a5545" />
          <Text style={styles.infoText}>
            {request.preferredDate}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialIcons name="people" size={18} color="#7a5545" />
          <Text style={styles.infoText}>
            {request.supportCount || 0} người đăng ký hỗ trợ
          </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <TouchableOpacity 
          style={styles.viewButton}
          onPress={() => navigation.navigate("SupportRequestDetail", { requestId: request._id })}
        >
          <Text style={styles.viewButtonText}>Xem chi tiết</Text>
          <MaterialIcons name="arrow-forward" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Yêu Cầu Cần Hỗ Trợ" showBackButton />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={20} color="#95A5A6" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm yêu cầu..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          {SUPPORT_STATUS.map((item) => (
            <TouchableOpacity
              key={item.value}
              style={[
                styles.filterChip,
                filter === item.value && styles.filterChipActive,
              ]}
              onPress={() => setFilter(item.value)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filter === item.value && styles.filterChipTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Support Request List */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchSupportRequests} />
        }
      >
        {supportRequests.map(renderRequestCard)}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF9F5",
  },
  searchContainer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F2F6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: "#2D3436",
  },
  filterContainer: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E8D3C3",
  },
  filterContent: {
    paddingHorizontal: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F1F2F6",
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: "#7a5545",
  },
  filterChipText: {
    color: "#636E72",
    fontSize: 14,
    fontWeight: "500",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#BFA58E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  bloodInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bloodType: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#7a5545",
    backgroundColor: "#fcedd6",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  component: {
    fontSize: 16,
    color: "#6B4F3F",
  },
  quantityContainer: {
    backgroundColor: "#E8D3C3",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  quantity: {
    fontSize: 16,
    fontWeight: "600",
    color: "#7a5545",
  },
  cardContent: {
    gap: 8,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#6B4F3F",
    flex: 1,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    borderTopWidth: 1,
    borderTopColor: "#E8D3C3",
    paddingTop: 12,
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#7a5545",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  viewButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
