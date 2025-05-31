import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  Platform,
  ScrollView,
  TextInput,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { formatDateTime } from "@/utils/formatHelpers";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { mockBloodDonationAPI } from "@/mocks/doctorMockData";

export default function BloodUnitListScreen() {
  const [bloodUnits, setBloodUnits] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const [statusFilter, setStatusFilter] = useState('testing');
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);

  // Filter options for blood unit status
  const FILTER_OPTIONS = [
    { label: "Đang xét nghiệm", value: "testing" },
    { label: "Sẵn sàng", value: "available" },
    { label: "Đã đặt trước", value: "reserved" },
    { label: "Đã sử dụng", value: "used" },
    { label: "Hết hạn", value: "expired" },
    { label: "Từ chối", value: "rejected" },
  ];

  const fetchBloodUnits = async () => {
    setLoading(true);
    try {
      // Using mock API to get all blood units
      const response = await mockBloodDonationAPI.HandleBloodDonation(
        '/blood-units?page=1&limit=100',
        null,
        'get'
      );
      
      if (response.data && response.data.data) {
        setBloodUnits(response.data.data);
      } else {
        setBloodUnits([]);
      }
    } catch (error) {
      console.error("Error fetching blood units:", error);
      setBloodUnits([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBloodUnits();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchBloodUnits();
  }, [statusFilter, searchText]);

  // Refresh when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      fetchBloodUnits();
    }, [])
  );

  // Filter blood units by status and search text
  const filteredBloodUnits = bloodUnits.filter((unit) => {
    const matchStatus = statusFilter === 'all' || unit.status === statusFilter;
    const matchSearch = unit.barcode?.toLowerCase().includes(searchText.toLowerCase()) || 
                       unit.bloodComponent?.toLowerCase().includes(searchText.toLowerCase()) ||
                       false;
    return matchStatus && matchSearch;
  });

  const getStatusInfo = (status) => {
    switch (status) {
      case 'testing':
        return { label: 'Đang xét nghiệm', color: '#4A90E2', icon: 'test-tube' };
      case 'available':
        return { label: 'Sẵn sàng', color: '#2ED573', icon: 'check-circle' };
      case 'reserved':
        return { label: 'Đã đặt trước', color: '#FFA726', icon: 'bookmark' };
      case 'used':
        return { label: 'Đã sử dụng', color: '#6C5CE7', icon: 'check-all' };
      case 'expired':
        return { label: 'Hết hạn', color: '#95A5A6', icon: 'calendar-remove' };
      case 'rejected':
        return { label: 'Từ chối', color: '#FF4757', icon: 'close-circle' };
      default:
        return { label: 'Không xác định', color: '#95A5A6', icon: 'help-circle' };
    }
  };

  const getComponentLabel = (component) => {
    const labels = {
      'whole_blood': 'Máu toàn phần',
      'red_blood_cells': 'Hồng cầu',
      'platelets': 'Tiểu cầu',
      'plasma': 'Plasma',
      'white_blood_cells': 'Bạch cầu',
      'cryoprecipitate': 'Cryoprecipitate'
    };
    return labels[component] || component || 'Máu toàn phần';
  };

  const renderBloodUnitItem = ({ item }) => {
    const statusInfo = getStatusInfo(item.status);
    const isExpiringSoon = item.expiryDate && 
      new Date(item.expiryDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    return (
      <TouchableOpacity
        style={styles.bloodUnitCard}
        onPress={() => navigation.navigate('BloodUnitUpdate', { 
          bloodUnitId: item._id,
          donationId: item.bloodDonationId
        })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.unitInfo}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="test-tube" size={32} color="#FF6B6B" />
              {isExpiringSoon && (
                <View style={styles.warningBadge}>
                  <MaterialCommunityIcons name="alert" size={12} color="#FFF" />
                </View>
              )}
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.unitCode}>{item.barcode || item._id?.slice(-8)}</Text>
              <View style={styles.detailsRow}>
                <MaterialCommunityIcons name="water" size={16} color="#4A90E2" />
                <Text style={styles.details}>
                  {getComponentLabel(item.bloodComponent)} • {item.volume || 0}ml
                </Text>
              </View>
              <View style={styles.detailsRow}>
                <MaterialCommunityIcons name="calendar" size={16} color="#636E72" />
                <Text style={styles.details}>
                  Hết hạn: {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('vi-VN') : 'N/A'}
                </Text>
              </View>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
            <MaterialCommunityIcons name={statusInfo.icon} size={14} color="#FFF" />
            <Text style={styles.statusText}>{statusInfo.label}</Text>
          </View>
        </View>
        
        {/* Test Results Summary */}
        {item.testResults && (
          <View style={styles.testSummary}>
            <Text style={styles.testSummaryTitle}>Kết quả xét nghiệm:</Text>
            <View style={styles.testResultsRow}>
              <View style={styles.testResultItem}>
                <Text style={styles.testLabel}>HIV:</Text>
                <View style={[styles.testBadge, { backgroundColor: getTestResultColor(item.testResults.hiv) }]}>
                  <Text style={styles.testBadgeText}>{getTestResultLabel(item.testResults.hiv)}</Text>
                </View>
              </View>
              <View style={styles.testResultItem}>
                <Text style={styles.testLabel}>HBV:</Text>
                <View style={[styles.testBadge, { backgroundColor: getTestResultColor(item.testResults.hepatitisB) }]}>
                  <Text style={styles.testBadgeText}>{getTestResultLabel(item.testResults.hepatitisB)}</Text>
                </View>
              </View>
              <View style={styles.testResultItem}>
                <Text style={styles.testLabel}>HCV:</Text>
                <View style={[styles.testBadge, { backgroundColor: getTestResultColor(item.testResults.hepatitisC) }]}>
                  <Text style={styles.testBadgeText}>{getTestResultLabel(item.testResults.hepatitisC)}</Text>
                </View>
              </View>
              <View style={styles.testResultItem}>
                <Text style={styles.testLabel}>Syphilis:</Text>
                <View style={[styles.testBadge, { backgroundColor: getTestResultColor(item.testResults.syphilis) }]}>
                  <Text style={styles.testBadgeText}>{getTestResultLabel(item.testResults.syphilis)}</Text>
                </View>
              </View>
            </View>
          </View>
        )}
        
        <View style={styles.cardFooter}>
          <TouchableOpacity 
            style={styles.updateBtn}
            onPress={() => navigation.navigate('BloodUnitUpdate', { 
              bloodUnitId: item._id,
              donationId: item.bloodDonationId
            })}
          >
            <MaterialIcons name="edit" size={18} color="#FF6B6B" />
            <Text style={styles.updateText}>
              {item.status === 'testing' ? 'Cập nhật xét nghiệm' : 'Xem chi tiết'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const getTestResultColor = (result) => {
    switch (result) {
      case 'negative': return '#2ED573';
      case 'positive': return '#FF4757';
      case 'pending': return '#4A90E2';
      default: return '#95A5A6';
    }
  };

  const getTestResultLabel = (result) => {
    switch (result) {
      case 'negative': return 'Âm';
      case 'positive': return 'Dương';
      case 'pending': return 'Chờ';
      default: return 'N/A';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Đơn Vị Máu</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerCount}>{filteredBloodUnits.length}</Text>
        </View>
      </View>

      {/* Filter & Search Row */}
      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChips}>
          {FILTER_OPTIONS.map((option) => (
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
        <View style={styles.searchBox}>
          <MaterialCommunityIcons name="magnify" size={20} color="#A0AEC0" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm mã đơn vị..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#A0AEC0"
          />
        </View>
      </View>

      {/* Blood Unit List */}
      <FlatList
        data={filteredBloodUnits}
        renderItem={renderBloodUnitItem}
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
            <MaterialCommunityIcons name="test-tube" size={64} color="#FF6B6B" />
            <Text style={styles.emptyText}>
              {loading ? "Đang tải dữ liệu..." : "Không có đơn vị máu nào"}
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
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
    backgroundColor: '#fff',
    zIndex: 2,
  },
  filterChips: {
    flexDirection: 'row',
    gap: 8,
    marginRight: 8,
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
    borderRadius: 8,
    paddingHorizontal: 8,
    height: 38,
    minWidth: 160,
    marginLeft: 'auto',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#2D3748',
    marginLeft: 6,
    paddingVertical: 0,
  },
  listContainer: {
    padding: 16,
  },
  bloodUnitCard: {
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
  unitInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    position: "relative",
    marginRight: 16,
  },
  warningBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#FF4757",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  textContainer: {
    flex: 1,
  },
  unitCode: {
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
  testSummary: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  testSummaryTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 8,
  },
  testResultsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  testResultItem: {
    alignItems: "center",
    flex: 1,
  },
  testLabel: {
    fontSize: 12,
    color: "#636E72",
    fontWeight: "500",
    marginBottom: 4,
  },
  testBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    minWidth: 40,
    alignItems: "center",
  },
  testBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  updateBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEAEA",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  updateText: {
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