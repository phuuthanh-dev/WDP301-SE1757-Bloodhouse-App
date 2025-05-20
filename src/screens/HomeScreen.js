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
import contentAPI from "../apis/contentAPI";
import { formatDateTime } from "../utils/formatHelpers";
import bloodGroupAPI from "../apis/bloodGroup";
import { useLocation } from "../contexts/LocationContext";

export default function HomeScreen({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const { location } = useLocation();
  const [bloodGroup, setBloodGroup] = useState(null);
  const [address, setAddress] = useState("Đang tải vị trí...");
  const [blogPosts, setBlogPosts] = useState([]);
  const [bloodGroupPositive, setBloodGroupPositive] = useState([]);

  useEffect(() => {
    fetchBlogPosts();
    fetchBloodGroupPositive();
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
    const response = await contentAPI.HandleContent();
    setBlogPosts(response.data);
  };

  const fetchBloodGroupPositive = async () => {
    const response = await bloodGroupAPI.HandleBloodGroup("/positive");
    setBloodGroupPositive(response.data);
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate data fetching
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const renderBloodTypeCard = (info) => (
    <TouchableOpacity
      key={info._id}
      style={styles.bloodTypeCard}
      onPress={() => navigation.navigate("BloodTypeDetail", { info })}
    >
      <View style={styles.bloodTypeHeader}>
        <View style={styles.bloodTypeContainer}>
          <Text style={styles.bloodType}>{info.name}</Text>
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

  const renderBlogPost = (blog) => (
    <TouchableOpacity
      key={blog?._id}
      style={styles.blogCard}
      onPress={() => navigation.navigate("BlogDetail", { blog })}
    >
      <Image
        source={{ uri: blog?.image }}
        style={styles.blogImage}
        defaultSource={require("../../assets/onboarding1.png")}
      />
      <View style={styles.blogContent}>
        <View style={styles.categoryContainer}>
          <Text style={styles.categoryText}>
            {blog?.categoryId?.name?.replace("_", " ").toUpperCase()}
          </Text>
        </View>
        <Text style={styles.blogTitle} numberOfLines={2}>
          {blog?.title}
        </Text>
        <View style={styles.blogMeta}>
          <View style={styles.authorContainer}>
            <Image
              source={{ uri: blog?.authorId?.avatar }}
              style={styles.authorAvatar}
              // defaultSource={require("../../assets/default-avatar.png")}
            />
            <View style={styles.authorInfo}>
              <Text style={styles.blogAuthor}>{blog?.authorId?.fullName}</Text>
              <View style={styles.readTimeContainer}>
                <MaterialIcons name="access-time" size={12} color="#95A5A6" />
                <Text style={styles.blogDate}>
                  {formatDateTime(blog?.createdAt)}
                </Text>
              </View>
            </View>
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
            {bloodGroupPositive.map(renderBloodTypeCard)}
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
  characteristicsContainer: {
    paddingVertical: 8,
  },
  characteristicItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  characteristicIcon: {
    marginRight: 8,
  },
  characteristicText: {
    fontSize: 14,
    color: "#2D3436",
    flex: 1,
  },
  blogCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 20,
    borderColor: "#E2E8F0",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    overflow: "hidden",
  },
  blogImage: {
    width: "100%",
    height: 200,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  blogContent: {
    padding: 16,
  },
  blogTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D3436",
    marginBottom: 12,
    lineHeight: 24,
  },
  blogMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  authorContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#2D3436",
  },
  authorInfo: {
    flex: 1,
  },
  blogAuthor: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2D3436",
    marginBottom: 4,
  },
  readTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  blogDate: {
    fontSize: 12,
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
  categoryContainer: {
    backgroundColor: "#FFE8E8",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  categoryText: {
    color: "#FF6B6B",
    fontSize: 12,
    fontWeight: "600",
  },
});
