import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Image,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { formatDateTime } from '@/utils/formatHelpers';
import { mockDonorAPI } from '@/mocks/doctorMockData';

const DonorDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { donorId, donorData } = route.params;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [donor, setDonor] = useState(donorData || null);
  const [donationHistory, setDonationHistory] = useState([]);
  const [healthRecords, setHealthRecords] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { key: 'overview', label: 'Tổng quan', icon: 'account-circle' },
    { key: 'donations', label: 'Lịch sử hiến', icon: 'water' },
    { key: 'health', label: 'Sức khỏe', icon: 'heart-pulse' },
  ];

  useEffect(() => {
    fetchDonorDetail();
  }, [donorId]);

  // Refresh when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      fetchDonorDetail();
    }, [donorId])
  );

  const fetchDonorDetail = async () => {
    try {
      setLoading(true);
      
      // Using mock API instead of real API
      const response = await mockDonorAPI.HandleDonor(`/donors/${donorId}`, null, 'get');
      
      if (response.data) {
        setDonor(response.data.donor);
        setDonationHistory(response.data.donationHistory || []);
        setHealthRecords(response.data.healthRecords || []);
      }
    } catch (error) {
      console.error('Error fetching donor detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDonorDetail();
    setRefreshing(false);
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'active':
        return { label: 'Hoạt động', color: '#2ED573', icon: 'check-circle' };
      case 'inactive':
        return { label: 'Không hoạt động', color: '#95A5A6', icon: 'pause-circle' };
      case 'banned':
        return { label: 'Bị cấm', color: '#FF4757', icon: 'cancel' };
      default:
        return { label: 'Không xác định', color: '#95A5A6', icon: 'help-circle' };
    }
  };

  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      {/* Personal Information */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="account" size={24} color="#FF6B6B" />
          <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
        </View>
        
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="email" size={20} color="#636E72" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{donor?.email || 'N/A'}</Text>
            </View>
          </View>
          
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="phone" size={20} color="#636E72" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Số điện thoại</Text>
              <Text style={styles.infoValue}>{donor?.phone || 'N/A'}</Text>
            </View>
          </View>
          
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="gender-male-female" size={20} color="#636E72" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Giới tính</Text>
              <Text style={styles.infoValue}>
                {donor?.sex === 'male' ? 'Nam' : donor?.sex === 'female' ? 'Nữ' : 'N/A'}
              </Text>
            </View>
          </View>
          
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="calendar" size={20} color="#636E72" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Tuổi</Text>
              <Text style={styles.infoValue}>
                {donor?.yob ? new Date().getFullYear() - new Date(donor.yob).getFullYear() : 'N/A'} tuổi
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.addressSection}>
          <MaterialCommunityIcons name="map-marker" size={20} color="#636E72" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Địa chỉ</Text>
            <Text style={styles.infoValue}>{donor?.address || 'N/A'}</Text>
          </View>
        </View>
      </View>

      {/* Donation Statistics */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="chart-line" size={24} color="#FF6B6B" />
          <Text style={styles.sectionTitle}>Thống kê hiến máu</Text>
        </View>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: '#E3F2FD' }]}>
              <MaterialCommunityIcons name="water" size={24} color="#2196F3" />
            </View>
            <Text style={styles.statValue}>{donor?.totalDonations || 0}</Text>
            <Text style={styles.statLabel}>Lần hiến</Text>
          </View>
          
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: '#FFEBEE' }]}>
              <MaterialCommunityIcons name="calendar-clock" size={24} color="#F44336" />
            </View>
            <Text style={styles.statValue}>
              {donor?.lastDonation ? new Date(donor.lastDonation).toLocaleDateString('vi-VN') : 'Chưa có'}
            </Text>
            <Text style={styles.statLabel}>Lần cuối</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderDonationItem = ({ item }) => (
    <View style={styles.historyCard}>
      <View style={styles.historyHeader}>
        <View style={styles.historyInfo}>
          <Text style={styles.historyDate}>
            {formatDateTime(new Date(item.donationDate))}
          </Text>
          <Text style={styles.historyFacility}>{item.facilityId?.name || 'N/A'}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: '#2ED573' }]}>
          <MaterialCommunityIcons name="check-circle" size={14} color="#FFF" />
          <Text style={styles.statusText}>Hoàn thành</Text>
        </View>
      </View>
      
      <View style={styles.historyDetails}>
        <View style={styles.historyDetailItem}>
          <MaterialCommunityIcons name="water" size={16} color="#636E72" />
          <Text style={styles.historyDetailText}>{item.quantity}ml</Text>
        </View>
        <View style={styles.historyDetailItem}>
          <MaterialCommunityIcons name="test-tube" size={16} color="#636E72" />
          <Text style={styles.historyDetailText}>{item.bloodComponent}</Text>
        </View>
      </View>
    </View>
  );

  const renderHealthItem = ({ item }) => (
    <View style={styles.healthCard}>
      <View style={styles.healthHeader}>
        <Text style={styles.healthDate}>
          {formatDateTime(new Date(item.checkDate))}
        </Text>
        <View style={[
          styles.eligibilityBadge, 
          { backgroundColor: item.isEligible ? '#2ED573' : '#FF4757' }
        ]}>
          <MaterialCommunityIcons 
            name={item.isEligible ? 'check-circle' : 'close-circle'} 
            size={14} 
            color="#FFF" 
          />
          <Text style={styles.eligibilityText}>
            {item.isEligible ? 'Đủ điều kiện' : 'Không đủ điều kiện'}
          </Text>
        </View>
      </View>
      
      <View style={styles.vitalSigns}>
        <View style={styles.vitalItem}>
          <Text style={styles.vitalLabel}>Huyết áp</Text>
          <Text style={styles.vitalValue}>{item.bloodPressure}</Text>
        </View>
        <View style={styles.vitalItem}>
          <Text style={styles.vitalLabel}>Hemoglobin</Text>
          <Text style={styles.vitalValue}>{item.hemoglobin} g/dL</Text>
        </View>
        <View style={styles.vitalItem}>
          <Text style={styles.vitalLabel}>Cân nặng</Text>
          <Text style={styles.vitalValue}>{item.weight} kg</Text>
        </View>
        <View style={styles.vitalItem}>
          <Text style={styles.vitalLabel}>Nhịp tim</Text>
          <Text style={styles.vitalValue}>{item.pulse} bpm</Text>
        </View>
      </View>
      
      <View style={styles.conditionSection}>
        <Text style={styles.conditionLabel}>Tình trạng chung:</Text>
        <Text style={styles.conditionValue}>{item.generalCondition}</Text>
      </View>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'donations':
        return (
          <View style={styles.tabContent}>
            <FlatList
              data={donationHistory}
              renderItem={renderDonationItem}
              keyExtractor={(item) => item._id}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <MaterialCommunityIcons name="water-off" size={64} color="#95A5A6" />
                  <Text style={styles.emptyText}>Chưa có lịch sử hiến máu</Text>
                </View>
              }
            />
          </View>
        );
      case 'health':
        return (
          <View style={styles.tabContent}>
            <FlatList
              data={healthRecords}
              renderItem={renderHealthItem}
              keyExtractor={(item) => item._id}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <MaterialCommunityIcons name="heart-off" size={64} color="#95A5A6" />
                  <Text style={styles.emptyText}>Chưa có hồ sơ sức khỏe</Text>
                </View>
              }
            />
          </View>
        );
      default:
        return renderOverviewTab();
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons name="loading" size={48} color="#FF6B6B" />
          <Text style={styles.loadingText}>Đang tải thông tin...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusInfo = getStatusInfo(donor?.status);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết người hiến</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={["#FF6B6B"]} 
            tintColor="#FF6B6B"
          />
        }
      >
        {/* Donor Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ 
                  uri: donor?.avatar || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 10)}`
                }}
                style={styles.avatar}
              />
              <View style={styles.bloodTypeBadge}>
                <Text style={styles.bloodTypeText}>
                  {donor?.bloodId?.name || donor?.bloodId?.type || 'N/A'}
                </Text>
              </View>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.donorName}>{donor?.fullName || 'N/A'}</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
                <MaterialCommunityIcons name={statusInfo.icon} size={14} color="#FFF" />
                <Text style={styles.statusText}>{statusInfo.label}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabNavigation}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabButton, activeTab === tab.key && styles.tabButtonActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <MaterialCommunityIcons 
                name={tab.icon} 
                size={20} 
                color={activeTab === tab.key ? '#FF6B6B' : '#95A5A6'} 
              />
              <Text style={[
                styles.tabButtonText, 
                activeTab === tab.key && styles.tabButtonTextActive
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {renderTabContent()}
      </ScrollView>
    </SafeAreaView>
  );
};

export default DonorDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#636E72',
    marginTop: 12,
  },
  header: {
    backgroundColor: '#FF6B6B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 44,
  },
  scrollContainer: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#FF6B6B',
  },
  bloodTypeBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  bloodTypeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  donorName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: '#FFEAEA',
  },
  tabButtonText: {
    fontSize: 14,
    color: '#95A5A6',
    fontWeight: '500',
    marginLeft: 6,
  },
  tabButtonTextActive: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
  tabContent: {
    padding: 16,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginLeft: 12,
  },
  infoGrid: {
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#636E72',
    fontWeight: '500',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#2D3748',
    fontWeight: '600',
  },
  addressSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#636E72',
    fontWeight: '500',
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  historyInfo: {
    flex: 1,
  },
  historyDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 4,
  },
  historyFacility: {
    fontSize: 14,
    color: '#636E72',
  },
  historyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyDetailText: {
    fontSize: 14,
    color: '#4A5568',
    marginLeft: 6,
    fontWeight: '500',
  },
  healthCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  healthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  healthDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  eligibilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  eligibilityText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  vitalSigns: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  vitalItem: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  vitalLabel: {
    fontSize: 12,
    color: '#636E72',
    fontWeight: '500',
    marginBottom: 4,
  },
  vitalValue: {
    fontSize: 16,
    color: '#2D3748',
    fontWeight: 'bold',
  },
  conditionSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    padding: 12,
  },
  conditionLabel: {
    fontSize: 14,
    color: '#636E72',
    fontWeight: '500',
    marginRight: 8,
  },
  conditionValue: {
    fontSize: 14,
    color: '#2D3748',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  emptyText: {
    fontSize: 16,
    color: '#636E72',
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
}); 