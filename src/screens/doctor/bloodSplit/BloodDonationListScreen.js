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
import { formatDate, getStartOfWeek, getWeekDays } from '@/utils/dateFn';
import { BLOOD_COMPONENT } from '@/constants/bloodComponents';
 import bloodDonationAPI from "@/apis/bloodDonation";

// Using Mock API for UI testing
import { mockBloodDonationAPI } from "@/mocks/bloodDonationMock";

const { width: screenWidth } = Dimensions.get('window');

export default function BloodDonationListScreen() {
  const [bloodDonations, setBloodDonations] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeek(new Date()));
  const [isDividedFilter, setIsDividedFilter] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // isDivided filter options
  const DIVIDED_FILTER_OPTIONS = [
    { label: "Tất cả", value: "all" },
    { label: "Đã phân chia", value: "true" },
    { label: "Chưa phân chia", value: "false" },
  ];

  const fetchBloodDonations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '100',
        status: 'completed', 
      });

      // Add isDivided filter if not "all"
      if (isDividedFilter !== 'all') {
        params.append('isDivided', isDividedFilter);
      }

      const response = await bloodDonationAPI.HandleBloodDonation(
        `/doctor?${params.toString()}`,
        null,
        'get'
      );
      
      if (response.data && response.data.data) {
        setBloodDonations(response.data.data);
      } else {
        setBloodDonations([]);
      }
    } catch (error) {
      console.error("Error fetching blood donations:", error);
      setBloodDonations([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBloodDonations();
    setRefreshing(false);
  };

  // Refresh when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      fetchBloodDonations();
    }, [isDividedFilter, searchText])
  );

  // Filter blood donations by selected date and search text
  const filteredBloodDonations = bloodDonations.filter((donation) => {
    const donationDate = formatDate(new Date(donation.donationDate));
    const selectedDateStr = formatDate(selectedDate);
  
    const matchDate = donationDate === selectedDateStr;
    
    const matchName = donation.userId?.fullName?.toLowerCase().includes(searchText.toLowerCase()) || false;
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

  const getStatusInfo = (donation) => {
    if (donation.isDivided) {
      return { label: 'Đã phân chia', color: '#2ED573', icon: 'check-circle' };
    } else {
      return { label: 'Chưa phân chia', color: '#FF6B6B', icon: 'clock-outline' };
    }
  };

  const canBeDivided = (donation) => {
    // Tất cả các loại máu đều có thể phân chia
    return Object.values(BLOOD_COMPONENT).includes(donation.bloodComponent);
  };

  const renderBloodDonationItem = ({ item }) => {
    const statusInfo = getStatusInfo(item);
    const isDividable = canBeDivided(item);

    return (
      <TouchableOpacity
        style={[
          styles.donationCard,
          !isDividable && styles.donationCardDisabled
        ]}
        onPress={() => {
          if (isDividable) {
            navigation.navigate('BloodUnitSplit', { 
              donationId: item._id,
              donationData: item
            });
          }
        }}
        disabled={!isDividable}
      >
        <View style={styles.cardHeader}>
          <View style={styles.donorInfo}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ 
                  uri: item.userId?.avatar || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 10)}`
                }}
                style={styles.avatar}
              />
              <View style={styles.bloodTypeBadge}>
                <Text style={styles.bloodTypeText}>
                  {item.bloodGroupId?.name || item.bloodGroupId?.type || 'N/A'}
                </Text>
              </View>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.donorName}>{item.userId?.fullName || 'N/A'}</Text>
              <View style={styles.detailsRow}>
                <MaterialCommunityIcons name="calendar" size={16} color="#4A90E2" />
                <Text style={styles.details}>
                  {formatDateTime(new Date(item.donationDate))}
                </Text>
              </View>
              <View style={styles.detailsRow}>
                <MaterialCommunityIcons name="water" size={16} color="#FF6B6B" />
                <Text style={styles.details}>
                  {item.quantity || 0}ml • {item.bloodComponent || 'N/A'}
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
            <Text style={styles.summaryLabel}>Mã hiến máu:</Text>
            <Text style={styles.summaryValue}>{item.code || item._id.slice(-8)}</Text>
          </View>
         
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Có thể phân chia:</Text>
            <Text style={[styles.summaryValue, { color: isDividable ? '#2ED573' : '#FF4757' }]}>
              {isDividable ? 'Có' : 'Không'}
            </Text>
          </View>
          {item.notes && (
            <View style={styles.notesPreview}>
              <MaterialCommunityIcons name="note-text" size={16} color="#636E72" />
              <Text style={styles.notesText} numberOfLines={2}>{item.notes}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.cardFooter}>
          {isDividable ? (
            <TouchableOpacity 
              style={styles.manageBtn}
              onPress={() => navigation.navigate('BloodUnitSplit', { 
                donationId: item._id,
                donationData: item
              })}
            >
              <MaterialCommunityIcons name="test-tube" size={18} color="#FF6B6B" />
              <Text style={styles.manageText}>Quản lý đơn vị máu</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.disabledBtn}>
              <MaterialCommunityIcons name="block-helper" size={18} color="#95A5A6" />
              <Text style={styles.disabledText}>Không thể phân chia</Text>
            </View>
          )}
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
        <Text style={styles.headerTitle}>Máu đã hiến - Phân Chia</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerCount}>{filteredBloodDonations.length}</Text>
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
          {DIVIDED_FILTER_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[styles.compactFilterChip, isDividedFilter === option.value && styles.compactFilterChipActive]}
              onPress={() => setIsDividedFilter(option.value)}
            >
              <Text style={[styles.compactFilterChipText, isDividedFilter === option.value && styles.compactFilterChipTextActive]}>
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

      {/* Blood Donation List */}
      <FlatList
        data={filteredBloodDonations}
        renderItem={renderBloodDonationItem}
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
            <MaterialCommunityIcons name="water" size={64} color="#FF6B6B" />
            <Text style={styles.emptyText}>
              {loading ? "Đang tải dữ liệu..." : "Không có lần hiến máu nào trong ngày này"}
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
    padding: 16,
  },
  donationCard: {
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
  donationCardDisabled: {
    opacity: 0.6,
    borderColor: "#E0E0E0",
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
  notesPreview: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F0F8FF",
    padding: 8,
    borderRadius: 6,
    marginTop: 6,
  },
  notesText: {
    fontSize: 13,
    color: "#636E72",
    marginLeft: 6,
    flex: 1,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  manageBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEAEA",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  manageText: {
    fontSize: 14,
    color: "#FF6B6B",
    fontWeight: "600",
    marginLeft: 6,
  },
  disabledBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  disabledText: {
    fontSize: 14,
    color: "#95A5A6",
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