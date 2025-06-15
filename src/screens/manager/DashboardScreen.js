import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
  RefreshControl,
  Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { authSelector } from "@/redux/reducers/authReducer";
import { useFacility } from "@/contexts/FacilityContext";
import facilityAPI from "@/apis/facilityAPI";
import Header from "@/components/Header";

const screenWidth = Dimensions.get('window').width;
const cardWidth = (screenWidth - 48) / 2; // 48 = padding left 16 + padding right 16 + gap 16

export default function DashboardScreen({ navigation }) {
  const { user } = useSelector(authSelector);
  const { facilityName, facilityId } = useFacility();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  const dashboardCards = [
    {
      id: "1",
      title: "Kho Máu",
      description: "Quản lý lượng máu",
      icon: "opacity",
      route: "BloodInventory",
      stats: {
        total: loading ? "..." : stats.totalBloodInventory?.toString() || "0",
        label: "Tổng Đơn Vị",
      },
      color: "#FF6B6B",
    },
    {
      id: "2",
      title: "Người Hiến",
      description: "Quản lý người hiến",
      icon: "people",
      route: "DonationList",
      stats: {
        total: loading ? "..." : stats.totalDonationRequestPending?.toString() || "0",
        label: "Chờ Duyệt",
      },
      color: "#2ED573",
    },
    {
      id: "3",
      title: "Nhận Máu",
      description: "Yêu cầu nhận máu",
      icon: "request-page",
      route: "ReceiveRequestList",
      stats: {
        total: loading ? "..." : stats.totalReceiveRequestPending?.toString() || "0",
        label: "Chờ Duyệt",
      },
      color: "#FF6B6B",
    },
    {
      id: "4",
      title: "Hiến Máu",
      description: "Cuộc hẹn hiến máu",
      icon: "event",
      route: "DonationRequests",
      stats: {
        total: loading ? "..." : stats.totalDonationRequestPending?.toString() || "0",
        label: "Chờ Duyệt",
      },
      color: "#1E90FF",
    },
    {
      id: "5",
      title: "Hỗ Trợ",
      description: "Yêu cầu cần hỗ trợ",
      icon: "volunteer-activism",
      route: "SupportRequestList",
      stats: {
        total: loading ? "..." : stats.totalSupportRequests?.toString() || "0",
        label: "Yêu Cầu",
      },
      color: "#FF4757",
    },
  ];

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await facilityAPI.HandleFacility(`/${facilityId}/stats`);
      if (response.status === 200) {
        setStats(response.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const renderDashboardCard = (card) => (
    <TouchableOpacity
      key={card.id}
      style={[styles.card, { width: cardWidth }]}
      onPress={() => navigation.navigate(card.route)}
    >
      <View style={styles.cardHeader}>
        <View
          style={[styles.iconContainer, { backgroundColor: card.color + "20" }]}
        >
          <MaterialIcons name={card.icon} size={24} color={card.color} />
        </View>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{card.title}</Text>
        <Text style={styles.cardDescription}>{card.description}</Text>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.statsNumber}>{card.stats.total}</Text>
        <Text style={styles.statsLabel}>{card.stats.label}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header
        greeting={`Xin Chào, ${user?.fullName}`}
        title="Quản Lý Ngân Hàng Máu"
        subtitle={facilityName}
        showProfileButton
        onProfilePress={() => navigation.navigate("Profile")}
      />

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statsCard}>
          <MaterialIcons name="trending-up" size={20} color="#2ED573" />
          <Text style={styles.statsValue}>92%</Text>
          <Text style={styles.statsDescription}>Tỷ Lệ Thành Công</Text>
        </View>
        <View style={styles.statsCard}>
          <MaterialIcons name="access-time" size={20} color="#1E90FF" />
          <Text style={styles.statsValue}>15p</Text>
          <Text style={styles.statsDescription}>T.Gian Phản Hồi</Text>
        </View>
        <View style={styles.statsCard}>
          <MaterialIcons name="favorite" size={20} color="#FF4757" />
          <Text style={styles.statsValue}>450</Text>
          <Text style={styles.statsDescription}>Người Được Cứu</Text>
        </View>
      </View>

      {/* Dashboard Cards */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchStats} />
        }
      >
        <View style={styles.cardsGrid}>
          {dashboardCards.map(renderDashboardCard)}
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
  statsContainer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
  statsCard: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#F8F9FA",
    marginHorizontal: 4,
  },
  statsValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2D3436",
    marginTop: 8,
  },
  statsDescription: {
    fontSize: 12,
    color: "#636E72",
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2D3436",
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 12,
    color: "#636E72",
    lineHeight: 16,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#E9ECEF",
    paddingTop: 12,
  },
  statsNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2D3436",
  },
  statsLabel: {
    fontSize: 12,
    color: "#636E72",
    marginTop: 2,
  },
});
