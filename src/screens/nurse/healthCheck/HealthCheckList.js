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
  Modal,
  Dimensions,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { formatDateTime } from "@/utils/formatHelpers";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { format } from "date-fns";
import viLocale from "date-fns/locale/vi";
import { Calendar } from 'react-native-calendars';
import { getStartOfWeek, getWeekDays } from '@/utils/dateFn';
import healthCheckAPI from "@/apis/healthCheckAPI";

const { width: screenWidth } = Dimensions.get('window');

export default function HealthCheckList() {
  const [healthChecks, setHealthChecks] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeek(new Date()));
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Filter options for nurse health checks - 4 statuses
  const FILTER_OPTIONS = [
    { label: "Tất cả", value: "all" },
    { label: "Chờ khám", value: "pending" },
    { label: "Đã khám", value: "completed" },
    { label: "Không đủ điều kiện", value: "cancelled" },
    { label: "Đã hiến máu", value: "donated" },
  ];

  const fetchHealthChecks = async () => {
    setLoading(true);
    try {
      // Build query params for health checks
      const params = new URLSearchParams({
        page: '1',
        limit: '100',
      });

      // Add search term if available
      if (searchText.trim()) {
        params.append('search', searchText.trim());
      }

      // Add status filter if not "all"
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await healthCheckAPI.HandleHealthCheck(
        `/nurse?${params.toString()}`,
        null,
        'get'
      );
      
      if (response.data && response.data.data) {
        setHealthChecks(response.data.data);
      } else {
        setHealthChecks([]);
      }
    } catch (error) {
      console.error("Error fetching health checks:", error);
      setHealthChecks([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHealthChecks();
    setRefreshing(false);
  };

  // Refresh when screen is focused (when returning from detail screen)
  useFocusEffect(
    React.useCallback(() => {
      fetchHealthChecks();
    }, [statusFilter, searchText])
  );

  // Filter health checks by selected date and search text
  const filteredHealthChecks = healthChecks.filter((healthCheck) => {
    const checkDate = new Date(healthCheck.checkDate);
    const matchDate =
      checkDate.getFullYear() === selectedDate.getFullYear() &&
      checkDate.getMonth() === selectedDate.getMonth() &&
      checkDate.getDate() === selectedDate.getDate();
    
    const matchName = healthCheck.userId?.fullName?.toLowerCase().includes(searchText.toLowerCase()) || false;
    return matchDate && matchName;
  });

  // Navigation functions
  const handlePrevWeek = () => {
    const prev = new Date(currentWeekStart);
    prev.setDate(prev.getDate() - 7);
    setCurrentWeekStart(prev);
    setSelectedDate(prev);
  };
  
  const handleNextWeek = () => {
    const next = new Date(currentWeekStart);
    next.setDate(next.getDate() + 7);
    setCurrentWeekStart(next);
    setSelectedDate(next);
  };

  const getStatusInfo = (healthCheck) => {
    switch (healthCheck.status) {
      case 'pending':
        return { label: 'Chờ khám', color: '#4A90E2', icon: 'clock-outline' };
      case 'completed':
        return { label: 'Đã khám', color: '#2ED573', icon: 'check-circle' };
      case 'cancelled':
        return { label: 'Không đủ điều kiện', color: '#FF4757', icon: 'close-circle' };
      case 'donated':
        return { label: 'Đã hiến máu', color: '#9B59B6', icon: 'heart' };
      default:
        return { label: 'Chưa xác định', color: '#95A5A6', icon: 'help-circle' };
    }
  };

  const renderHealthCheckItem = ({ item }) => {
    const statusInfo = getStatusInfo(item);

    return (
      <TouchableOpacity
        style={styles.healthCheckCard}
        onPress={() => navigation.navigate('HealthCheckDetail', { 
          healthCheckId: item._id,
          registrationId: item.registrationId?._id || item.registrationId
        })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.patientInfo}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ 
                  uri: item.userId?.avatar || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 10)}`
                }}
                style={styles.avatar}
              />
              <View style={styles.bloodTypeBadge}>
                <Text style={styles.bloodTypeText}>
                  {item.userId?.bloodId?.name || item.userId?.bloodId?.type || 'N/A'}
                </Text>
              </View>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.patientName}>{item.userId?.fullName || 'N/A'}</Text>
              <View style={styles.detailsRow}>
                <MaterialCommunityIcons name="clock-outline" size={16} color="#4A90E2" />
                <Text style={styles.details}>
                  {formatDateTime(new Date(item.checkDate))}
                </Text>
              </View>
              <View style={styles.detailsRow}>
                <MaterialCommunityIcons name="stethoscope" size={16} color="#636E72" />
                <Text style={styles.details}>
                  BS: {item.doctorId?.userId?.fullName || 'Chưa phân công'}
                </Text>
              </View>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
            <MaterialCommunityIcons name={statusInfo.icon} size={14} color="#FFF" />
            <Text style={styles.statusText}>{statusInfo.label}</Text>
          </View>
        </View>
        
        {/* Health Check Summary */}
        {item.status !== 'pending' && (
          <View style={styles.healthSummary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tình trạng:</Text>
              <Text style={styles.summaryValue}>{item.generalCondition || '-'}</Text>
            </View>
            {item.deferralReason && (
              <View style={styles.deferralReason}>
                <MaterialCommunityIcons name="alert-circle" size={16} color="#FF4757" />
                <Text style={styles.deferralText}>{item.deferralReason}</Text>
              </View>
            )}
            {item.notes && (
              <View style={styles.notesPreview}>
                <MaterialCommunityIcons name="note-text" size={16} color="#636E72" />
                <Text style={styles.notesText} numberOfLines={2}>{item.notes}</Text>
              </View>
            )}
          </View>
        )}
        
        <View style={styles.cardFooter}>
          <TouchableOpacity 
            style={styles.viewDetailBtn}
            onPress={() => navigation.navigate('HealthCheckDetail', { 
              healthCheckId: item._id,
              registrationId: item.registrationId?._id || item.registrationId
            })}
          >
            <MaterialIcons name="visibility" size={18} color="#FF6B6B" />
            <Text style={styles.viewDetailText}>Xem chi tiết</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  // Custom Date Picker Component
  const CustomDatePicker = () => {
    const [tempDate, setTempDate] = useState(selectedDate);
    const currentYear = new Date().getFullYear();
    const years = Array.from({length: 10}, (_, i) => currentYear - 5 + i);
    const months = Array.from({length: 12}, (_, i) => i + 1);
    const getDaysInMonth = (year, month) => new Date(year, month, 0).getDate();
    const days = Array.from({length: getDaysInMonth(tempDate.getFullYear(), tempDate.getMonth() + 1)}, (_, i) => i + 1);

    const handleConfirmDate = () => {
      setSelectedDate(tempDate);
      setCurrentWeekStart(getStartOfWeek(tempDate));
      setCalendarVisible(false);
    };

    return (
      <Modal
        transparent={true}
        animationType="slide"
        visible={calendarVisible}
        onRequestClose={() => setCalendarVisible(false)}
      >
        <View style={styles.dateModalOverlay}>
          <View style={styles.dateModalContent}>
            <View style={styles.dateModalHeader}>
              <TouchableOpacity onPress={() => setCalendarVisible(false)}>
                <Text style={styles.dateModalCancel}>Hủy</Text>
              </TouchableOpacity>
              <Text style={styles.dateModalTitle}>Chọn ngày</Text>
              <TouchableOpacity onPress={handleConfirmDate}>
                <Text style={styles.dateModalDone}>Xong</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.datePickerBody}>
              <View style={styles.datePickerColumns}>
                {/* Day Column */}
                <View style={styles.dateColumn}>
                  <Text style={styles.columnTitle}>Ngày</Text>
                  <ScrollView style={styles.dateScrollView} showsVerticalScrollIndicator={false}>
                    {days.map(day => (
                      <TouchableOpacity
                        key={day}
                        style={[
                          styles.dateItem,
                          tempDate.getDate() === day && styles.selectedDateItem
                        ]}
                        onPress={() => {
                          const newDate = new Date(tempDate);
                          newDate.setDate(day);
                          setTempDate(newDate);
                        }}
                      >
                        <Text style={[
                          styles.dateItemText,
                          tempDate.getDate() === day && styles.selectedDateText
                        ]}>
                          {day.toString().padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Month Column */}
                <View style={styles.dateColumn}>
                  <Text style={styles.columnTitle}>Tháng</Text>
                  <ScrollView style={styles.dateScrollView} showsVerticalScrollIndicator={false}>
                    {months.map(month => (
                      <TouchableOpacity
                        key={month}
                        style={[
                          styles.dateItem,
                          tempDate.getMonth() + 1 === month && styles.selectedDateItem
                        ]}
                        onPress={() => {
                          const newDate = new Date(tempDate);
                          newDate.setMonth(month - 1);
                          setTempDate(newDate);
                        }}
                      >
                        <Text style={[
                          styles.dateItemText,
                          tempDate.getMonth() + 1 === month && styles.selectedDateText
                        ]}>
                          {month.toString().padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Year Column */}
                <View style={styles.dateColumn}>
                  <Text style={styles.columnTitle}>Năm</Text>
                  <ScrollView style={styles.dateScrollView} showsVerticalScrollIndicator={false}>
                    {years.map(year => (
                      <TouchableOpacity
                        key={year}
                        style={[
                          styles.dateItem,
                          tempDate.getFullYear() === year && styles.selectedDateItem
                        ]}
                        onPress={() => {
                          const newDate = new Date(tempDate);
                          newDate.setFullYear(year);
                          setTempDate(newDate);
                        }}
                      >
                        <Text style={[
                          styles.dateItemText,
                          tempDate.getFullYear() === year && styles.selectedDateText
                        ]}>
                          {year}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Danh Sách Khám Sức Khỏe</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerCount}>{filteredHealthChecks.length}</Text>
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
              placeholder="Tìm kiếm bệnh nhân..."
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
            onPress={() => setCalendarVisible(true)}
          >
            <MaterialCommunityIcons name="calendar" size={18} color="#FF6B6B" />
          </TouchableOpacity>
          
          <Text style={styles.compactDateText}>
            {format(selectedDate, 'dd/MM/yyyy', { locale: viLocale })}
          </Text>
        </View>
      </View>

      {/* Enhanced Date Picker Modal */}
      <CustomDatePicker />

      {/* Calendar Bar */}
      <View style={styles.calendarBar}>
        <TouchableOpacity onPress={handlePrevWeek} style={styles.weekNavBtn}>
          <MaterialCommunityIcons name="chevron-left" size={28} color="#FF6B6B" />
        </TouchableOpacity>
        {getWeekDays(currentWeekStart).map((day, idx) => {
          const isSelected =
            day.getFullYear() === selectedDate.getFullYear() &&
            day.getMonth() === selectedDate.getMonth() &&
            day.getDate() === selectedDate.getDate();
          return (
            <TouchableOpacity
              key={idx}
              style={[styles.dayBtn, isSelected && styles.dayBtnSelected]}
              onPress={() => setSelectedDate(day)}
            >
              <Text style={[styles.dayLabel, isSelected && styles.dayLabelSelected]}>
                {format(day, "EEE", { locale: viLocale })}
              </Text>
              <Text style={[styles.dayNum, isSelected && styles.dayNumSelected]}>
                {format(day, "d")}
              </Text>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity onPress={handleNextWeek} style={styles.weekNavBtn}>
          <MaterialCommunityIcons name="chevron-right" size={28} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

      {/* Danh sách phiếu khám sức khỏe */}
      <FlatList
        data={filteredHealthChecks}
        renderItem={renderHealthCheckItem}
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
            <MaterialCommunityIcons name="medical-bag" size={64} color="#FF6B6B" />
            <Text style={styles.emptyText}>
              {loading ? "Đang tải dữ liệu..." : "Không có phiếu khám sức khỏe nào trong ngày này"}
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
    minWidth: 70,
    textAlign: 'center',
  },
  calendarBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingHorizontal: 2,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderColor: "#F0F0F0",
    marginBottom: 4,
    flexShrink: 0,
  },
  weekNavBtn: {
    padding: 4,
    borderRadius: 8,
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  dayBtn: {
    alignItems: "center",
    justifyContent: 'center',
    width: 44,
    height: 48,
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderRadius: 8,
    marginHorizontal: 1,
    backgroundColor: '#fff',
  },
  dayBtnSelected: {
    backgroundColor: "#FF6B6B",
  },
  dayLabel: {
    fontSize: 13,
    color: "#718096",
    fontWeight: "500",
  },
  dayLabelSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
  dayNum: {
    fontSize: 16,
    color: "#2D3748",
    fontWeight: "600",
  },
  dayNumSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
  listContainer: {
    padding: 12,
  },
  healthCheckCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    minHeight: 140,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  patientInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#FF6B6B",
  },
  bloodTypeBadge: {
    position: "absolute",
    bottom: -3,
    right: -3,
    backgroundColor: "#FF6B6B",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  bloodTypeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  patientName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#2D3748",
    marginBottom: 4,
    lineHeight: 18,
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
    paddingVertical: 1,
  },
  details: {
    fontSize: 12,
    color: "#4A5568",
    marginLeft: 4,
    lineHeight: 16,
    flexShrink: 1,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4A90E2",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    maxWidth: 100,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
    marginLeft: 3,
    textAlign: 'center',
  },
  healthSummary: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#636E72",
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: 12,
    color: "#2D3748",
    fontWeight: "600",
  },
  deferralReason: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEAEA",
    padding: 6,
    borderRadius: 6,
    marginTop: 4,
  },
  deferralText: {
    fontSize: 11,
    color: "#FF4757",
    fontWeight: "500",
    marginLeft: 4,
    flex: 1,
  },
  notesPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  notesText: {
    fontSize: 11,
    color: "#636E72",
    marginLeft: 4,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 2,
  },
  viewDetailBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEAEA",
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 5,
  },
  viewDetailText: {
    fontSize: 10,
    color: "#FF6B6B",
    fontWeight: "600",
    marginLeft: 2,
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