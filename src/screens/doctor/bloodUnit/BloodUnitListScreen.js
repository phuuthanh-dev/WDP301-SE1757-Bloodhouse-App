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
  Modal,
  Dimensions,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { BLOOD_COMPONENT } from '@/constants/bloodComponents';
import { 
  BLOOD_UNIT_STATUS_OPTIONS, 
  getStatusInfo, 
  getTestResultColor, 
  getTestResultLabel 
} from '@/constants/bloodUnitStatus';
import bloodUnitAPI from '@/apis/bloodUnit';

const { width: screenWidth } = Dimensions.get('window');

export default function BloodUnitListScreen() {
  const [bloodUnits, setBloodUnits] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const [statusFilter, setStatusFilter] = useState('testing');
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10
  });

  // Filter options for blood unit status - sử dụng constants từ backend
  const FILTER_OPTIONS = BLOOD_UNIT_STATUS_OPTIONS.map(status => ({
    label: status.label,
    value: status.value
  }));

  const fetchBloodUnits = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '50',
      });

      // Add status filter if not "all"
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      // Add search if exists
      if (searchText.trim()) {
        params.append('search', searchText.trim());
      }

      // Gọi API backend để lấy blood units do doctor hiện tại xử lý
      const response = await bloodUnitAPI.HandleBloodUnit(
        `/processed-by/me?${params.toString()}`,
        null,
        'get'
      );
      
      if (response.data && response.data.data) {
        setBloodUnits(response.data.data);
        setPagination(response.data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: response.data.data.length,
          limit: 50
        });
      } else {
        setBloodUnits([]);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          limit: 50
        });
      }
    } catch (error) {
      console.error("Error fetching blood units:", error);
      setBloodUnits([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        limit: 50
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBloodUnits();
    setRefreshing(false);
  };

  // Refresh when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      fetchBloodUnits();
    }, [statusFilter, searchText])
  );

  const getComponentLabel = (component) => {
    const labels = {
      [BLOOD_COMPONENT.WHOLE]: 'Máu toàn phần',
      [BLOOD_COMPONENT.RED_CELLS]: 'Hồng cầu',
      [BLOOD_COMPONENT.PLASMA]: 'Huyết tương',
      [BLOOD_COMPONENT.PLATELETS]: 'Tiểu cầu',
    };
    return labels[component] || component || 'Máu toàn phần';
  };

  const renderBloodUnitItem = ({ item }) => {
    const statusInfo = getStatusInfo(item.status);
    const isExpiringSoon = item.expiresAt && 
      new Date(item.expiresAt) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    return (
      <TouchableOpacity
        style={[styles.bloodUnitCard, isExpiringSoon && styles.bloodUnitCardWarning]}
        onPress={() => navigation.navigate('BloodUnitUpdate', { 
          bloodUnitId: item._id,
          donationId: item.donationId?._id
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
              <Text style={styles.unitCode}>{item.code || item._id?.slice(-8)}</Text>
              <View style={styles.detailsRow}>
                <MaterialCommunityIcons name="water" size={16} color="#4A90E2" />
                <Text style={styles.details}>
                  {getComponentLabel(item.component)} • {item.quantity || 0}ml
                </Text>
              </View>
              <View style={styles.detailsRow}>
                <MaterialCommunityIcons name="calendar" size={16} color="#636E72" />
                <Text style={styles.details}>
                  Hết hạn: {item.expiresAt ? new Date(item.expiresAt).toLocaleDateString('vi-VN') : 'N/A'}
                </Text>
              </View>
              {item.donationId?.userId && (
                <View style={styles.detailsRow}>
                  <MaterialCommunityIcons name="account" size={16} color="#636E72" />
                  <Text style={styles.details}>
                    Người hiến: {item.donationId.userId.fullName}
                  </Text>
                </View>
              )}
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
              donationId: item.donationId?._id
            })}
          >
            <MaterialIcons name="edit" size={18} color="#FF6B6B" />
            <Text style={styles.updateText}>
              {item.status === 'testing' ? 'Cập nhật xét nghiệm' : 'Xem chi tiết'}
            </Text>
          </TouchableOpacity>
        </View>

        {isExpiringSoon && (
          <View style={styles.warningBanner}>
            <MaterialCommunityIcons name="alert" size={16} color="#FF4757" />
            <Text style={styles.warningText}>Sắp hết hạn sử dụng!</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Đơn Vị Máu</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerCount}>{bloodUnits.length}</Text>
        </View>
      </View>

      {/* Compact Filter & Search Section */}
      <View style={styles.compactFilterSection}>
        {/* Filter Chips Row */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.compactFilterChips}
          style={styles.compactFilterScrollView}
        >
          {FILTER_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[styles.compactFilterChip, statusFilter === option.value && styles.compactFilterChipActive]}
              onPress={() => setStatusFilter(option.value)}
            >
              <Text style={[styles.compactFilterChipText, statusFilter === option.value && styles.compactFilterChipTextActive]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {/* Search Row */}
        <View style={styles.compactSearchRow}>
          <View style={styles.compactSearchContainer}>
            <MaterialCommunityIcons name="magnify" size={16} color="#A0AEC0" />
            <TextInput
              style={styles.compactSearchInput}
              placeholder="Mã đơn vị máu..."
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor="#A0AEC0"
            />
            {searchText ? (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <MaterialCommunityIcons name="close-circle" size={16} color="#A0AEC0" />
              </TouchableOpacity>
            ) : null}
          </View>
          
          <TouchableOpacity 
            style={styles.compactCalendarButton} 
            onPress={() => fetchBloodUnits()}
          >
            <MaterialCommunityIcons name="refresh" size={18} color="#FF6B6B" />
          </TouchableOpacity>
        
        </View>
      </View>

      {/* Blood Unit List */}
      <FlatList
        data={bloodUnits}
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
            <Text style={styles.emptySubText}>
              {!loading && "Các đơn vị máu bạn xử lý sẽ hiển thị ở đây"}
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  compactFilterSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  compactFilterScrollView: {
    marginBottom: 10,
  },
  compactFilterChips: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 2,
  },
  compactFilterChip: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  compactFilterChipActive: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  compactFilterChipText: {
    color: '#4A5568',
    fontSize: 13,
    fontWeight: '500',
  },
  compactFilterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  compactSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  compactSearchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  compactSearchInput: {
    flex: 1,
    fontSize: 14,
    color: '#2D3748',
    marginLeft: 6,
    paddingVertical: 0,
  },
  compactCalendarButton: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  compactDateText: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '500',
    minWidth: 50,
    textAlign: 'center',
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
  emptySubText: {
    fontSize: 14,
    color: "#718096",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  bloodUnitCardWarning: {
    borderWidth: 2,
    borderColor: '#FF4757',
  },
  warningBanner: {
    backgroundColor: '#FFEAEA',
    borderRadius: 8,
    padding: 8,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  warningText: {
    fontSize: 14,
    color: '#FF4757',
    fontWeight: '600',
    marginLeft: 8,
  },
  dateModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  dateModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  dateModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  dateModalCancel: {
    fontSize: 16,
    color: '#636E72',
    fontWeight: '600',
  },
  dateModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  dateModalDone: {
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  datePickerBody: {
    padding: 20,
  },
  datePickerColumns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  dateColumn: {
    flex: 1,
    alignItems: 'center',
  },
  columnTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 12,
    textAlign: 'center',
  },
  dateScrollView: {
    maxHeight: 200,
    width: '100%',
  },
  dateItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginVertical: 2,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
  },
  selectedDateItem: {
    backgroundColor: '#FF6B6B',
  },
  dateItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    textAlign: 'center',
  },
  selectedDateText: {
    color: '#FFFFFF',
  },
}); 