import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  SafeAreaView,
  Platform,
} from "react-native";
import { MaterialIcons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import contentAPI from "@/apis/contentAPI";
import { formatDateTime } from "@/utils/formatHelpers";
import bloodGroupAPI from "@/apis/bloodGroup";
import { useLocation } from "@/contexts/LocationContext";
import * as Speech from "expo-speech";
import eventAPI from "@/apis/eventAPI";
import { getStatusEventColor } from "@/constants/eventStatus";

export default function HomeScreen({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const { location } = useLocation();
  const [bloodGroup, setBloodGroup] = useState(null);
  const [address, setAddress] = useState("Đang tải vị trí...");
  const [blogPosts, setBlogPosts] = useState([]);
  const [bloodGroupPositive, setBloodGroupPositive] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchBlogPosts();
    fetchBloodGroupPositive();
    fetchEvents();
  }, []);

  useEffect(() => {
    const updateCurrentLocation = async () => {
      if (location) {
        const address = await getAddressFromCoords(
          location.latitude,
          location.longitude
        );
        setAddress(address);
      }
    };
    updateCurrentLocation();
  }, [location]);

  // useEffect(() => {
  //   Speech.speak("Chào mừng đến với Bờlớt hâu", {
  //     language: "vi-VN",
  //     pitch: 1,
  //     rate: 0.4,
  //     onDone: () => {
  //       console.log("Speech done");
  //     },
  //     onError: (error) => {
  //       console.log("Speech error:", error);
  //     },
  //   });
  // }, []);

  const getAddressFromCoords = async (latitude, longitude) => {
    try {
      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      if (addresses.length > 0) {
        const addr = addresses[0];
        return `${addr.street}, ${addr.region}, ${addr.country}`;
      } else {
        return "Không tìm thấy địa chỉ";
      }
    } catch (error) {
      console.error("Lỗi khi chuyển đổi tọa độ:", error);
      return "Lỗi khi lấy địa chỉ";
    }
  };

  const fetchBlogPosts = async () => {
    const response = await contentAPI.HandleContent("?page=1&limit=10");
    setBlogPosts(response.data.data);
  };

  const fetchBloodGroupPositive = async () => {
    const response = await bloodGroupAPI.HandleBloodGroup("/positive");
    setBloodGroupPositive(response.data);
  };

  const fetchEvents = async () => {
    try {
      const response = await eventAPI.HandleEvent("?page=1&limit=10");
      setEvents(response.data.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const onRefresh = React.useCallback(() => {
    fetchBlogPosts();
    fetchBloodGroupPositive();
    fetchEvents();
  }, []);

  const getActionButtonStyle = (type) => {
    switch (type) {
      case "compatibility":
        return {
          icon: "compare-arrows",
          color: "#2196F3", // Medical blue for compatibility
          bgColor: "rgba(33, 150, 243, 0.1)",
        };
      case "request":
        return {
          icon: "local-hospital",
          color: "#FF5252", // Red for emergency/request
          bgColor: "rgba(255, 82, 82, 0.1)",
        };
      case "nearby":
        return {
          icon: "near-me",
          color: "#9C27B0", // Purple for location
          bgColor: "rgba(156, 39, 176, 0.1)",
        };
      case "history":
        return {
          icon: "history",
          color: "#607D8B", // Blue grey for history
          bgColor: "rgba(96, 125, 139, 0.1)",
        };
      case "support":
        return {
          icon: "volunteer-activism",
          color: "#E91E63", // Pink for support
          bgColor: "rgba(233, 30, 99, 0.1)",
        };
      case "event":
        return {
          icon: "event",
          color: "#E91E63", // Anh đỏ
          bgColor: "rgba(233, 30, 99, 0.1)",
        };
      default:
        return {
          color: "#FF6B6B",
          bgColor: "rgba(255, 107, 107, 0.1)",
        };
    }
  };

  const renderEventCard = (event) => (
    <TouchableOpacity
      key={event?._id}
      style={styles.eventCardHorizontal}
      onPress={() =>
        navigation.navigate("EventDetail", { eventId: event?._id })
      }
    >
      <Image
        source={{ uri: event?.bannerUrl }}
        style={styles.eventImageHorizontal}
        resizeMode="cover"
      />
      <View style={styles.eventOverlay}>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusEventColor(event?.status).bg },
          ]}
        >
          <MaterialCommunityIcons
            name={getStatusEventColor(event?.status).icon}
            size={14}
            color={getStatusEventColor(event?.status).text}
            style={styles.statusIcon}
          />
          <Text
            style={[
              styles.statusText,
              { color: getStatusEventColor(event?.status).text },
            ]}
          >
            {event?.status?.toUpperCase()}
          </Text>
        </View>
      </View>
      <View style={styles.eventContentHorizontal}>
        <Text style={styles.eventTitle} numberOfLines={2}>
          {event?.title}
        </Text>
        <View style={styles.eventInfoRow}>
          <View style={styles.eventInfo}>
            <MaterialIcons name="access-time" size={14} color="#95A5A6" />
            <Text style={styles.eventInfoText}>
              {formatDateTime(event?.startTime)}
            </Text>
          </View>
          <View style={styles.eventInfo}>
            <FontAwesome5 name="user-friends" size={14} color="#95A5A6" />
            <Text style={styles.eventInfoText}>
              {event?.registeredParticipants || 0}/{event?.expectedParticipants}
            </Text>
          </View>
        </View>
        <View style={[styles.facilityInfo, { paddingTop: 0 }]}>
          <MaterialIcons name="location-on" size={14} color="#FF6B6B" />
          <Text style={styles.facilityName} numberOfLines={1}>
            {event?.address}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderBloodTypeCard = (info) => (
    <TouchableOpacity
      key={info._id}
      style={styles.bloodTypeCard}
      onPress={() => navigation.navigate("BloodTypeDetail", { groupId: info._id })}
    >
      <View style={styles.bloodTypeHeader}>
        <View style={styles.bloodTypeContainer}>
          <View style={styles.bloodTypeNameContainer}>
            <Text style={styles.bloodType}>{info.name}</Text>
            <View style={styles.bloodTypeIndicator} />
          </View>
          <View style={styles.percentageContainer}>
            <Text style={styles.percentage}>{info.populationRate}%</Text>
            <Text style={styles.percentageLabel}>dân số</Text>
          </View>
        </View>
      </View>
      <View style={styles.divider} />
      <View style={styles.characteristicsContainer}>
        {info.characteristics?.map((characteristic, index) => (
          <View key={index} style={styles.characteristicItem}>
            <MaterialIcons
              name="check-circle"
              size={16}
              color="#FF6B6B"
              style={styles.characteristicIcon}
            />
            <Text style={styles.characteristicText}>{characteristic}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "published":
        return { bg: "#E3FCEF", text: "#00B074" };
      case "draft":
        return { bg: "#FFF4E5", text: "#FFA043" };
      case "cancelled":
        return { bg: "#FFE8E8", text: "#FF4D4F" };
      default:
        return { bg: "#F0F0F0", text: "#909090" };
    }
  };

  const renderBlogCardHorizontal = (blog) => (
    <TouchableOpacity
      key={blog?._id}
      style={styles.blogCardHorizontal}
      onPress={() => navigation.navigate("BlogDetail", { blog })}
    >
      <Image
        source={{ uri: blog?.image }}
        style={styles.blogImageHorizontal}
        defaultSource={require("@/assets/images/onboarding1.png")}
      />
      <View style={styles.blogContentHorizontal}>
        <View style={styles.categoryContainer}>
          <Text style={styles.categoryText}>
            {blog?.categoryId?.name?.replace("_", " ").toUpperCase()}
          </Text>
        </View>
        <Text style={styles.blogTitleHorizontal} numberOfLines={2}>
          {blog?.title}
        </Text>
        <View style={styles.authorInfoHorizontal}>
          <Image
            source={{ uri: blog?.authorId?.avatar }}
            style={styles.authorAvatarSmall}
          />
          <Text style={styles.authorNameSmall} numberOfLines={1}>
            {blog?.authorId?.fullName}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Banner */}
        <View style={styles.banner}>
          <View style={styles.locationContainer}>
            <MaterialIcons name="location-on" size={20} color="#FFFFFF" />
            <Text style={styles.locationText} numberOfLines={1}>
              {address}
            </Text>
          </View>
          <Text style={styles.bannerTitle}>Trung tâm Y tế Quận 5</Text>
          <Text style={styles.bannerSubtitle}>Cùng chung tay vì cộng đồng</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                {
                  backgroundColor:
                    getActionButtonStyle("compatibility").bgColor,
                },
              ]}
              onPress={() => navigation.navigate("BloodCompatibility")}
            >
              <MaterialIcons
                name="compare-arrows"
                size={24}
                color={getActionButtonStyle("compatibility").color}
              />
              <Text
                style={[
                  styles.actionText,
                  { color: getActionButtonStyle("compatibility").color },
                ]}
              >
                Kiểm tra tương thích
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: getActionButtonStyle("request").bgColor },
              ]}
              onPress={() => navigation.navigate("ReceiveRequest")}
            >
              <MaterialIcons
                name="local-hospital"
                size={24}
                color={getActionButtonStyle("request").color}
              />
              <Text
                style={[
                  styles.actionText,
                  { color: getActionButtonStyle("request").color },
                ]}
              >
                Yêu cầu nhận máu
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: getActionButtonStyle("nearby").bgColor },
              ]}
              onPress={() => navigation.navigate("Nearby")}
            >
              <MaterialIcons
                name="near-me"
                size={24}
                color={getActionButtonStyle("nearby").color}
              />
              <Text
                style={[
                  styles.actionText,
                  { color: getActionButtonStyle("nearby").color },
                ]}
              >
                Tìm vị trí gần đây
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.quickActions, styles.quickActionsSecondRow]}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: getActionButtonStyle("nearby").bgColor },
              ]}
              onPress={() => navigation.navigate("EventList")}
            >
              <MaterialIcons
                name="event"
                size={24}
                color={getActionButtonStyle("event").color}
              />
              <Text
                style={[
                  styles.actionText,
                  { color: getActionButtonStyle("event").color },
                ]}
              >
                Sự kiện hiến máu
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: getActionButtonStyle("support").bgColor },
              ]}
              onPress={() => navigation.navigate("SupportRequestScreen")}
            >
              <MaterialIcons
                name="volunteer-activism"
                size={24}
                color={getActionButtonStyle("support").color}
              />
              <Text
                style={[
                  styles.actionText,
                  { color: getActionButtonStyle("support").color },
                ]}
              >
                Hỗ trợ yêu cầu
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: getActionButtonStyle("history").bgColor },
              ]}
              onPress={() => navigation.navigate("DonationHistory")}
            >
              <MaterialIcons
                name="history"
                size={24}
                color={getActionButtonStyle("history").color}
              />
              <Text
                style={[
                  styles.actionText,
                  { color: getActionButtonStyle("history").color },
                ]}
              >
                Lịch sử yêu cầu
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Blood Type Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Thông tin nhóm máu</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("BloodTypeList")}
            >
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollContent}
          >
            {bloodGroupPositive.map(renderBloodTypeCard)}
          </ScrollView>
        </View>

        {/* Events Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sự kiện hiến máu</Text>
            <TouchableOpacity onPress={() => navigation.navigate("EventList")}>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollContent}
          >
            {events.map(renderEventCard)}
          </ScrollView>
        </View>

        {/* Blog Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Bài viết & Chia sẻ</Text>
            <TouchableOpacity onPress={() => navigation.navigate("BlogList")}>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollContent}
          >
            {blogPosts.map(renderBlogCardHorizontal)}
          </ScrollView>
        </View>
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
  banner: {
    backgroundColor: "#FF6B6B",
    padding: 20,
    paddingTop: 40,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  bannerSubtitle: {
    fontSize: 16,
    color: "#FFFFFF",
    opacity: 0.9,
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  quickActionsContainer: {
    backgroundColor: "#FFFFFF",
    marginTop: -10,
    marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#E3E8F0",
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    gap: 8,
  },
  quickActionsSecondRow: {
    borderTopWidth: 1,
    borderTopColor: "#E3E8F0",
  },
  actionButton: {
    alignItems: "center",
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E3E8F0",
  },
  actionText: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "500",
    color: "#1A237E",
    textAlign: "center",
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A237E",
  },
  seeAll: {
    color: "#2196F3",
    fontSize: 14,
    fontWeight: "600",
  },
  eventCardHorizontal: {
    width: 280,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginRight: 12,
    marginBottom: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E3E8F0",
  },
  eventImageHorizontal: {
    width: "100%",
    height: 160,
  },
  eventOverlay: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  eventContentHorizontal: {
    padding: 12,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2D3436",
    marginBottom: 8,
  },
  eventInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  eventInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  eventInfoText: {
    fontSize: 12,
    color: "#95A5A6",
    marginLeft: 4,
  },
  facilityInfo: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  facilityName: {
    fontSize: 12,
    color: "#FF6B6B",
    marginLeft: 4,
    fontWeight: "500",
  },
  blogCardHorizontal: {
    width: 280,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginRight: 12,
    marginBottom: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E3E8F0",
  },
  blogImageHorizontal: {
    width: "100%",
    height: 140,
  },
  blogContentHorizontal: {
    padding: 12,
  },
  blogTitleHorizontal: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2D3436",
    marginBottom: 8,
    lineHeight: 20,
  },
  authorInfoHorizontal: {
    flexDirection: "row",
    alignItems: "center",
  },
  authorAvatarSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  authorNameSmall: {
    fontSize: 12,
    color: "#95A5A6",
    flex: 1,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 8,
    borderRadius: 8,
  },
  locationText: {
    fontSize: 14,
    color: "#FFFFFF",
    marginLeft: 4,
  },
  categoryContainer: {
    backgroundColor: "#F0F7FF",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  categoryText: {
    color: "#2196F3",
    fontSize: 12,
    fontWeight: "600",
  },
  // Blood Type Card Styles
  bloodTypeCard: {
    width: 280,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginRight: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E3E8F0",
  },
  bloodTypeHeader: {
    marginBottom: 12,
  },
  bloodTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bloodTypeNameContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  bloodType: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2196F3",
    marginRight: 8,
  },
  bloodTypeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF6B6B",
  },
  percentageContainer: {
    backgroundColor: "#F0F7FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: "center",
  },
  percentage: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2196F3",
  },
  percentageLabel: {
    fontSize: 12,
    color: "#5C6BC0",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#E3E8F0",
    marginVertical: 12,
  },
  characteristicsContainer: {
    paddingVertical: 8,
  },
  characteristicItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    backgroundColor: "#F8FAFC",
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E3E8F0",
  },
  characteristicIcon: {
    marginRight: 8,
  },
  characteristicText: {
    fontSize: 14,
    color: "#2D3436",
    flex: 1,
    fontWeight: "500",
  },
  horizontalScrollContent: {
    // paddingLeft: 16,
    paddingRight: 8,
    paddingBottom: 8,
  },
});
