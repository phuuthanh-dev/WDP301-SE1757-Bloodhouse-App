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
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { format } from "date-fns";
import viLocale from "date-fns/locale/vi";
import { Calendar } from 'react-native-calendars';
import { getStartOfWeek, getWeekDays } from '@/utils/dateFn';

// MOCK_DONORS: Dữ liệu mẫu cho các ngày trong tuần (trước, hôm nay, sau)
const today = new Date();
function getDateStr(offset) {
  const d = new Date(today);
  d.setDate(today.getDate() + offset);
  return d.toISOString().slice(0, 19) + 'Z';
}
const MOCK_DONORS = [
  // 2 ngày trước
  {
    id: "1",
    name: "Nguyễn Văn A",
    avatar: "https://i.pravatar.cc/150?img=1",
    appointmentTime: getDateStr(-2).replace('09:00:00', '08:30:00'),
    bloodType: "A+",
    status: "checked_in",
    hasMedicalCheck: true,
  },
  {
    id: "2",
    name: "Trần Thị B",
    avatar: "https://i.pravatar.cc/150?img=2",
    appointmentTime: getDateStr(-2).replace('09:00:00', '10:00:00'),
    bloodType: "O-",
    status: "checked_in",
    hasMedicalCheck: false,
  },
  // 1 ngày trước
  {
    id: "3",
    name: "Lê Văn C",
    avatar: "https://i.pravatar.cc/150?img=3",
    appointmentTime: getDateStr(-1).replace('09:00:00', '09:15:00'),
    bloodType: "B+",
    status: "pending",
    hasMedicalCheck: false,
  },
  // Hôm nay
  {
    id: "4",
    name: "Phạm Thị D",
    avatar: "https://i.pravatar.cc/150?img=4",
    appointmentTime: getDateStr(0).replace('09:00:00', '09:00:00'),
    bloodType: "AB+",
    status: "checked_in",
    hasMedicalCheck: false,
  },
  {
    id: "5",
    name: "Ngô Văn E",
    avatar: "https://i.pravatar.cc/150?img=5",
    appointmentTime: getDateStr(0).replace('09:00:00', '10:30:00'),
    bloodType: "A-",
    status: "pending",
    hasMedicalCheck: false,
  },
  // 1 ngày sau
  {
    id: "6",
    name: "Phạm Thị F",
    avatar: "https://i.pravatar.cc/150?img=6",
    appointmentTime: getDateStr(1).replace('09:00:00', '08:45:00'),
    bloodType: "O+",
    status: "checked_in",
    hasMedicalCheck: false,
  },
  // 2 ngày sau
  {
    id: "7",
    name: "Lê Văn G",
    avatar: "https://i.pravatar.cc/150?img=7",
    appointmentTime: getDateStr(2).replace('09:00:00', '11:00:00'),
    bloodType: "B-",
    status: "pending",
    hasMedicalCheck: false,
  },
  {
    id: "8",
    name: "Trần Thị H",
    avatar: "https://i.pravatar.cc/150?img=8",
    appointmentTime: getDateStr(2).replace('09:00:00', '09:30:00'),
    bloodType: "AB-",
    status: "checked_in",
    hasMedicalCheck: true,
  },
];

export default function DonorListScreen() {
  const [donors, setDonors] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeek(new Date()));
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [searchText, setSearchText] = useState('');
  const [calendarVisible, setCalendarVisible] = useState(false);

  const fetchDonors = async () => {
    try {
      // Simulating API call with mock data
      setDonors(MOCK_DONORS);
    } catch (error) {
      console.error("Error fetching donors:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDonors();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchDonors();
  }, []);

  const handleScanDonor = (donorId) => {
    navigation.navigate("Scanner", { mode: "donor", donorId });
  };

  // Lọc donors theo ngày, trạng thái, tên
  const filteredDonors = donors.filter((donor) => {
    const donorDate = new Date(donor.appointmentTime);
    const matchDate =
      donorDate.getFullYear() === selectedDate.getFullYear() &&
      donorDate.getMonth() === selectedDate.getMonth() &&
      donorDate.getDate() === selectedDate.getDate();
    const matchStatus =
      statusFilter === 'Tất cả' ||
      (statusFilter === 'Chờ check-in' && donor.status === 'pending') ||
      (statusFilter === 'Đã check-in' && donor.status === 'checked_in' && !donor.hasMedicalCheck) ||
      (statusFilter === 'Đã kiểm tra y tế' && donor.status === 'checked_in' && donor.hasMedicalCheck);
    const matchName = donor.name.toLowerCase().includes(searchText.toLowerCase());
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

  const renderDonorItem = ({ item }) => {
    // Xác định trạng thái
    let statusLabel = "Chờ check-in";
    let statusColor = "#4A90E2";
    if (item.status === "checked_in" && !item.hasMedicalCheck) {
      statusLabel = "Đã check-in";
      statusColor = "#2ED573";
    } else if (item.status === "checked_in" && item.hasMedicalCheck) {
      statusLabel = "Đã kiểm tra y tế";
      statusColor = "#FFA502";
    }

    // Điều hướng
    const handleMedicalCheck = () => {
      if (item.hasMedicalCheck) {
        navigation.navigate("HealthCheckDetail", { donorId: item.id });
      } else {
        navigation.navigate("HealthCheckCreateFromDonor", { donorId: item.id });
      }
    };

    return (
      <TouchableOpacity
        style={styles.donorCard}
        onPress={() => handleScanDonor(item.id)}
      >
        <View style={styles.donorInfo}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: item.avatar || "https://via.placeholder.com/50" }}
              style={styles.avatar}
            />
            <View style={styles.bloodTypeBadge}>
              <Text style={styles.bloodTypeText}>{item.bloodType}</Text>
            </View>
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.name}>{item.name}</Text>
            <View style={styles.detailsRow}>
              <MaterialCommunityIcons name="clock-outline" size={16} color="#4A90E2" />
              <Text style={styles.details}>
                {formatDateTime(new Date(item.appointmentTime))}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusColor }]}> 
              <MaterialCommunityIcons name="clock-alert-outline" size={14} color="#FFF" />
              <Text style={styles.statusText}>{statusLabel}</Text>
            </View>
            {/* Button kiểm tra y tế */}
            {item.status === "checked_in" && (
              <TouchableOpacity
                style={styles.medicalCheckBtn}
                onPress={handleMedicalCheck}
              >
                <MaterialCommunityIcons name={item.hasMedicalCheck ? "file-document-outline" : "plus-box-multiple"} size={18} color="#FFF" />
                <Text style={styles.medicalCheckText}>
                  {item.hasMedicalCheck ? "Xem kiểm tra y tế" : "Tạo kiểm tra y tế"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        {/* Ẩn button quét mã nếu đã check-in */}
        {item.status !== "checked_in" && (
          <TouchableOpacity style={styles.scanButton} onPress={() => handleScanDonor(item.id)}>
            <MaterialCommunityIcons name="qrcode-scan" size={22} color="#FFF" />
            <Text style={styles.scanText}>Quét mã</Text>
          </TouchableOpacity>
        )}
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
      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChips}>
          {['Tất cả', 'Chờ check-in', 'Đã check-in', 'Đã kiểm tra y tế'].map((status) => (
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
      {/* Danh sách người hiến máu */}
      <FlatList
        data={filteredDonors}
        renderItem={renderDonorItem}
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
            <MaterialCommunityIcons name="qrcode-scan" size={64} color="#FF6B6B" />
            <Text style={styles.emptyText}>
              Không có người hiến máu nào chưa check-in
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
    backgroundColor: "#4A90E2",
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
});
