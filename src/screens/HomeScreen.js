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
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import * as Location from "expo-location";

export default function HomeScreen({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState("Đang tải vị trí...");

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setAddress("Không thể lấy vị trí");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLocation(location);

      // Get address from coordinates
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address) {
        const locationString = `${address.street || ""}, ${
          address.district || ""
        }, ${address.city || ""}`;
        setAddress(locationString);
      }
    } catch (error) {
      setAddress("Không thể lấy vị trí");
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate data fetching
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  // Mock data for blood type information
  const bloodTypeInfo = [
    {
      type: "A+",
      canGiveTo: ["A+", "AB+"],
      canReceiveFrom: ["A+", "A-", "O+", "O-"],
      percentage: "29.1%",
    },
    {
      type: "O+",
      canGiveTo: ["O+", "A+", "B+", "AB+"],
      canReceiveFrom: ["O+", "O-"],
      percentage: "37.4%",
    },
    {
      type: "B+",
      canGiveTo: ["B+", "AB+"],
      canReceiveFrom: ["B+", "B-", "O+", "O-"],
      percentage: "29.1%",
    },
    {
      type: "AB+",
      canGiveTo: ["AB+", "AB-"],
      canReceiveFrom: ["A+", "A-", "B+", "B-", "AB+", "AB-"],
      percentage: "0.4%",
    },
    // Add more blood types...
  ];

  // Mock data for blog posts
  const blogPosts = [
    {
      id: 1,
      title: "Những điều cần biết trước khi hiến máu",
      author: "BS. Nguyễn Văn A",
      date: "22/02/2024",
      image:
        "https://vienhuyethoc.vn/wp-content/uploads/2021/07/luu-y-truoc-va-sau-khi-hien-mau-1-1024x628.jpg",
      readTime: "5 phút",
    },
    {
      id: 2,
      title: "Chế độ ăn uống sau khi hiến máu",
      author: "BS. Trần Thị B",
      date: "20/02/2024",
      image:
        "https://cdn.tgdd.vn/Files/2022/06/13/1439533/can-luu-y-gi-truoc-va-sau-khi-hien-mau-tinh-nguyen-202206131418440901.jpg",
      readTime: "3 phút",
    },
  ];

  const renderBloodTypeCard = (info) => (
    <TouchableOpacity
      key={info.type}
      style={styles.bloodTypeCard}
      onPress={() => navigation.navigate("BloodTypeDetail", { info })}
    >
      <View style={styles.bloodTypeHeader}>
        <View style={styles.bloodTypeContainer}>
          <Text style={styles.bloodType}>{info.type}</Text>
          <View style={styles.percentageContainer}>
            <Text style={styles.percentage}>{info.percentage}</Text>
            <Text style={styles.percentageLabel}>dân số</Text>
          </View>
        </View>
      </View>
      <View style={styles.divider} />
      <View style={styles.compatibilityInfo}>
        <View style={styles.compatibilitySection}>
          <Text style={styles.compatibilityLabel}>Có thể cho</Text>
          <View style={styles.bloodTypeList}>
            {info.canGiveTo.map((type) => (
              <View key={`give-${type}`} style={styles.smallBloodType}>
                <Text style={styles.smallBloodTypeText}>{type}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.verticalDivider} />
        <View style={styles.compatibilitySection}>
          <Text style={styles.compatibilityLabel}>Có thể nhận</Text>
          <View style={styles.bloodTypeList}>
            {info.canReceiveFrom.map((type) => (
              <View key={`receive-${type}`} style={styles.smallBloodType}>
                <Text style={styles.smallBloodTypeText}>{type}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderBlogPost = (post) => (
    <TouchableOpacity
      key={post.id}
      style={styles.blogCard}
      onPress={() => navigation.navigate("BlogDetail", { blog: post })}
    >
      <Image
        source={{ uri: post.image }}
        style={styles.blogImage}
        defaultSource={require("../../assets/onboarding1.png")}
      />
      <View style={styles.blogContent}>
        <Text style={styles.blogTitle}>{post.title}</Text>
        <View style={styles.blogMeta}>
          <Text style={styles.blogAuthor}>{post.author}</Text>
          <Text style={styles.blogDate}>{post.date}</Text>
          <View style={styles.readTimeContainer}>
            <MaterialIcons name="access-time" size={12} color="#95A5A6" />
            <Text style={styles.readTime}>{post.readTime}</Text>
          </View>
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
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("Donation")}
          >
            <FontAwesome5
              name="hand-holding-medical"
              size={24}
              color="#FF6B6B"
            />
            <Text style={styles.actionText}>Đăng ký hiến máu</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("EmergencyRequest")}
          >
            <MaterialIcons name="emergency" size={24} color="#FF6B6B" />
            <Text style={styles.actionText}>Yêu cầu khẩn cấp</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("Nearby")}
          >
            <MaterialIcons name="near-me" size={24} color="#FF6B6B" />
            <Text style={styles.actionText}>Tìm Gần đây</Text>
          </TouchableOpacity>
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
            contentContainerStyle={{ paddingBottom: 4 }}
          >
            {bloodTypeInfo.map(renderBloodTypeCard)}
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
          {blogPosts.map(renderBlogPost)}
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
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  bannerSubtitle: {
    fontSize: 16,
    color: "#FFFFFF",
    opacity: 0.9,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
    backgroundColor: "#FFFFFF",
    marginTop: -10,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButton: {
    alignItems: "center",
  },
  actionText: {
    marginTop: 8,
    fontSize: 12,
    color: "#2D3436",
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
    fontSize: 20,
    fontWeight: "bold",
    color: "#2D3436",
  },
  seeAll: {
    color: "#FF6B6B",
    fontSize: 14,
    fontWeight: "500",
  },
  bloodTypeCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    marginRight: 12,
    width: 300,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    marginBottom: 8,
  },
  bloodTypeHeader: {
    marginBottom: 12,
  },
  bloodTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bloodType: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FF6B6B",
  },
  percentageContainer: {
    alignItems: "flex-end",
  },
  percentage: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2D3436",
  },
  percentageLabel: {
    fontSize: 12,
    color: "#95A5A6",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 12,
  },
  verticalDivider: {
    width: 1,
    backgroundColor: "#E2E8F0",
    marginHorizontal: 12,
    alignSelf: "stretch",
  },
  compatibilityInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  compatibilitySection: {
    flex: 1,
  },
  compatibilityLabel: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 8,
    fontWeight: "500",
  },
  bloodTypeList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  smallBloodType: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  smallBloodTypeText: {
    fontSize: 13,
    color: "#334155",
    fontWeight: "600",
  },
  blogCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 16,
    borderColor: "#E2E8F0",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
    overflow: "hidden",
  },
  blogImage: {
    width: "100%",
    height: 200,
  },
  blogContent: {
    padding: 16,
  },
  blogTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D3436",
    marginBottom: 8,
  },
  blogMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  blogAuthor: {
    fontSize: 14,
    color: "#2D3436",
    marginRight: 8,
  },
  blogDate: {
    fontSize: 14,
    color: "#95A5A6",
    marginRight: 8,
  },
  readTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  readTime: {
    fontSize: 14,
    color: "#95A5A6",
    marginLeft: 4,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: "#FFFFFF",
    marginLeft: 4,
  },
});
