import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Linking,
  Dimensions,
  Share,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import {
  MaterialIcons,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import RenderHtml from "react-native-render-html";
import { formatDateTime } from "@/utils/formatHelpers";
import Toast from "react-native-toast-message";
import { getStatusEventColor } from "@/constants/eventStatus";
import eventAPI from "@/apis/eventAPI";

const { width } = Dimensions.get("window");

export default function EventDetailScreen({ route, navigation }) {
  const { eventId } = route.params;
  const [isRegistering, setIsRegistering] = useState(false);
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      setIsLoading(true);
      const response = await eventAPI.HandleEvent(`/${eventId}`);
      setEvent(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Tham gia sự kiện hiến máu: ${
          event.title
        }\nThời gian: ${formatDateTime(event.startTime)}\nĐịa điểm: ${
          event.address
        }`,
        title: event.title,
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Không thể chia sẻ sự kiện",
      });
    }
  };

  const handleRegister = async () => {
    try {
      setIsRegistering(true);
      // TODO: Implement registration logic
      Toast.show({
        type: "success",
        text1: "Đăng ký thành công",
        text2: "Bạn sẽ nhận được thông báo chi tiết qua email",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Đăng ký thất bại",
        text2: "Vui lòng thử lại sau",
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const handleContact = (type) => {
    const value = type === "phone" ? event.contactPhone : event.contactEmail;
    const url = type === "phone" ? `tel:${value}` : `mailto:${value}`;
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      }
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchEvent} />
        }
      >
        {/* Banner Image with Gradient Overlay */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: event?.bannerUrl }}
            style={styles.bannerImage}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay} />

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <MaterialIcons name="share" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View style={styles.mainContent}>
          {/* Title Section */}
          <View style={styles.titleSection}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{event?.title}</Text>
            </View>

            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusEventColor(event?.status).bg },
                ]}
              >
                <MaterialCommunityIcons
                  name={getStatusEventColor(event?.status).icon}
                  size={16}
                  color={getStatusEventColor(event?.status).text}
                  style={styles.statusIcon}
                />
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusEventColor(event?.status).text },
                  ]}
                >
                  {event?.status.toUpperCase()}
                </Text>
              </View>

              <View style={styles.participantsInfo}>
                <FontAwesome5 name="user-friends" size={14} color="#95A5A6" />
                <Text style={styles.participantsText}>
                  <Text style={styles.highlightText}>
                    {event?.registeredParticipants || 0}
                  </Text>
                  /{event?.expectedParticipants}
                </Text>
              </View>
            </View>

            <View style={styles.facilityInfo}>
              <FontAwesome5 name="hospital" size={16} color="#FF6B6B" />
              <Text style={styles.facilityName}>{event?.facilityId?.name}</Text>
            </View>
          </View>

          {/* Info Cards */}
          <View style={styles.infoSection}>
            <View style={styles.infoCard}>
              <View style={styles.infoIcon}>
                <MaterialIcons name="access-time" size={24} color="#FF6B6B" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Thời gian</Text>
                <Text style={styles.infoValue}>
                  {formatDateTime(event?.startTime)} đến{" "}
                  {formatDateTime(event?.endTime)}
                </Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoIcon}>
                <MaterialIcons name="location-on" size={24} color="#FF6B6B" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Địa điểm</Text>
                <Text style={styles.infoValue}>{event?.address}</Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Thông tin chi tiết</Text>
            <RenderHtml
              contentWidth={width - 32}
              source={{ html: event?.description }}
              tagsStyles={{
                p: { color: "#2D3436", lineHeight: 24, marginBottom: 10 },
                img: { borderRadius: 8, marginVertical: 10 },
              }}
            />
          </View>

          {/* Contact Section */}
          <View style={styles.contactSection}>
            <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
            <View style={styles.contactButtons}>
              <TouchableOpacity
                style={[styles.contactButton, { backgroundColor: "#FF6B6B" }]}
                onPress={() => handleContact("phone")}
              >
                <MaterialIcons name="phone" size={24} color="white" />
                <Text style={styles.contactButtonText}>Gọi điện</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.contactButton, { backgroundColor: "#4A90E2" }]}
                onPress={() => handleContact("email")}
              >
                <MaterialIcons name="email" size={24} color="white" />
                <Text style={styles.contactButtonText}>Gửi email</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Creator Info */}
          <View style={styles.creatorSection}>
            <Image
              source={{ uri: event?.createdBy?.avatar }}
              style={styles.creatorAvatar}
            />
            <View style={styles.creatorInfo}>
              <Text style={styles.creatorLabel}>Người tạo sự kiện</Text>
              <Text style={styles.creatorName}>
                {event?.createdBy?.fullName}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Register Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.registerButton,
            (isRegistering || event?.status !== "published") &&
              styles.disabledButton,
          ]}
          onPress={handleRegister}
          disabled={isRegistering || event?.status !== "published"}
        >
          {isRegistering ? (
            <Text style={styles.registerButtonText}>Đang đăng ký...</Text>
          ) : (
            <Text style={styles.registerButtonText}>
              {event?.status === "published"
                ? "Đăng ký tham gia"
                : "Không thể đăng ký"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    position: "relative",
    height: width * 0.6,
  },
  bannerImage: {
    width: width,
    height: "100%",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  mainContent: {
    padding: 16,
    marginTop: -20,
    backgroundColor: "#F8F9FA",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  titleSection: {
    padding: 16,
    backgroundColor: "white",
  },
  titleRow: {
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2D3436",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
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
  participantsInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  participantsText: {
    fontSize: 12,
    color: "#95A5A6",
    marginLeft: 6,
    fontWeight: "500",
  },
  facilityInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF0F0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  facilityName: {
    fontSize: 16,
    color: "#FF6B6B",
    marginLeft: 8,
    fontWeight: "500",
  },
  infoSection: {
    padding: 16,
    backgroundColor: "white",
    marginTop: 8,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF0F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: "#95A5A6",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: "#2D3436",
    lineHeight: 24,
  },
  highlightText: {
    color: "#FF6B6B",
    fontWeight: "bold",
  },
  descriptionSection: {
    padding: 16,
    backgroundColor: "white",
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2D3436",
    marginBottom: 12,
  },
  contactSection: {
    padding: 16,
    backgroundColor: "white",
    marginTop: 8,
  },
  contactButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  contactButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 6,
  },
  contactButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  creatorSection: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    marginTop: 8,
    marginBottom: 100,
  },
  creatorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  creatorInfo: {
    flex: 1,
  },
  creatorLabel: {
    fontSize: 14,
    color: "#95A5A6",
  },
  creatorName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3436",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  registerButton: {
    backgroundColor: "#FF6B6B",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#95A5A6",
  },
  registerButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
