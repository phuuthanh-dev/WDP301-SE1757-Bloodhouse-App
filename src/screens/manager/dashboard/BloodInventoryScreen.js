import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
  RefreshControl,
  Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import bloodInventoryAPI from "@/apis/bloodInventoryAPI";
import { useFacility } from "@/contexts/FacilityContext";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const getStatusInfo = (quantity) => {
  if (quantity <= 10) return { status: "Nguy Cấp", color: "#FF4757" };
  if (quantity <= 30) return { status: "Thấp", color: "#FFA502" };
  return { status: "Đủ", color: "#2ED573" };
};

export default function BloodInventoryScreen({ navigation }) {
  const { facilityId } = useFacility();
  const [filter, setFilter] = useState("Tất Cả");
  const [bloodInventory, setBloodInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("quantity"); // quantity, component, group

  useEffect(() => {
    if (facilityId) {
      fetchBloodInventory();
    }
  }, [facilityId]);

  const fetchBloodInventory = async () => {
    try {
      setLoading(true);
      const response = await bloodInventoryAPI.HandleBloodInventory(
        `/facility/${facilityId}`
      );
      setBloodInventory(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalUnits = () => {
    return bloodInventory.reduce((sum, item) => sum + item.totalQuantity, 0);
  };

  const getCriticalCount = () => {
    return bloodInventory.filter(item => item.totalQuantity <= 10).length;
  };

  const getLowCount = () => {
    return bloodInventory.filter(item => item.totalQuantity > 10 && item.totalQuantity <= 30).length;
  };

  const getSortedInventory = () => {
    let filtered = [...bloodInventory];
    
    if (filter !== "Tất Cả") {
      filtered = filtered.filter(item => {
        const { status } = getStatusInfo(item.totalQuantity);
        return status === filter;
      });
    }

    switch (sortBy) {
      case "quantity":
        return filtered.sort((a, b) => b.totalQuantity - a.totalQuantity);
      case "component":
        return filtered.sort((a, b) => a.componentId.name.localeCompare(b.componentId.name));
      case "group":
        return filtered.sort((a, b) => a.groupId.name.localeCompare(b.groupId.name));
      default:
        return filtered;
    }
  };

  const renderSummaryCard = () => (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryTitle}>Tổng Quan Kho Máu</Text>
      <View style={styles.summaryStats}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{getTotalUnits()}</Text>
          <Text style={styles.summaryLabel}>Tổng Đơn Vị</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: "#FF4757" }]}>{getCriticalCount()}</Text>
          <Text style={styles.summaryLabel}>Nguy Cấp</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: "#FFA502" }]}>{getLowCount()}</Text>
          <Text style={styles.summaryLabel}>Thấp</Text>
        </View>
      </View>
    </View>
  );

  const renderInventoryCard = (item) => {
    const { status, color } = getStatusInfo(item.totalQuantity);
    
    return (
      <View key={item._id} style={styles.card}>
        <View style={[styles.cardHeader, { backgroundColor: color + '10' }]}>
          <View style={styles.bloodInfo}>
            <View style={styles.bloodTypeWrapper}>
              <MaterialIcons name="water-drop" size={24} color={color} />
              <View style={styles.bloodTextContainer}>
                <Text style={styles.bloodComponent}>{item.componentId.name}</Text>
                <Text style={styles.bloodGroup}>{item.groupId.name}</Text>
              </View>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: color + "20", borderColor: color }]}>
            <Text style={[styles.statusText, { color }]}>{status}</Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.quantitySection}>
            <View style={[styles.quantityCircle, { borderColor: color }]}>
              <Text style={[styles.quantityValue, { color }]}>{item.totalQuantity}</Text>
              <Text style={styles.quantityUnit}>đơn vị</Text>
            </View>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <MaterialIcons name="update" size={16} color="#95A5A6" />
                <Text style={styles.infoLabel}>Cập nhật:</Text>
                <Text style={styles.infoText}>
                  {format(new Date(item.updatedAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <MaterialIcons name="event" size={16} color="#95A5A6" />
                <Text style={styles.infoLabel}>Hết hạn:</Text>
                <Text style={styles.infoText}>Còn 30 ngày</Text>
              </View>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${Math.min((item.totalQuantity / 100) * 100, 100)}%`, backgroundColor: color }]} />
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kho Máu</Text>
        <TouchableOpacity 
          style={styles.sortButton}
          onPress={() => {
            const sorts = ["quantity", "component", "group"];
            const currentIndex = sorts.indexOf(sortBy);
            setSortBy(sorts[(currentIndex + 1) % sorts.length]);
          }}
        >
          <MaterialIcons name="sort" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          {["Tất Cả", "Nguy Cấp", "Thấp", "Đủ"].map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.filterChip,
                filter === item && styles.filterChipActive,
              ]}
              onPress={() => setFilter(item)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filter === item && styles.filterChipTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchBloodInventory} />
        }
      >
        {renderSummaryCard()}
        {getSortedInventory().map(renderInventoryCard)}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    backgroundColor: "#FF6B6B",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 20 : 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  backButton: {
    padding: 8,
  },
  sortButton: {
    padding: 8,
  },
  filterContainer: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    elevation: 2,
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
    backgroundColor: "#FF6B6B",
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
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2D3436",
    marginBottom: 12,
  },
  summaryStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2D3436",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#95A5A6",
    marginTop: 4,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  bloodInfo: {
    flex: 1,
  },
  bloodTypeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bloodTextContainer: {
    marginLeft: 12,
  },
  bloodComponent: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D3436",
  },
  bloodGroup: {
    fontSize: 14,
    color: "#636E72",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  cardContent: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  quantitySection: {
    marginRight: 16,
  },
  quantityCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  quantityValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  quantityUnit: {
    fontSize: 10,
    color: "#95A5A6",
    marginTop: 2,
  },
  infoSection: {
    flex: 1,
  },
  infoRow: {
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: "#95A5A6",
    marginLeft: 4,
    marginRight: 4,
  },
  infoText: {
    fontSize: 12,
    color: "#636E72",
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#F1F2F6',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
});
