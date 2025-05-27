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
  Alert,
  Linking,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { toast } from "sonner-native";
import emergencyCampaignAPI from "@/apis/emergencyCampaignAPI";
import bloodRequestAPI from "@/apis/bloodRequestAPI";
import { authSelector } from "@/redux/reducers/authReducer";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const MOCK_DONORS = [5, 8, 12, 3, 15, 7, 10]; // Mock data cho số người đăng ký

export const EmergencyCampaignDetailScreen = ({ route, navigation }) => {
  const { campaign } = route.params;
  const [loading, setLoading] = useState(true);
  const [requestDetails, setRequestDetails] = useState(null);
  const [registering, setRegistering] = useState(false);
  const user = useSelector(authSelector);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const requestResponse =
        await emergencyCampaignAPI.HandleEmergencyCampaign(`/${campaign._id}`);

      if (requestResponse.status === 200) {
        setRequestDetails(requestResponse.data);
      }
    } catch (error) {
      toast.error("Không thể tải thông tin chiến dịch");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      setRegistering(true);
      // TODO: Implement registration API
      // const response = await emergencyCampaignAPI.HandleEmergencyCampaign(
      //   `/${campaign._id}/register`,
      //   {},
      //   "post"
      // );

      // Mock successful registration
      await new Promise((resolve) => setTimeout(resolve, 1000));

      Alert.alert(
        "Đăng ký thành công",
        "Cảm ơn bạn đã đăng ký tham gia chiến dịch hiến máu. Chúng tôi sẽ liên hệ với bạn sớm nhất.",
        [
          {
            text: "Đóng",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert("Lỗi", "Không thể đăng ký tham gia chiến dịch");
    } finally {
      setRegistering(false);
    }
  };

  const openGoogleMaps = () => {
    const address = encodeURIComponent(campaign.facilityId?.address || "");
    const url = `https://www.google.com/maps/search/?api=1&query=${address}`;
    Linking.openURL(url);
  };

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
        <Text style={styles.headerTitle}>Chi tiết chiến dịch</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Facility Info */}
        <View style={styles.facilityCard}>
          <View style={styles.facilityHeader}>
            <MaterialIcons name="local-hospital" size={24} color="#FF6B6B" />
            <Text style={styles.facilityName}>
              {campaign.facilityId?.name || "Cơ sở y tế"}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addressContainer}
            onPress={openGoogleMaps}
          >
            <MaterialIcons name="location-on" size={20} color="#FF6B6B" />
            <View style={styles.addressContent}>
              <Text style={styles.addressLabel}>Địa chỉ</Text>
              <Text style={styles.addressText}>
                {campaign.facilityId?.address || "Đang cập nhật"}
              </Text>
            </View>
            <MaterialIcons name="navigate-next" size={24} color="#636E72" />
          </TouchableOpacity>
        </View>

        {/* Campaign Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <MaterialIcons name="people" size={24} color="#FF6B6B" />
            <Text style={styles.statNumber}>
              {MOCK_DONORS[campaign._id.length % MOCK_DONORS.length]}
            </Text>
            <Text style={styles.statLabel}>Người đăng ký</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialIcons name="opacity" size={24} color="#FF6B6B" />
            <Text style={styles.statNumber}>{campaign.quantityNeeded}</Text>
            <Text style={styles.statLabel}>Số lượng cần</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialIcons name="event" size={24} color="#1E90FF" />
            <Text style={styles.statNumber}>
              {format(new Date(campaign.deadline), "dd/MM/yyyy HH:mm", {
                locale: vi,
              })}
            </Text>
            <Text style={styles.statLabel}>Hạn chiến dịch</Text>
          </View>
        </View>

        {/* Campaign Info */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Thông tin chiến dịch</Text>
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

          {campaign.note && (
            <View style={styles.noteContainer}>
              <MaterialIcons name="note" size={20} color="#FF6B6B" />
              <View style={styles.noteContent}>
                <Text style={styles.noteLabel}>Ghi chú</Text>
                <Text style={styles.noteText}>{campaign.note}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Blood Request Info */}
        {requestDetails && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Thông tin yêu cầu máu</Text>

            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <View style={styles.infoItemIcon}>
                  <MaterialIcons name="bloodtype" size={20} color="#FF6B6B" />
                  <Text style={styles.infoLabel}>Nhóm máu</Text>
                </View>
                <Text style={styles.infoValue}>
                  {requestDetails.groupId?.name || "Chưa xác định"}
                </Text>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.infoItemIcon}>
                  <MaterialIcons
                    name="medical-services"
                    size={20}
                    color="#FF6B6B"
                  />
                  <Text style={styles.infoLabel}>Thành phần máu</Text>
                </View>
                <Text style={styles.infoValue}>
                  {requestDetails.componentId?.name || "Chưa xác định"}
                </Text>
              </View>
            </View>
          </View>
        )}

        {campaign.status === "open" && (
          <TouchableOpacity
            style={[
              styles.registerButton,
              registering && styles.disabledButton,
            ]}
            onPress={handleRegister}
            disabled={registering}
          >
            <MaterialIcons
              name={registering ? "hourglass-empty" : "favorite"}
              size={24}
              color="#FFFFFF"
            />
            <Text style={styles.registerButtonText}>
              {registering ? "Đang đăng ký..." : "Đăng ký tham gia"}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
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
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
  },
  facilityCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    margin: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#E3E8F0",
  },
  facilityHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E3E8F0",
  },
  facilityName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A237E", // Deep medical blue
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2F7",
    padding: 16,
    borderRadius: 12,
  },
  addressContent: {
    flex: 1,
    marginLeft: 12,
  },
  addressLabel: {
    fontSize: 13,
    color: "#5C6BC0",
    fontWeight: "600",
  },
  addressText: {
    fontSize: 15,
    color: "#2D3436",
    marginTop: 4,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#E3E8F0",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A237E",
    marginVertical: 8,
    textAlign: "center",
  },
  statLabel: {
    fontSize: 13,
    color: "#5C6BC0",
    textAlign: "center",
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
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
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E3E8F0",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A237E",
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
  noteContainer: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#EEF2F7",
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  noteContent: {
    flex: 1,
  },
  noteLabel: {
    fontSize: 13,
    color: "#5C6BC0",
    marginBottom: 4,
    fontWeight: "600",
  },
  noteText: {
    fontSize: 15,
    color: "#2D3436",
    fontStyle: "italic",
    lineHeight: 20,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 20,
  },
  infoItem: {
    width: "45%",
    backgroundColor: "#EEF2F7",
    padding: 16,
    borderRadius: 12,
  },
  infoItemIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: "#5C6BC0",
    fontWeight: "600",
  },
  infoValue: {
    fontSize: 15,
    color: "#1A237E",
    fontWeight: "600",
    marginTop: 8,
  },
  registerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
    margin: 16,
    padding: 20,
    borderRadius: 16,
    gap: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  registerButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    textShadowColor: "rgba(0,0,0,0.1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  disabledButton: {
    opacity: 0.7,
    backgroundColor: "#90A4AE",
  },
});
