import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
  SafeAreaView,
  Platform,
  ScrollView,
  TextInput,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { formatDateTime } from "@/utils/formatHelpers";
import { mockDonorAPI, filterByStatus, searchByName } from "@/mocks/doctorMockData";

export default function DonorListScreen() {
  const [donors, setDonors] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const [statusFilter, setStatusFilter] = useState('all');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);

  // Filter options for donor status
  const STATUS_FILTER_OPTIONS = [
    { label: "Tất cả", value: "all" },
    { label: "Hoạt động", value: "active" },
    { label: "Không hoạt động", value: "inactive" },
    { label: "Bị cấm", value: "banned" },
  ];

  // Blood group filter options
  const BLOOD_GROUP_OPTIONS = [
    { label: "Tất cả", value: "all" },
    { label: "A+", value: "A+" },
    { label: "A-", value: "A-" },
    { label: "B+", value: "B+" },
    { label: "B-", value: "B-" },
    { label: "AB+", value: "AB+" },
    { label: "AB-", value: "AB-" },
    { label: "O+", value: "O+" },
    { label: "O-", value: "O-" },
  ];

  const fetchDonors = async () => {
    setLoading(true);
    try {
      // Using mock API instead of real API
      const response = await mockDonorAPI.HandleDonor('/donors', null, 'get');
      
      if (response.data && response.data.data) {
        setDonors(response.data.data);
      } else {
        setDonors([]);
      }
    } catch (error) {
      console.error("Error fetching donors:", error);
      setDonors([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDonors();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchDonors();
  }, [statusFilter, bloodGroupFilter, searchText]);

  // Refresh when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      fetchDonors();
    }, [])
  );

  // Filter donors based on search text, status, and blood group
  const filteredDonors = donors.filter((donor) => {
    const matchName = donor.fullName?.toLowerCase().includes(searchText.toLowerCase()) || false;
    const matchStatus = statusFilter === 'all' || donor.status === statusFilter;
    const matchBloodGroup = bloodGroupFilter === 'all' || donor.bloodId?.name === bloodGroupFilter || donor.bloodId?.type === bloodGroupFilter;
    
    return matchName && matchStatus && matchBloodGroup;
  });

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

  const renderDonorItem = ({ item }) => {
    const statusInfo = getStatusInfo(item.status);
    const age = item.yob ? new Date().getFullYear() - new Date(item.yob).getFullYear() : 'N/A';

    return (
      <TouchableOpacity
        style={styles.donorCard}
        onPress={() => navigation.navigate('DonorDetail', { 
          donorId: item._id,
          donorData: item
        })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.donorInfo}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ 
                  uri: item.avatar || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 10)}`
                }}
                style={styles.avatar}
              />
              <View style={styles.bloodTypeBadge}>
                <Text style={styles.bloodTypeText}>
                  {item.bloodId?.name || item.bloodId?.type || 'N/A'}
                </Text>
              </View>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.donorName}>{item.fullName || 'N/A'}</Text>
              <View style={styles.detailsRow}>
                <MaterialCommunityIcons name="phone" size={16} color="#636E72" />
                <Text style={styles.details}>{item.phone || 'N/A'}</Text>
              </View>
              <View style={styles.detailsRow}>
                <MaterialCommunityIcons name="gender-male-female" size={16} color="#636E72" />
                <Text style={styles.details}>
                  {item.sex === 'male' ? 'Nam' : item.sex === 'female' ? 'Nữ' : 'N/A'} • {age} tuổi
                </Text>
              </View>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
            <MaterialCommunityIcons name={statusInfo.icon} size={14} color="#FFF" />
            <Text style={styles.statusText}>{statusInfo.label}</Text>
          </View>
        </View>
        
        {/* Donation Summary */}
        <View style={styles.donationSummary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tổng lần hiến:</Text>
            <Text style={styles.summaryValue}>{item.totalDonations || 0} lần</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Lần cuối:</Text>
            <Text style={styles.summaryValue}>
              {item.lastDonation ? new Date(item.lastDonation).toLocaleDateString('vi-VN') : 'Chưa có'}
            </Text>
          </View>
        </View>
        
        <View style={styles.cardFooter}>
          <TouchableOpacity 
            style={styles.detailBtn}
            onPress={() => navigation.navigate('DonorDetail', { 
              donorId: item._id,
              donorData: item
            })}
          >
            <MaterialIcons name="visibility" size={18} color="#FF6B6B" />
            <Text style={styles.detailText}>Xem chi tiết</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Danh Sách Người Hiến</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerCount}>{filteredDonors.length}</Text>
        </View>
      </View>

      {/* Filter & Search Row */}
      <View style={styles.filterSection}>
        {/* Status Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChips}>
          {STATUS_FILTER_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[styles.filterChip, statusFilter === option.value && styles.filterChipActive]}
              onPress={() => setStatusFilter(option.value)}
            >
              <Text style={[styles.filterChipText, statusFilter === option.value && styles.filterChipTextActive]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Blood Group Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChips}>
          {BLOOD_GROUP_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[styles.filterChip, bloodGroupFilter === option.value && styles.filterChipActive]}
              onPress={() => setBloodGroupFilter(option.value)}
            >
              <Text style={[styles.filterChipText, bloodGroupFilter === option.value && styles.filterChipTextActive]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Search Box */}
        <View style={styles.searchBox}>
          <MaterialCommunityIcons name="magnify" size={20} color="#A0AEC0" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm tên người hiến..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#A0AEC0"
          />
        </View>
      </View>

      {/* Donor List */}
      <FlatList
        data={filteredDonors}
        renderItem={renderDonorItem}
        keyExtractor={(item) => item._id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={["#FF6B6B"]} 
            tintColor="#FF6B6B"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="account-group" size={64} color="#FF6B6B" />
            <Text style={styles.emptyText}>
              {loading ? "Đang tải dữ liệu..." : "Không tìm thấy người hiến nào"}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    backgroundColor: "#FF6B6B",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 20 : 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  headerBadge: {
    width: 40,
    height: 40,
    backgroundColor: "#FFFFFF",
    borderRadius: 50,
    paddingHorizontal: 8,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCount: {
    color: "#FF6B6B",
    fontWeight: "bold",
    fontSize: 16,
  },
  filterSection: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  filterChips: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginRight: 4,
  },
  filterChipActive: {
    backgroundColor: '#FF6B6B',
  },
  filterChipText: {
    color: '#4A5568',
    fontSize: 14,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2D3748',
    marginLeft: 8,
    paddingVertical: 0,
  },
  listContainer: {
    padding: 16,
  },
  donorCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  donorInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#FF6B6B",
  },
  bloodTypeBadge: {
    position: "absolute",
    bottom: -5,
    right: -5,
    backgroundColor: "#FF6B6B",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  bloodTypeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  textContainer: {
    flex: 1,
    marginLeft: 16,
  },
  donorName: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#2D3748",
    marginBottom: 4,
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  details: {
    fontSize: 14,
    color: "#4A5568",
    marginLeft: 6,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4A90E2",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  donationSummary: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#636E72",
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: 14,
    color: "#2D3748",
    fontWeight: "600",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  detailBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEAEA",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#FF6B6B",
    fontWeight: "600",
    marginLeft: 6,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#718096",
    textAlign: "center",
    marginTop: 16,
    lineHeight: 24,
  },
}); 