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
import { useNavigation } from "@react-navigation/native";
import { formatDateTime } from "@/utils/formatHelpers";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { format } from "date-fns";
import viLocale from "date-fns/locale/vi";
import { Calendar } from 'react-native-calendars';
import { getStartOfWeek, getWeekDays } from '@/utils/dateFn';

// MOCK_DONATIONS: Dữ liệu mẫu cho các lần hiến máu
const today = new Date();
function getDateStr(offset) {
  const d = new Date(today);
  d.setDate(today.getDate() + offset);
  return d.toISOString().slice(0, 19) + 'Z';
}

const MOCK_DONATIONS = [
  {
    id: "DON001",
    registrationId: "REG123456",
    healthCheckId: "HC001",
    donor: {
      name: "Nguyễn Văn A",
      avatar: "https://i.pravatar.cc/150?img=1",
      bloodType: "A+",
      gender: "Nam",
      dob: "01/01/1990",
      phone: "0901234567",
    },
    nurse: {
      name: "Y tá Lê Thị C",
    },
    startTime: getDateStr(0).replace('09:00:00', '10:00:00'),
    endTime: getDateStr(0).replace('09:00:00', '10:30:00'),
    status: "in_progress", // "pending", "in_progress", "completed", "adverse_event"
    bloodVolume: 450, // ml
    bloodBag: {
      id: "BAG001",
      type: "Whole Blood",
    },
    vitalSigns: {
      bloodPressure: "120/80",
      pulse: 75,
      temperature: 36.5,
    },
    notes: "Quá trình hiến máu diễn ra bình thường",
  },
  {
    id: "DON002",
    registrationId: "REG123459",
    healthCheckId: "HC004",
    donor: {
      name: "Phạm Thị D",
      avatar: "https://i.pravatar.cc/150?img=4",
      bloodType: "AB+",
      gender: "Nữ",
      dob: "10/08/1988",
      phone: "0901234570",
    },
    nurse: {
      name: "Y tá Nguyễn Thị E",
    },
    startTime: getDateStr(0).replace('09:00:00', '09:30:00'),
    endTime: getDateStr(0).replace('09:00:00', '10:00:00'),
    status: "completed",
    bloodVolume: 450,
    bloodBag: {
      id: "BAG002",
      type: "Whole Blood",
    },
    vitalSigns: {
      bloodPressure: "115/70",
      pulse: 68,
      temperature: 36.4,
    },
    notes: "Hoàn thành thành công",
  },
  {
    id: "DON003",
    registrationId: "REG123461",
    healthCheckId: "HC006",
    donor: {
      name: "Lê Văn C",
      avatar: "https://i.pravatar.cc/150?img=3",
      bloodType: "B+",
      gender: "Nam",
      dob: "20/12/1992",
      phone: "0901234569",
    },
    nurse: {
      name: "Y tá Lê Thị C",
    },
    startTime: getDateStr(-1).replace('09:00:00', '11:00:00'),
    endTime: getDateStr(-1).replace('09:00:00', '11:35:00'),
    status: "completed",
    bloodVolume: 450,
    bloodBag: {
      id: "BAG003",
      type: "Whole Blood",
    },
    vitalSigns: {
      bloodPressure: "118/75",
      pulse: 72,
      temperature: 36.5,
    },
    notes: "Hoàn thành xuất sắc",
  },
  {
    id: "DON004",
    registrationId: "REG123462",
    healthCheckId: "HC007",
    donor: {
      name: "Trần Văn E",
      avatar: "https://i.pravatar.cc/150?img=7",
      bloodType: "O-",
      gender: "Nam",
      dob: "05/07/1985",
      phone: "0901234573",
    },
    nurse: {
      name: "Y tá Nguyễn Thị E",
    },
    startTime: getDateStr(1).replace('09:00:00', '08:30:00'),
    endTime: null,
    status: "pending",
    bloodVolume: null,
    bloodBag: {
      id: "BAG004",
      type: "Whole Blood",
    },
    notes: "Chuẩn bị tiến hành hiến máu",
  },
];

export default function DonationListScreen() {
  const [donations, setDonations] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeek(new Date()));
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [searchText, setSearchText] = useState('');
  const [calendarVisible, setCalendarVisible] = useState(false);

  const fetchDonations = async () => {
    try {
      // Simulating API call with mock data
      setDonations(MOCK_DONATIONS);
    } catch (error) {
      console.error("Error fetching donations:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDonations();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  // Lọc donations theo ngày, trạng thái, tên
  const filteredDonations = donations.filter((donation) => {
    const donationDate = new Date(donation.startTime);
    const matchDate =
      donationDate.getFullYear() === selectedDate.getFullYear() &&
      donationDate.getMonth() === selectedDate.getMonth() &&
      donationDate.getDate() === selectedDate.getDate();
    
    const matchStatus =
      statusFilter === 'Tất cả' ||
      (statusFilter === 'Chờ hiến' && donation.status === 'pending') ||
      (statusFilter === 'Đang hiến' && donation.status === 'in_progress') ||
      (statusFilter === 'Hoàn thành' && donation.status === 'completed') ||
      (statusFilter === 'Sự cố' && donation.status === 'adverse_event');
    
    const matchName = donation.donor.name.toLowerCase().includes(searchText.toLowerCase());
    return matchDate && matchStatus && matchName;
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

  const getStatusInfo = (donation) => {
    if (donation.status === 'pending') {
      return { label: 'Chờ hiến', color: '#4A90E2', icon: 'clock-outline' };
    } else if (donation.status === 'in_progress') {
      return { label: 'Đang hiến', color: '#FFA502', icon: 'heart-pulse' };
    } else if (donation.status === 'completed') {
      return { label: 'Hoàn thành', color: '#2ED573', icon: 'check-circle' };
    } else if (donation.status === 'adverse_event') {
      return { label: 'Sự cố', color: '#FF4757', icon: 'alert-circle' };
    } else {
      return { label: 'Chưa xác định', color: '#95A5A6', icon: 'help-circle' };
    }
  };

  const renderDonationItem = ({ item }) => {
    const statusInfo = getStatusInfo(item);

    return (
      <TouchableOpacity
        style={styles.donationCard}
        onPress={() => {
          // Navigate to donation detail
          // navigation.navigate('DonationDetail', { donationId: item.id });
        }}
      >
        <View style={styles.cardHeader}>
          <View style={styles.donorInfo}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: item.donor.avatar || "https://via.placeholder.com/50" }}
                style={styles.avatar}
              />
              <View style={styles.bloodTypeBadge}>
                <Text style={styles.bloodTypeText}>{item.donor.bloodType}</Text>
              </View>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.donorName}>{item.donor.name}</Text>
              <View style={styles.detailsRow}>
                <MaterialCommunityIcons name="clock-outline" size={16} color="#4A90E2" />
                <Text style={styles.details}>
                  {formatDateTime(new Date(item.startTime))}
                </Text>
              </View>
              <View style={styles.detailsRow}>
                <MaterialCommunityIcons name="medical-bag" size={16} color="#636E72" />
                <Text style={styles.details}>YT: {item.nurse.name}</Text>
              </View>
              <View style={styles.detailsRow}>
                <MaterialCommunityIcons name="test-tube" size={16} color="#636E72" />
                <Text style={styles.details}>Túi: {item.bloodBag.id}</Text>
              </View>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
            <MaterialCommunityIcons name={statusInfo.icon} size={14} color="#FFF" />
            <Text style={styles.statusText}>{statusInfo.label}</Text>
          </View>
        </View>
        
        {/* Donation Progress */}
        {item.status === 'in_progress' && (
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Tiến độ hiến máu</Text>
              <Text style={styles.progressVolume}>{item.bloodVolume || 0} / 450 ml</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${((item.bloodVolume || 0) / 450) * 100}%` }
                ]} 
              />
            </View>
          </View>
        )}

        {/* Vital Signs */}
        {(item.status === 'in_progress' || item.status === 'completed') && item.vitalSigns && (
          <View style={styles.vitalSigns}>
            <View style={styles.vitalItem}>
              <Text style={styles.vitalLabel}>Huyết áp</Text>
              <Text style={styles.vitalValue}>{item.vitalSigns.bloodPressure}</Text>
            </View>
            <View style={styles.vitalItem}>
              <Text style={styles.vitalLabel}>Nhịp tim</Text>
              <Text style={styles.vitalValue}>{item.vitalSigns.pulse} bpm</Text>
            </View>
            <View style={styles.vitalItem}>
              <Text style={styles.vitalLabel}>Nhiệt độ</Text>
              <Text style={styles.vitalValue}>{item.vitalSigns.temperature}°C</Text>
            </View>
          </View>
        )}
        
        <View style={styles.cardFooter}>
          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={() => {
              // Handle action based on status
              if (item.status === 'pending') {
                // Start donation - Navigate to create form to start donation
                navigation.navigate('DonationCreateForm', { donationId: item.id, mode: 'start' });
              } else if (item.status === 'in_progress') {
                // Monitor/Update donation - Navigate to update form
                navigation.navigate('DonationCreateForm', { donationId: item.id, mode: 'update' });
              } else if (item.status === 'completed') {
                // View donation details
                navigation.navigate('DonationDetail', { donationId: item.id });
              } else if (item.status === 'adverse_event') {
                // View donation details with incident info
                navigation.navigate('DonationDetail', { donationId: item.id });
              }
            }}
          >
            <MaterialIcons 
              name={
                item.status === 'pending' ? 'play-arrow' : 
                item.status === 'in_progress' ? 'edit' : 
                item.status === 'completed' ? 'visibility' : 
                'info'
              } 
              size={18} 
              color="#FF6B6B" 
            />
            <Text style={styles.actionText}>
              {item.status === 'pending' ? 'Bắt đầu' : 
               item.status === 'in_progress' ? 'Cập nhật thông tin' : 
               item.status === 'completed' ? 'Xem chi tiết' : 
               'Chi tiết'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Danh Sách Hiến Máu</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerCount}>{filteredDonations.length}</Text>
        </View>
      </View>

      {/* Filter & Search Row */}
      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChips}>
          {['Tất cả', 'Chờ hiến', 'Đang hiến', 'Hoàn thành', 'Sự cố'].map((status) => (
            <TouchableOpacity
              key={status}
              style={[styles.filterChip, statusFilter === status && styles.filterChipActive]}
              onPress={() => setStatusFilter(status)}
            >
              <Text style={[styles.filterChipText, statusFilter === status && styles.filterChipTextActive]}>{status}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.searchWrap}>
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

      {/* Danh sách hiến máu */}
      <FlatList
        data={filteredDonations}
        renderItem={renderDonationItem}
        keyExtractor={(item) => item.id.toString()}
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
              Không có lần hiến máu nào trong ngày này
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
  progressSection: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2D3748",
  },
  progressVolume: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FF6B6B",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FF6B6B",
    borderRadius: 4,
  },
  vitalSigns: {
    flexDirection: "row",
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    justifyContent: "space-around",
  },
  vitalItem: {
    alignItems: "center",
  },
  vitalLabel: {
    fontSize: 12,
    color: "#636E72",
    marginBottom: 4,
  },
  vitalValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2D3748",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEAEA",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionText: {
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