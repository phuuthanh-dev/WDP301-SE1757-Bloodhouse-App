import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  TextInput,
  Platform,
} from "react-native";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useFacility } from "@/contexts/FacilityContext";
import bloodRequestAPI from "@/apis/bloodRequestAPI";
import { formatDateTime } from "@/utils/formatHelpers";
import Header from "@/components/Header";

export const MEDICAL_THEME = {
  primary: "#FF6B6B", // Medical red
  secondary: "#2ED573", // Success green
  tertiary: "#1E90FF", // Info blue
  warning: "#FFA502", // Warning orange
  danger: "#FF4757", // Error red
  neutral: "#636E72", // Text gray
  background: "#F8F9FA", // Light background
  surface: "#FFFFFF", // Surface white
  border: "#E9ECEF", // Border color

  // Status colors with opacity variants
  status: {
    pending: {
      bg: "#FFA50220",
      text: "#FFA502",
    },
    approved: {
      bg: "#2ED57320",
      text: "#2ED573",
    },
    rejected: {
      bg: "#FF475720",
      text: "#FF4757",
    },
    urgent: {
      bg: "#FF6B6B20",
      text: "#FF6B6B",
    },
  },

  // Blood type colors with opacity variants
  bloodType: {
    "A+": { bg: "#FF6B6B20", text: "#FF6B6B" },
    "A-": { bg: "#FF878720", text: "#FF8787" },
    "B+": { bg: "#1E90FF20", text: "#1E90FF" },
    "B-": { bg: "#4DABFF20", text: "#4DABFF" },
    "O+": { bg: "#2ED57320", text: "#2ED573" },
    "O-": { bg: "#54E08B20", text: "#54E08B" },
    "AB+": { bg: "#FFA50220", text: "#FFA502" },
    "AB-": { bg: "#FFB73220", text: "#FFB732" },
  },
};

const SUPPORT_STATUS = [
  { value: "all", label: "Tất Cả", icon: "list" },
  { value: "pending", label: "Chờ Duyệt", icon: "hourglass-half" },
  { value: "approved", label: "Đã Duyệt", icon: "check-circle" },
  { value: "rejected", label: "Từ Chối", icon: "times-circle" },
];

const RequestCard = ({ request, onPress }) => {
  const urgencyBadge = request.isUrgent && (
    <View
      style={[
        styles.urgentBadge,
        { backgroundColor: MEDICAL_THEME.status.urgent.bg },
      ]}
    >
      <FontAwesome5
        name="heartbeat"
        size={12}
        color={MEDICAL_THEME.status.urgent.text}
      />
      <Text
        style={[styles.urgentText, { color: MEDICAL_THEME.status.urgent.text }]}
      >
        Khẩn cấp
      </Text>
    </View>
  );

  const hasPendingRegistrations = request.numberPending > 0;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: MEDICAL_THEME.surface }]}
      onPress={onPress}
    >
      <View style={styles.cardHeader}>
        <View style={styles.bloodInfo}>
          <Text
            style={[
              styles.bloodType,
              {
                backgroundColor:
                  MEDICAL_THEME.bloodType[request.groupId.name]?.bg ||
                  MEDICAL_THEME.primary + "20",
                color:
                  MEDICAL_THEME.bloodType[request.groupId.name]?.text ||
                  MEDICAL_THEME.primary,
              },
            ]}
          >
            {request.groupId.name}
          </Text>
          <Text style={[styles.component, { color: MEDICAL_THEME.neutral }]}>
            {request.componentId.name}
          </Text>
          {urgencyBadge}
        </View>
        <View style={styles.statusContainer}>
          {hasPendingRegistrations && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationText}>
                {request.numberPending}
              </Text>
            </View>
          )}
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  MEDICAL_THEME.status[request.status]?.bg ||
                  MEDICAL_THEME.status.pending.bg,
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color:
                    MEDICAL_THEME.status[request.status]?.text ||
                    MEDICAL_THEME.status.pending.text,
                },
              ]}
            >
              {request.status === "pending"
                ? "Chờ duyệt"
                : request.status === "approved"
                ? "Đã duyệt"
                : "Từ chối"}
            </Text>
          </View>
          <View
            style={[
              styles.quantityContainer,
              { backgroundColor: MEDICAL_THEME.primary + "20" },
            ]}
          >
            <Text style={[styles.quantity, { color: MEDICAL_THEME.primary }]}>
              {request.quantity} đơn vị
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <FontAwesome5
            name="user-injured"
            size={16}
            color={MEDICAL_THEME.primary}
          />
          <Text style={[styles.infoText, { color: MEDICAL_THEME.neutral }]}>
            {request.patientName}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <FontAwesome5
            name="calendar-alt"
            size={16}
            color={MEDICAL_THEME.primary}
          />
          <Text style={[styles.infoText, { color: MEDICAL_THEME.neutral }]}>
            Ngày nhận mong muốn: {formatDateTime(request.preferredDate)}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <FontAwesome5 name="users" size={16} color={MEDICAL_THEME.primary} />
          <Text style={[styles.infoText, { color: MEDICAL_THEME.neutral }]}>
            {request.numberRegistered || 0} người đăng ký hỗ trợ
          </Text>
        </View>
        {request.note && (
          <View style={styles.infoRow}>
            <FontAwesome5
              name="sticky-note"
              size={16}
              color={MEDICAL_THEME.primary}
            />
            <Text style={[styles.infoText, { color: MEDICAL_THEME.neutral }]}>
              {request.note}
            </Text>
          </View>
        )}
      </View>

      <View
        style={[styles.cardFooter, { borderTopColor: MEDICAL_THEME.border }]}
      >
        <TouchableOpacity
          style={[
            styles.viewButton,
            { backgroundColor: MEDICAL_THEME.primary },
          ]}
          onPress={onPress}
        >
          <Text
            style={[styles.viewButtonText, { color: MEDICAL_THEME.surface }]}
          >
            Xem chi tiết
          </Text>
          <FontAwesome5
            name="arrow-right"
            size={14}
            color={MEDICAL_THEME.surface}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const SupportRequestListScreen = () => {
  const navigation = useNavigation();
  const { facilityId } = useFacility();
  const [supportRequests, setSupportRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const fetchSupportRequests = async () => {
    try {
      setLoading(true);
      const response = await bloodRequestAPI.HandleBloodRequest(
        `/need-support`
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

  useFocusEffect(
    useCallback(() => {
      fetchSupportRequests();
    }, [])
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: MEDICAL_THEME.background }]}
    >
      <Header
        title="Yêu Cầu Cần Hỗ Trợ"
        showBackButton
        rightComponent={
          <FontAwesome5 name="filter" size={20} color={MEDICAL_THEME.primary} />
        }
      />

      <View
        style={[
          styles.searchContainer,
          { backgroundColor: MEDICAL_THEME.surface },
        ]}
      >
        <View
          style={[
            styles.searchBar,
            { backgroundColor: MEDICAL_THEME.background },
          ]}
        >
          <FontAwesome5 name="search" size={16} color={MEDICAL_THEME.neutral} />
          <TextInput
            style={[styles.searchInput, { color: MEDICAL_THEME.neutral }]}
            placeholder="Tìm kiếm yêu cầu..."
            placeholderTextColor={MEDICAL_THEME.neutral + "80"}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View
        style={[
          styles.filterContainer,
          { backgroundColor: MEDICAL_THEME.surface },
        ]}
      >
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
                { backgroundColor: MEDICAL_THEME.background },
                filter === item.value && {
                  backgroundColor: MEDICAL_THEME.primary,
                },
              ]}
              onPress={() => setFilter(item.value)}
            >
              <FontAwesome5
                name={item.icon}
                size={14}
                color={
                  filter === item.value
                    ? MEDICAL_THEME.surface
                    : MEDICAL_THEME.neutral
                }
              />
              <Text
                style={[
                  styles.filterChipText,
                  { color: MEDICAL_THEME.neutral },
                  filter === item.value && { color: MEDICAL_THEME.surface },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchSupportRequests}
          />
        }
      >
        {supportRequests.map((request) => (
          <RequestCard
            key={request._id}
            request={request}
            onPress={() =>
              navigation.navigate("SupportRequestDetail", {
                requestId: request._id,
              })
            }
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? 40 : 0,
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: MEDICAL_THEME.border,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: MEDICAL_THEME.border,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 8,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 16,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: MEDICAL_THEME.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  bloodInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  bloodType: {
    fontSize: 16,
    fontWeight: "bold",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  component: {
    fontSize: 14,
    fontWeight: "500",
  },
  urgentBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  urgentText: {
    fontSize: 12,
    fontWeight: "600",
  },
  quantityContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  quantity: {
    fontSize: 14,
    fontWeight: "600",
  },
  cardContent: {
    gap: 12,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    borderTopWidth: 1,
    paddingTop: 16,
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  notificationBadge: {
    backgroundColor: MEDICAL_THEME.danger,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: -10,
    right: -10,
    zIndex: 1,
  },
  notificationText: {
    color: MEDICAL_THEME.surface,
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default SupportRequestListScreen;
