import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { toast } from "sonner-native";
import emergencyCampaignAPI from "@/apis/emergencyCampaignAPI";
import { authSelector } from "@/redux/reducers/authReducer";
import { useFacility } from "@/contexts/FacilityContext";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const EmergencyCampaignScreen = ({ navigation }) => {
  const { facilityId } = useFacility();
  const [campaigns, setCampaigns] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    closed: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useSelector(authSelector);

  const fetchCampaigns = async () => {
    try {
      const response = await emergencyCampaignAPI.HandleEmergencyCampaign(
        `/facility/${facilityId}`
      );
      if (response.status === 200) {
        setCampaigns(response.data);
        // Calculate stats
        const newStats = response.data.reduce(
          (acc, campaign) => {
            acc.total++;
            acc[campaign.status]++;
            return acc;
          },
          { total: 0, open: 0, closed: 0, completed: 0 }
        );
        setStats(newStats);
      }
    } catch (error) {
      toast.error("Không thể tải danh sách chiến dịch khẩn cấp");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCampaigns();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "#FF6B6B";
      case "closed":
        return "#636E72";
      case "completed":
        return "#00B894";
      case "expired":
        return "#FFA502";
      default:
        return "#636E72";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "open":
        return "Đang mở";
      case "closed":
        return "Đã đóng";
      case "completed":
        return "Hoàn thành";
      case "expired":
        return "Hết hạn";
      default:
        return status;
    }
  };

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <MaterialIcons name="campaign" size={24} color="#FF6B6B" />
        <Text style={styles.statNumber}>{stats.total}</Text>
        <Text style={styles.statLabel}>Tổng chiến dịch</Text>
      </View>
      <View style={styles.statCard}>
        <MaterialIcons name="notifications-active" size={24} color="#00B894" />
        <Text style={styles.statNumber}>{stats.open}</Text>
        <Text style={styles.statLabel}>Đang mở</Text>
      </View>
      <View style={styles.statCard}>
        <MaterialIcons name="check-circle" size={24} color="#1E90FF" />
        <Text style={styles.statNumber}>{stats.completed}</Text>
        <Text style={styles.statLabel}>Hoàn thành</Text>
      </View>
    </View>
  );

  const renderCampaignCard = (campaign) => (
    <TouchableOpacity
      key={campaign._id}
      style={styles.campaignCard}
      onPress={() =>
        navigation.navigate("EmergencyCampaignDetailScreen", { campaign })
      }
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleContainer}>
          <MaterialIcons name="bloodtype" size={24} color="#FF6B6B" />
          <Text style={styles.cardTitle}>Yêu cầu máu khẩn cấp</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(campaign.status) },
          ]}
        >
          <Text style={styles.statusText}>{getStatusText(campaign.status)}</Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <MaterialIcons name="people" size={20} color="#FF6B6B" />
            <Text style={styles.infoText}>
              Người đăng ký: {0} {/* Tạm thời set là 0 */}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialIcons name="opacity" size={20} color="#FF6B6B" />
            <Text style={styles.infoText}>
              Số lượng cần: {campaign.quantityNeeded}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialIcons name="event" size={20} color="#FF6B6B" />
            <Text style={styles.infoText}>
              Hạn: {format(new Date(campaign.deadline), "dd/MM/yyyy HH:mm", {
                locale: vi,
              })}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialIcons name="person" size={20} color="#1E90FF" />
            <Text style={styles.infoText}>
              {campaign.createdBy?.fullName || "N/A"}
            </Text>
          </View>
        </View>

        {campaign.requestId.isFullfill && (
          <View style={styles.fulfillBadge}>
            <MaterialIcons name="check-circle" size={20} color="#2ED573" />
            <Text style={styles.fulfillText}>Đã đủ số lượng yêu cầu</Text>
          </View>
        )}

        {campaign.note && (
          <View style={styles.noteContainer}>
            <MaterialIcons name="note" size={20} color="#636E72" />
            <Text style={styles.noteText} numberOfLines={2}>
              {campaign.note}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chiến dịch khẩn cấp</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("CreateEmergencyCampaign")}
        >
          <MaterialIcons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderStats()}
        
        {campaigns.length > 0 ? (
          campaigns.map(renderCampaignCard)
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="campaign" size={64} color="#636E72" />
            <Text style={styles.emptyText}>
              Hiện không có chiến dịch khẩn cấp nào
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

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
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  addButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2D3436",
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#636E72",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  campaignCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2D3436",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  cardContent: {
    gap: 16,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "45%",
  },
  infoText: {
    fontSize: 14,
    color: "#636E72",
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E9ECEF",
    borderRadius: 4,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#00B894",
    borderRadius: 4,
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
  noteContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E9ECEF",
    gap: 8,
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    color: "#636E72",
    fontStyle: "italic",
  },
  fulfillBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2ED57320",
    padding: 8,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  fulfillText: {
    color: "#2ED573",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default EmergencyCampaignScreen;
