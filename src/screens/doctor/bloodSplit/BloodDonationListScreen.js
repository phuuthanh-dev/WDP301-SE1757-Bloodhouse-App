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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Máu đã hiến - Phân Chia</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerCount}>{filteredBloodDonations.length}</Text>
        </View>
      </View>

      {/* Filter & Search Row */}
      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChips}>
          {DIVIDED_FILTER_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[styles.filterChip, isDividedFilter === option.value && styles.filterChipActive]}
              onPress={() => setIsDividedFilter(option.value)}
            >
              <Text style={[styles.filterChipText, isDividedFilter === option.value && styles.filterChipTextActive]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.searchWrap}>
          <View style={styles.searchBox}>
            <MaterialCommunityIcons name="magnify" size={20} color="#A0AEC0" />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm ..."
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor="#A0AEC0"
            />
          </View>
          <TouchableOpacity style={styles.calendarBtn} onPress={() => setCalendarVisible(true)}>
            <MaterialCommunityIcons name="calendar" size={24} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Calendar Modal */}
      {calendarVisible && (
        <View style={styles.calendarModalWrap}>
          <TouchableOpacity style={styles.calendarModalBg} onPress={() => setCalendarVisible(false)} />
          <View style={styles.calendarModal}>
            <Calendar
              onDayPress={day => {
                const pickedDate = new Date(day.dateString);
                setSelectedDate(pickedDate);
                setCurrentWeekStart(getStartOfWeek(pickedDate));
                setCalendarVisible(false);
              }}
              markedDates={{
                [format(selectedDate, 'yyyy-MM-dd')]: { selected: true, selectedColor: '#FF6B6B' },
              }}
              theme={{
                todayTextColor: '#FF6B6B',
                selectedDayBackgroundColor: '#FF6B6B',
                arrowColor: '#FF6B6B',
              }}
            />
          </View>
        </View>
      )}

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
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    gap: 4,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingHorizontal: 8,
    height: 38,
    minWidth: 160,
    marginRight: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#2D3748',
    marginLeft: 6,
    paddingVertical: 0,
  },
  calendarBtn: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 6,
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  calendarModalWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarModalBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  calendarModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    minWidth: 340,
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
}); 