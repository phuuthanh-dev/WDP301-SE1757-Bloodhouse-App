import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
  SafeAreaView,
  Platform,
} from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { formatDateTime } from "@/utils/formatHelpers";

// Mock data for testing
const MOCK_DONORS = [
  {
    id: "1",
    name: "Nguyễn Văn A",
    avatar: "https://i.pravatar.cc/150?img=1",
    appointmentTime: "2024-03-20T09:00:00Z",
    bloodType: "A+",
  },
  {
    id: "2",
    name: "Trần Thị B",
    avatar: "https://i.pravatar.cc/150?img=2",
    appointmentTime: "2024-03-20T09:30:00Z",
    bloodType: "O-",
  },
  {
    id: "3",
    name: "Lê Văn C",
    avatar: "https://i.pravatar.cc/150?img=3",
    appointmentTime: "2024-03-20T10:00:00Z",
    bloodType: "B+",
  },
  {
    id: "4",
    name: "Phạm Thị D",
    avatar: "https://i.pravatar.cc/150?img=4",
    appointmentTime: "2024-03-20T10:30:00Z",
    bloodType: "AB+",
  },
];

export default function DonorListScreen() {
  const [donors, setDonors] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const fetchDonors = async () => {
    try {
      // Simulating API call with mock data
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Fake loading delay
      setDonors(MOCK_DONORS);
    } catch (error) {
      console.error("Error fetching donors:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDonors();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchDonors();
  }, []);

  const handleScanDonor = (donorId) => {
    navigation.navigate("Scanner", { mode: "donor", donorId });
  };

  const renderDonorItem = ({ item }) => (
    <TouchableOpacity
      style={styles.donorCard}
      onPress={() => handleScanDonor(item.id)}
    >
      <View style={styles.donorInfo}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: item.avatar || "https://via.placeholder.com/50" }}
            style={styles.avatar}
          />
          <View style={styles.bloodTypeBadge}>
            <Text style={styles.bloodTypeText}>{item.bloodType}</Text>
          </View>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.name}>{item.name}</Text>
          <View style={styles.detailsRow}>
            <MaterialCommunityIcons name="clock-outline" size={16} color="#4A90E2" />
            <Text style={styles.details}>
              {formatDateTime(new Date(item.appointmentTime))}
            </Text>
          </View>
          <View style={styles.statusBadge}>
            <MaterialCommunityIcons name="clock-alert-outline" size={14} color="#FFF" />
            <Text style={styles.statusText}>Chờ check-in</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity style={styles.scanButton} onPress={() => handleScanDonor(item.id)}>
        <MaterialCommunityIcons name="qr-code-scanner" size={22} color="#FFF" />
        <Text style={styles.scanText}>Quét mã</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Danh Sách Người Hiến</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerCount}>{donors.length}</Text>
        </View>
      </View>
      <FlatList
        data={donors}
        renderItem={renderDonorItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={["#FF6B6B"]} 
            tintColor="#FF6B6B"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="blood-bag" size={64} color="#FF6B6B" />
            <Text style={styles.emptyText}>
              Không có người hiến máu nào chưa check-in
            </Text>
          </View>
        }
      />
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
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  headerBadge: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  headerCount: {
    color: "#FF6B6B",
    fontWeight: "bold",
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
  },
  donorCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  donorInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#FF6B6B",
  },
  bloodTypeBadge: {
    position: "absolute",
    bottom: -5,
    right: -5,
    backgroundColor: "#FF6B6B",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  bloodTypeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  textContainer: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#2D3748",
    marginBottom: 4,
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  details: {
    fontSize: 14,
    color: "#4A5568",
    marginLeft: 6,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4A90E2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  scanButton: {
    backgroundColor: "#FF6B6B",
    borderRadius: 12,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 100,
  },
  scanText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#718096",
    textAlign: "center",
    marginTop: 16,
    lineHeight: 24,
  },
});
