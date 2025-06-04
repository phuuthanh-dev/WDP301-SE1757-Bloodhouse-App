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
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { format } from "date-fns";
import viLocale from "date-fns/locale/vi";
import { Calendar } from 'react-native-calendars';
import { getStartOfWeek, getWeekDays } from '@/utils/dateFn';
import bloodDonationRegistrationAPI from "@/apis/bloodDonationRegistration";
import { DONATION_STATUS, getStatusName, getStatusColor } from "@/constants/donationStatus";

const { width: screenWidth } = Dimensions.get('window');

export default function DonorListScreen({ route }) {
  const [donors, setDonors] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeek(new Date()));
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Định nghĩa các filter status cho trang này - chỉ 2 trạng thái
  const FILTER_OPTIONS = [
    { label: "Tất cả", value: "all" },
    { label: getStatusName(DONATION_STATUS.REGISTERED), value: DONATION_STATUS.REGISTERED },
    { label: getStatusName(DONATION_STATUS.CHECKED_IN), value: DONATION_STATUS.CHECKED_IN },
  ];

  const fetchDonors = async () => {
    setLoading(true);
    try {
      // Build query params
      const params = new URLSearchParams({
        page: '1',
        limit: '100', // Lấy nhiều để có thể filter local theo ngày
      });

      // Nếu không phải "Tất cả", thêm status filter
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      // Thêm search term nếu có
      if (searchText.trim()) {
        params.append('search', searchText.trim());
      }

      const response = await bloodDonationRegistrationAPI.HandleBloodDonationRegistration(
        `/staff/assigned?${params.toString()}`
      );
      console.log("🚀 ~ fetchDonors ~ response:", response)
      
      
      if (response.data && response.data.data) {
        // Nếu statusFilter là 'all', filter chỉ 2 status cho phép
        let filteredData = response.data.data;
        if (statusFilter === 'all') {
          filteredData = response.data.data.filter(donor => 
            [DONATION_STATUS.REGISTERED, DONATION_STATUS.CHECKED_IN].includes(donor.status)
          );
        }
        setDonors(filteredData);
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
  }, [statusFilter, searchText]);

  // Handle refresh parameter from navigation
  useEffect(() => {
    if (route.params?.refresh) {
      fetchDonors();
      // Clear the refresh parameter to prevent infinite refresh
      navigation.setParams({ refresh: undefined });
    }
  }, [route.params?.refresh]);

  // Refresh when tab is focused (when returning from health check creation)
  useFocusEffect(
    React.useCallback(() => {
      fetchDonors();
    }, [])
  );

  const handleScanDonor = (donorId) => {
    navigation.navigate("Scanner", { mode: "donor", donorId });
  };

  // Lọc donors theo ngày đã chọn và tên
  const filteredDonors = donors.filter((donor) => {
    const donorDate = new Date(donor.preferredDate);
    const matchDate =
      donorDate.getFullYear() === selectedDate.getFullYear() &&
      donorDate.getMonth() === selectedDate.getMonth() &&
      donorDate.getDate() === selectedDate.getDate();
    
    const matchName = donor.userId?.fullName?.toLowerCase().includes(searchText.toLowerCase()) || false;
    
    return matchDate && matchName;
  });

  // Chuyển tuần
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

  const renderDonorItem = ({ item }) => {
    // Lấy thông tin trạng thái
    const statusLabel = getStatusName(item.status);
    const statusColor = getStatusColor(item.status);

    // Điều hướng tạo khám y tế
    const handleCreateHealthCheck = () => {
      navigation.navigate("HealthCheckCreateFromDonor", { registrationId: item._id });
    };

    const handleCheckIn = () => {
      if (item.status === DONATION_STATUS.REGISTERED) {
        navigation.navigate("Scanner", { mode: "checkin", registrationId: item._id });
      }
    };

    return (
      <TouchableOpacity
        style={styles.donorCard}
        onPress={() => {
          if (item.status === DONATION_STATUS.REGISTERED) {
            handleCheckIn();
          } else if (item.status === DONATION_STATUS.CHECKED_IN) {
            handleCreateHealthCheck();
          }
        }}
      >
        <View style={styles.donorInfo}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ 
                uri: item.userId?.avatar || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 10)}`
              }}
              style={styles.avatar}
            />
            <View style={styles.bloodTypeBadge}>
              <Text style={styles.bloodTypeText}>{item.bloodGroupId?.name || item.bloodGroupId?.type}</Text>
            </View>
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.name}>{item.userId?.fullName || "N/A"}</Text>
            <View style={styles.detailsRow}>
              <MaterialCommunityIcons name="clock-outline" size={16} color="#4A90E2" />
              <Text style={styles.details}>
                {formatDateTime(new Date(item.preferredDate))}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusColor }]}> 
              <MaterialCommunityIcons name="clock-check-outline" size={14} color="#FFF" />
              <Text style={styles.statusText}>{statusLabel}</Text>
            </View>
          </View>
        </View>
        
        {/* Button thao tác chính */}
        {item.status === DONATION_STATUS.REGISTERED && (
          <TouchableOpacity style={styles.scanButton} onPress={handleCheckIn}>
            <MaterialCommunityIcons name="qrcode-scan" size={22} color="#FFF" />
            <Text style={styles.scanText}>Check-in</Text>
          </TouchableOpacity>
        )}
        
        {item.status === DONATION_STATUS.CHECKED_IN && (
          <TouchableOpacity style={[styles.scanButton, { backgroundColor: "#2ED573" }]} onPress={handleCreateHealthCheck}>
            <MaterialCommunityIcons name="stethoscope" size={22} color="#FFF" />
            <Text style={styles.scanText}>Khám y tế</Text>
          </TouchableOpacity>
        )}
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
        <Text style={styles.headerTitle}>Danh Sách Người Hiến</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerCount}>{filteredDonors.length}</Text>
        </View>
      </View>
      
      {/* Compact Filter & Search Section */}
      <View style={styles.compactFilterSection}>        
        {/* Search Row */}
        <View style={styles.compactSearchRow}>
          <View style={styles.compactSearchContainer}>
            <MaterialCommunityIcons name="magnify" size={16} color="#A0AEC0" />
            <TextInput
              style={styles.compactSearchInput}
              placeholder="Tìm kiếm người hiến..."
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
      
      {/* Danh sách người hiến máu */}
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
            <MaterialCommunityIcons name="qrcode-scan" size={64} color="#FF6B6B" />
            <Text style={styles.emptyText}>
              {loading ? "Đang tải dữ liệu..." : "Không có người hiến máu nào trong ngày được chọn"}
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
  listContainer: {
    padding: 16,
  },
  donorCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: "#F0F0F0",
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
    backgroundColor: "#F8F9FA",
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
  name: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#2D3748",
    marginBottom: 4,
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  details: {
    fontSize: 14,
    color: "#4A5568",
    marginLeft: 6,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2ED573",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  scanButton: {
    backgroundColor: "#FF6B6B",
    borderRadius: 12,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 100,
  },
  scanText: {
    color: "#FFFFFF",
    fontSize: 14,
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
  medicalCheckBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  medicalCheckText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  compactFilterSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
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
