import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { authSelector } from '@/redux/reducers/authReducer';
import { useFacility } from '@/contexts/FacilityContext';
const dashboardCards = [
  {
    id: '1',
    title: 'Kho Máu',
    description: 'Quản lý lượng máu và theo dõi tình trạng kho',
    icon: 'opacity',
    route: 'BloodInventory',
    stats: {
      total: '850',
      label: 'Tổng Đơn Vị',
      critical: '2 loại thấp',
    },
    color: '#FF6B6B',
  },
  {
    id: '2',
    title: 'Danh Sách Người Hiến',
    description: 'Xem và quản lý người hiến máu đã đăng ký',
    icon: 'people',
    route: 'DonorList',
    stats: {
      total: '124',
      label: 'Người Hiến Hoạt Động',
      critical: '15 người mới tháng này',
    },
    color: '#2ED573',
  },
  {
    id: '3',
    title: 'Yêu Cầu Hiến Máu',
    description: 'Xử lý các cuộc hẹn hiến máu đến',
    icon: 'event',
    route: 'DonationRequests',
    stats: {
      total: '28',
      label: 'Yêu Cầu Chờ Duyệt',
      critical: '8 cho hôm nay',
    },
    color: '#1E90FF',
  },
  {
    id: '4',
    title: 'Yêu Cầu Khẩn Cấp',
    description: 'Quản lý nhu cầu máu khẩn cấp',
    icon: 'warning',
    route: 'EmergencyRequests',
    stats: {
      total: '5',
      label: 'Trường Hợp Khẩn Cấp',
      critical: '2 nguy cấp',
    },
    color: '#FF4757',
  },
];

export default function DashboardScreen({ navigation }) {
  const { user } = useSelector(authSelector);
  const { facilityName } = useFacility();
  const renderDashboardCard = (card) => (
    <TouchableOpacity
      key={card.id}
      style={styles.card}
      onPress={() => navigation.navigate(card.route)}
    >
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: card.color + '20' },
          ]}
        >
          <MaterialIcons name={card.icon} size={24} color={card.color} />
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.statsNumber}>{card.stats.total}</Text>
          <Text style={styles.statsLabel}>{card.stats.label}</Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{card.title}</Text>
        <Text style={styles.cardDescription}>{card.description}</Text>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.criticalInfo}>
          <MaterialIcons name="info" size={16} color="#636E72" />
          <Text style={styles.criticalText}>{card.stats.critical}</Text>
        </View>
        <MaterialIcons name="arrow-forward" size={20} color={card.color} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>Xin Chào, {user?.fullName}</Text>
          <Text style={styles.headerTitle}>Quản Lý Ngân Hàng Máu</Text>
          <Text style={styles.headerTitle}>{facilityName}</Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <MaterialIcons name="account-circle" size={32} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

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
      >
        {dashboardCards.map(renderDashboardCard)}
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
  header: {
    backgroundColor: '#FF6B6B',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 4,
  },
  profileButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  statsCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    marginHorizontal: 4,
  },
  statsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3436',
    marginTop: 8,
  },
  statsDescription: {
    fontSize: 12,
    color: '#636E72',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  statsNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  statsLabel: {
    fontSize: 12,
    color: '#636E72',
    marginTop: 2,
  },
  cardContent: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#636E72',
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  criticalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  criticalText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#636E72',
  },
}); 