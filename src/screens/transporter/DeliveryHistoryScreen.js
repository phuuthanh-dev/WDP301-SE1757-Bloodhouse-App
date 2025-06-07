import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const MOCK_HISTORY = [
  {
    id: "DEL123",
    status: "completed",
    completedAt: new Date(2024, 2, 15, 14, 30),
    origin: "Bệnh viện Chợ Rẫy",
    destination: "Bệnh viện Đa khoa Sài Gòn",
    bloodUnits: [
      { type: "A+", quantity: 2 },
      { type: "O-", quantity: 1 },
    ],
    distance: "5.2",
    duration: "25",
  },
  {
    id: "DEL122",
    status: "failed",
    completedAt: new Date(2024, 2, 14, 16, 45),
    origin: "Bệnh viện 115",
    destination: "Bệnh viện Nhi Đồng 1",
    bloodUnits: [
      { type: "B+", quantity: 1 },
      { type: "AB-", quantity: 2 },
    ],
    distance: "7.8",
    duration: "35",
    failureReason: "Địa chỉ không chính xác",
  },
  {
    id: "DEL121",
    status: "completed",
    completedAt: new Date(2024, 2, 14, 10, 15),
    origin: "Bệnh viện Thống Nhất",
    destination: "Bệnh viện Đa khoa Quận 7",
    bloodUnits: [
      { type: "O+", quantity: 3 },
    ],
    distance: "4.5",
    duration: "20",
  },
];

const DeliveryHistoryScreen = ({ navigation }) => {
  const [history, setHistory] = useState(MOCK_HISTORY);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all"); // all, completed, failed

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // TODO: Implement API call to fetch history
      // const response = await deliveryAPI.getHistory();
      // setHistory(response.data);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const filteredHistory = history.filter((item) => {
    if (filter === "all") return true;
    return item.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "#00B894";
      case "failed":
        return "#FF6B6B";
      default:
        return "#636E72";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "completed":
        return "Thành công";
      case "failed":
        return "Thất bại";
      default:
        return "Không xác định";
    }
  };

  const renderBloodUnits = (bloodUnits) => {
    return bloodUnits
      .map((unit) => `${unit.quantity} ${unit.type}`)
      .join(", ");
  };

  const renderHistoryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.historyItem}
      onPress={() => navigation.navigate("DeliveryDetail", { id: item.id })}
    >
      <View style={styles.header}>
        <View style={styles.idContainer}>
          <MaterialIcons name="local-shipping" size={20} color="#636E72" />
          <Text style={styles.id}>{item.id}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + "20" },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: getStatusColor(item.status) },
            ]}
          >
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>

      <View style={styles.locationContainer}>
        <View style={styles.locationItem}>
          <MaterialIcons name="circle" size={12} color="#00B894" />
          <Text style={styles.locationText} numberOfLines={1}>
            {item.origin}
          </Text>
        </View>
        <View style={styles.locationDivider} />
        <View style={styles.locationItem}>
          <MaterialIcons name="place" size={12} color="#FF6B6B" />
          <Text style={styles.locationText} numberOfLines={1}>
            {item.destination}
          </Text>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <MaterialIcons name="opacity" size={16} color="#636E72" />
          <Text style={styles.detailText}>
            {renderBloodUnits(item.bloodUnits)}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <MaterialIcons name="straighten" size={16} color="#636E72" />
            <Text style={styles.detailText}>{item.distance} km</Text>
          </View>
          <View style={styles.detailItem}>
            <MaterialIcons name="schedule" size={16} color="#636E72" />
            <Text style={styles.detailText}>{item.duration} phút</Text>
          </View>
          <Text style={styles.time}>
            {format(item.completedAt, "HH:mm, dd/MM/yyyy", { locale: vi })}
          </Text>
        </View>
      </View>

      {item.status === "failed" && (
        <View style={styles.failureContainer}>
          <MaterialIcons name="error-outline" size={16} color="#FF6B6B" />
          <Text style={styles.failureText}>{item.failureReason}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="history" size={64} color="#B2BEC3" />
      <Text style={styles.emptyText}>Chưa có lịch sử giao hàng</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === "all" && styles.filterActive]}
          onPress={() => setFilter("all")}
        >
          <Text
            style={[
              styles.filterText,
              filter === "all" && styles.filterTextActive,
            ]}
          >
            Tất cả
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "completed" && styles.filterActive,
          ]}
          onPress={() => setFilter("completed")}
        >
          <Text
            style={[
              styles.filterText,
              filter === "completed" && styles.filterTextActive,
            ]}
          >
            Thành công
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "failed" && styles.filterActive,
          ]}
          onPress={() => setFilter("failed")}
        >
          <Text
            style={[
              styles.filterText,
              filter === "failed" && styles.filterTextActive,
            ]}
          >
            Thất bại
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredHistory}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmpty}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  filterContainer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "white",
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  filterActive: {
    backgroundColor: "#FFE3E3",
  },
  filterText: {
    fontSize: 14,
    color: "#636E72",
    fontWeight: "500",
  },
  filterTextActive: {
    color: "#FF6B6B",
  },
  listContainer: {
    flexGrow: 1,
    padding: 16,
  },
  historyItem: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  idContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  id: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3436",
    marginLeft: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  locationContainer: {
    marginBottom: 12,
  },
  locationItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  locationText: {
    fontSize: 14,
    color: "#2D3436",
    marginLeft: 8,
    flex: 1,
  },
  locationDivider: {
    width: 1,
    height: 16,
    backgroundColor: "#E9ECEF",
    marginLeft: 5,
  },
  detailsContainer: {
    borderTopWidth: 1,
    borderTopColor: "#E9ECEF",
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  detailText: {
    fontSize: 14,
    color: "#636E72",
    marginLeft: 8,
  },
  time: {
    fontSize: 12,
    color: "#B2BEC3",
  },
  failureContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF5F5",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  failureText: {
    fontSize: 14,
    color: "#FF6B6B",
    marginLeft: 8,
  },
  separator: {
    height: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: "#636E72",
    marginTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default DeliveryHistoryScreen; 