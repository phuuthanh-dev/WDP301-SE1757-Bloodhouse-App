import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  Platform,
  Share,
  StatusBar,
} from "react-native";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import facilityAPI from "@/apis/facilityAPI";

export default function FacilityDetailcreen({ route, navigation }) {
  const { facilityId } = route.params;
  const [selectedTab, setSelectedTab] = useState("info"); // 'info' or 'reviews'
  const [facility, setFacility] = useState(null);

  useEffect(() => {
    const fetchFacility = async () => {
      const response = await facilityAPI.HandleFacility(`/${facilityId}`);
      setFacility(response.data);
    };
    fetchFacility();
  }, [facilityId]);

  // Mock reviews data (in a real app, this would come from an API)
  const reviews = [
    {
      id: 1,
      user: "Nguyễn Văn B",
      rating: 5,
      date: "20/02/2024",
      comment:
        "Nhân viên rất thân thiện, quy trình hiến máu nhanh chóng và chuyên nghiệp.",
      bloodType: "A+",
    },
    {
      id: 2,
      user: "Trần Thị C",
      rating: 4,
      date: "18/02/2024",
      comment: "Cơ sở vật chất tốt, sạch sẽ. Thời gian chờ hơi lâu.",
      bloodType: "O+",
    },
  ];

  const openMaps = () => {
    const scheme = Platform.select({
      ios: "maps:0,0?q=",
      android: "geo:0,0?q=",
    });
    const latLng = `10.7553,106.6658`; // Example coordinates for Ho Chi Minh City
    const label = facility.name;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });

    Linking.openURL(url);
  };

  const callCenter = () => {
    Linking.openURL("tel:+84123456789");
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Hãy cùng hiến máu tại ${facility.name}!\n${facility.address}`,
        title: "Chia sẻ trung tâm hiến máu",
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <MaterialIcons
        key={index}
        name={index < rating ? "star" : "star-border"}
        size={16}
        color="#FFD700"
      />
    ));
  };

  const renderReview = (review) => (
    <View key={review.id} style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View>
          <Text style={styles.reviewUser}>{review.user}</Text>
          <View style={styles.reviewRating}>
            {renderStars(review.rating)}
            <Text style={styles.reviewDate}> • {review.date}</Text>
          </View>
        </View>
        <View style={styles.bloodTypeChip}>
          <Text style={styles.bloodTypeText}>{review.bloodType}</Text>
        </View>
      </View>
      <Text style={styles.reviewComment}>{review.comment}</Text>
    </View>
  );

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.headerNav}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
          <MaterialIcons name="share" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView>
        <Image
          source={{ uri: facility?.mainImage?.url }}
          style={styles.image}
        />

        {/* Header Info */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.name}>{facility?.name}</Text>
            <View style={[
              styles.statusBadge,
              facility?.schedules?.[0]?.isOpen ? styles.openBadge : styles.closedBadge
            ]}>
              <Text style={[
                styles.statusText,
                facility?.schedules?.[0]?.isOpen ? styles.openText : styles.closedText
              ]}>
                {facility?.schedules?.[0]?.isOpen ? 'Đang mở cửa' : 'Đang đóng cửa'}
              </Text>
            </View>
          </View>
          <View style={styles.ratingContainer}>
            <MaterialIcons name="star" size={20} color="#FFD700" />
            <Text style={styles.rating}>{facility?.avgRating}</Text>
            <Text style={styles.reviewCount}>
              {" "}
              ({facility?.totalFeedback} đánh giá)
            </Text>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === "info" && styles.activeTab]}
            onPress={() => setSelectedTab("info")}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "info" && styles.activeTabText,
              ]}
            >
              Thông tin
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === "reviews" && styles.activeTab]}
            onPress={() => setSelectedTab("reviews")}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "reviews" && styles.activeTabText,
              ]}
            >
              Đánh giá
            </Text>
          </TouchableOpacity>
        </View>

        {selectedTab === "info" ? (
          <>
            {/* Info Cards */}
            <View style={styles.infoCard}>
              <View style={[styles.infoRow, { marginTop: 16 }]}>
                <MaterialIcons name="location-on" size={24} color="#FF6B6B" />
                <Text style={styles.infoText}>{facility?.address}</Text>
              </View>

              <View style={styles.infoRow}>
                <MaterialIcons name="access-time" size={24} color="#FF6B6B" />
                <Text style={styles.infoText}>
                  {facility?.schedules[0]?.openTime} -{" "}
                  {facility?.schedules[0]?.closeTime}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <MaterialIcons name="phone" size={24} color="#FF6B6B" />
                <Text style={styles.infoText}>{facility?.contactPhone}</Text>
              </View>

              <View style={styles.infoRow}>
                <MaterialIcons name="email" size={24} color="#FF6B6B" />
                <Text style={styles.infoText}>{facility?.contactEmail}</Text>
              </View>

              <View style={styles.infoRow}>
                <MaterialIcons name="info" size={24} color="#FF6B6B" />
                <Text style={styles.infoText}>
                  Vui lòng mang theo CMND/CCCD khi đến hiến máu
                </Text>
              </View>
            </View>

            {/* Requirements Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Yêu cầu hiến máu</Text>
              <View style={styles.requirementsList}>
                <RequirementItem
                  icon="weight"
                  text="Cân nặng trên 45kg"
                  description="Đảm bảo sức khỏe người hiến máu"
                />
                <RequirementItem
                  icon="calendar-alt"
                  text="Độ tuổi 18-60"
                  description="Trong độ tuổi cho phép"
                />
                <RequirementItem
                  icon="heartbeat"
                  text="Sức khỏe tốt"
                  description="Không mắc bệnh mãn tính"
                />
                <RequirementItem
                  icon="clock"
                  text="Nhịn ăn trước 4 giờ"
                  description="Đảm bảo kết quả xét nghiệm"
                />
              </View>
            </View>
          </>
        ) : (
          <View style={styles.reviewsContainer}>
            {reviews?.map(renderReview)}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <View style={styles.mainButtons}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton, styles.donateButton]}
              onPress={() => navigation.navigate("Donation", { facilityId })}
            >
              <MaterialIcons name="favorite" size={24} color="#FFFFFF" />
              <Text style={styles.buttonText}>Đăng ký hiến máu</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.primaryButton, styles.receiveButton]}
              onPress={() => navigation.navigate("ReceiveRequest", { facility })}
            >
              <MaterialIcons name="local-hospital" size={24} color="#FFFFFF" />
              <Text style={styles.buttonText}>Đăng ký nhận máu</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.secondaryButtons}>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={openMaps}
            >
              <MaterialIcons name="directions" size={24} color="#FF6B6B" />
              <Text style={styles.secondaryButtonText}>Chỉ đường</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={callCenter}
            >
              <MaterialIcons name="phone" size={24} color="#FF6B6B" />
              <Text style={styles.secondaryButtonText}>Gọi điện</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const RequirementItem = ({ icon, text, description }) => (
  <View style={styles.requirementItem}>
    <FontAwesome5 name={icon} size={20} color="#FF6B6B" />
    <View style={styles.requirementText}>
      <Text style={styles.requirementTitle}>{text}</Text>
      <Text style={styles.requirementDescription}>{description}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  headerNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "absolute",
    top: Platform.OS === "ios" ? 40 : StatusBar.currentHeight,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerButton: {
    padding: 8,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 20,
  },
  image: {
    width: "100%",
    height: 250,
  },
  header: {
    padding: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2D3436",
    flex: 1,
    marginRight: 12,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rating: {
    marginLeft: 4,
    fontWeight: "bold",
    color: "#FFB300",
    fontSize: 16,
  },
  reviewCount: {
    color: "#95A5A6",
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  openBadge: {
    backgroundColor: "#E8F5E9",
    borderColor: "#4CAF50",
  },
  closedBadge: {
    backgroundColor: "#FFEBEE",
    borderColor: "#F44336",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  openText: {
    color: "#2E7D32",
  },
  closedText: {
    color: "#C62828",
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#E9ECEF",
  },
  activeTab: {
    borderBottomColor: "#FF6B6B",
  },
  tabText: {
    fontSize: 16,
    color: "#95A5A6",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#FF6B6B",
    fontWeight: "bold",
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#2D3436",
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2D3436",
    marginBottom: 16,
  },
  bloodTypesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  bloodTypeCard: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    margin: 4,
  },
  bloodTypeCardText: {
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "bold",
  },
  requirementsList: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  requirementText: {
    marginLeft: 12,
    flex: 1,
  },
  requirementTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2D3436",
    marginBottom: 4,
  },
  requirementDescription: {
    fontSize: 14,
    color: "#636E72",
  },
  reviewsContainer: {
    padding: 16,
  },
  reviewCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  reviewUser: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2D3436",
    marginBottom: 4,
  },
  reviewRating: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewDate: {
    color: "#95A5A6",
    fontSize: 14,
  },
  reviewComment: {
    color: "#636E72",
    fontSize: 14,
    lineHeight: 20,
  },
  bloodTypeChip: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bloodTypeText: {
    color: "#4CAF50",
    fontSize: 12,
    fontWeight: "bold",
  },
  actionButtons: {
    padding: 16,
    paddingBottom: 32,
  },
  mainButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  primaryButton: {
    flex: 0.48,
  },
  donateButton: {
    backgroundColor: "#FF6B6B",
  },
  receiveButton: {
    backgroundColor: "#4CAF50",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  secondaryButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  secondaryButton: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    flex: 0.48,
    borderWidth: 1,
    borderColor: "#FF6B6B",
  },
  secondaryButtonText: {
    color: "#FF6B6B",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});
