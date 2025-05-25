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
  Image,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { toast } from "sonner-native";
import emergencyCampaignAPI from "@/apis/emergencyCampaignAPI";
import { authSelector } from "@/redux/reducers/authReducer";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const MOCK_DONORS = [5, 8, 12, 3, 15, 7, 10]; // Mock data cho số người đăng ký

export const EmergencyCampaignListScreen = ({ navigation }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useSelector(authSelector);

  const fetchCampaigns = async () => {
    try {
      const response = await emergencyCampaignAPI.HandleEmergencyCampaign("");
      if (response.status === 200) {
        // Sắp xếp theo thời gian tạo gần nhất
        const sortedCampaigns = response.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setCampaigns(sortedCampaigns);
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
        return "#4CAF50"; // Medical green for active/open
      case "closed":
        return "#607D8B"; // Cool gray for closed
      case "completed":
        return "#2196F3"; // Medical blue for completed
      case "expired":
        return "#FF5722"; // Warning orange for expired
      default:
        return "#607D8B";
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

  const renderCampaignCard = (campaign, index) => (
    <TouchableOpacity
      key={campaign._id}
      style={styles.campaignCard}
      onPress={() =>
        navigation.navigate("EmergencyCampaignDetail", { campaign })
      }
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleContainer}>
          <View style={styles.facilityImageContainer}>
            <Image
              source={{ uri: campaign?.facilityId?.mainImage.url }}
              style={styles.facilityImage}
              resizeMode="cover"
            />
            <View style={styles.facilityIconOverlay}>
              <MaterialIcons name="local-hospital" size={20} color="#FFFFFF" />
            </View>
          </View>
          <View style={styles.facilityInfo}>
            <Text style={styles.facilityName}>
              {campaign.facilityId?.name || "Cơ sở y tế"}
            </Text>
            <Text style={styles.facilityType} numberOfLines={1}>
              Trung tâm hiến máu
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(campaign.status) },
          ]}
        >
          <Text style={styles.statusText}>
            {getStatusText(campaign.status)}
          </Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <MaterialIcons name="people" size={20} color="#FF6B6B" />
            <Text style={styles.infoText}>
              Người đăng ký: {MOCK_DONORS[index % MOCK_DONORS.length]}
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
              Hạn tham gia:{" "}
              {format(new Date(campaign.deadline), "dd/MM/yyyy HH:mm", {
                locale: vi,
              })}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialIcons name="location-on" size={20} color="#1E90FF" />
            <Text style={styles.infoText} numberOfLines={1}>
              {campaign.facilityId?.address || "Đang cập nhật"}
            </Text>
          </View>
        </View>

        {campaign.note && (
          <View style={styles.noteContainer}>
            <MaterialIcons name="note" size={20} color="#636E72" />
            <Text style={styles.noteText} numberOfLines={2}>
              {campaign.note}
            </Text>
          </View>
        )}

        {campaign.status === "open" && (
          <TouchableOpacity
            style={styles.registerButton}
            onPress={() =>
              navigation.navigate("EmergencyCampaignDetailScreen", { campaign })
            }
          >
            <MaterialIcons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.registerButtonText}>Đăng ký tham gia</Text>
          </TouchableOpacity>
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
          <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chiến dịch hiến máu khẩn cấp</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {campaigns.length > 0 ? (
          campaigns.map((campaign, index) =>
            renderCampaignCard(campaign, index)
          )
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
    textShadowColor: "rgba(0,0,0,0.1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
  },
  campaignCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#E3E8F0",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E3E8F0",
  },
  cardTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    marginRight: 12,
  },
  facilityImageContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#EEF2F7",
    position: "relative",
  },
  facilityImage: {
    width: "100%",
    height: "100%",
  },
  facilityIconOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "rgba(33, 150, 243, 0.9)",
    padding: 4,
    borderTopLeftRadius: 8,
  },
  facilityInfo: {
    flex: 1,
  },
  facilityName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A237E",
    marginBottom: 2,
  },
  facilityType: {
    fontSize: 13,
    color: "#5C6BC0",
    opacity: 0.8,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
    textShadowColor: "rgba(0,0,0,0.1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cardContent: {
    padding: 20,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "46%",
    backgroundColor: "#EEF2F7",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#1A237E",
    flex: 1,
    fontWeight: "500",
  },
  noteContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E3E8F0",
    gap: 12,
    backgroundColor: "#EEF2F7",
    padding: 16,
    borderRadius: 12,
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    color: "#5C6BC0",
    fontStyle: "italic",
    lineHeight: 20,
  },
  registerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  registerButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    textShadowColor: "rgba(0,0,0,0.1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: "#5C6BC0",
    marginTop: 16,
    textAlign: "center",
    fontWeight: "500",
  },
});
