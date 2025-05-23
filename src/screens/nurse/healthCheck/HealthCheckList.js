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

// MOCK_HEALTH_CHECKS: Dữ liệu mẫu cho các phiếu khám sức khỏe
const today = new Date();
function getDateStr(offset) {
  const d = new Date(today);
  d.setDate(today.getDate() + offset);
  return d.toISOString().slice(0, 19) + 'Z';
}

const MOCK_HEALTH_CHECKS = [
  // 2 ngày trước
  {
    id: "HC001",
    registrationId: "REG123456",
    patient: {
      name: "Nguyễn Văn A",
      avatar: "https://i.pravatar.cc/150?img=1",
      bloodType: "A+",
      gender: "Nam",
      dob: "01/01/1990",
      phone: "0901234567",
    },
    doctor: {
      name: "BS. Trần Văn B",
      avatar: "https://i.pravatar.cc/150?img=3",
    },
    nurse: {
      name: "Y tá Lê Thị C",
    },
    checkDate: getDateStr(-2).replace('09:00:00', '08:30:00'),
    isEligible: true,
    status: "completed", // "pending", "in_progress", "completed"
    bloodPressure: "120/80",
    hemoglobin: 14.2,
    weight: 62,
    pulse: 75,
    temperature: 36.7,
    generalCondition: "Tốt",
    notes: "Người hiến đủ điều kiện hiến máu",
  },
  {
    id: "HC002",
    registrationId: "REG123457",
    patient: {
      name: "Trần Thị B",
      avatar: "https://i.pravatar.cc/150?img=2",
      bloodType: "O-",
      gender: "Nữ",
      dob: "15/05/1985",
      phone: "0901234568",
    },
    doctor: {
      name: "BS. Phạm Văn D",
      avatar: "https://i.pravatar.cc/150?img=5",
    },
    nurse: {
      name: "Y tá Nguyễn Thị E",
    },
    checkDate: getDateStr(-2).replace('09:00:00', '10:00:00'),
    isEligible: false,
    status: "completed",
    bloodPressure: "140/90",
    hemoglobin: 11.5,
    weight: 45,
    pulse: 85,
    temperature: 37.2,
    generalCondition: "Huyết áp cao, thiếu máu nhẹ",
    deferralReason: "Huyết áp cao, hemoglobin thấp",
    notes: "Khuyến khích tái khám sau 3 tháng",
  },
  // 1 ngày trước
  {
    id: "HC003",
    registrationId: "REG123458",
    patient: {
      name: "Lê Văn C",
      avatar: "https://i.pravatar.cc/150?img=3",
      bloodType: "B+",
      gender: "Nam",
      dob: "20/12/1992",
      phone: "0901234569",
    },
    doctor: {
      name: "BS. Trần Văn B",
      avatar: "https://i.pravatar.cc/150?img=3",
    },
    nurse: {
      name: "Y tá Lê Thị C",
    },
    checkDate: getDateStr(-1).replace('09:00:00', '09:15:00'),
    isEligible: true,
    status: "in_progress",
    bloodPressure: "118/75",
    hemoglobin: 15.1,
    weight: 70,
    pulse: 72,
    temperature: 36.5,
    generalCondition: "Rất tốt",
    notes: "Đang trong quá trình khám",
  },
  // Hôm nay
  {
    id: "HC004",
    registrationId: "REG123459",
    patient: {
      name: "Phạm Thị D",
      avatar: "https://i.pravatar.cc/150?img=4",
      bloodType: "AB+",
      gender: "Nữ",
      dob: "10/08/1988",
      phone: "0901234570",
    },
    doctor: {
      name: "BS. Lê Thị C",
      avatar: "https://i.pravatar.cc/150?img=4",
    },
    nurse: {
      name: "Y tá Nguyễn Thị E",
    },
    checkDate: getDateStr(0).replace('09:00:00', '09:00:00'),
    isEligible: true,
    status: "completed",
    bloodPressure: "115/70",
    hemoglobin: 13.8,
    weight: 55,
    pulse: 68,
    temperature: 36.4,
    generalCondition: "Tốt",
    notes: "Đủ điều kiện hiến máu",
  },
  {
    id: "HC005",
    registrationId: "REG123460",
    patient: {
      name: "Ngô Văn E",
      avatar: "https://i.pravatar.cc/150?img=5",
      bloodType: "A-",
      gender: "Nam",
      dob: "25/03/1990",
      phone: "0901234571",
    },
    doctor: {
      name: "BS. Trần Văn B",
      avatar: "https://i.pravatar.cc/150?img=3",
    },
    nurse: {
      name: "Y tá Lê Thị C",
    },
    checkDate: getDateStr(0).replace('09:00:00', '10:30:00'),
    isEligible: null,
    status: "pending",
    notes: "Chờ khám sức khỏe",
  },
  // 1 ngày sau
  {
    id: "HC006",
    registrationId: "REG123461",
    patient: {
      name: "Võ Thị F",
      avatar: "https://i.pravatar.cc/150?img=6",
      bloodType: "O+",
      gender: "Nữ",
      dob: "12/11/1987",
      phone: "0901234572",
    },
    doctor: {
      name: "BS. Phạm Văn D",
      avatar: "https://i.pravatar.cc/150?img=5",
    },
    nurse: {
      name: "Y tá Nguyễn Thị E",
    },
    checkDate: getDateStr(1).replace('09:00:00', '08:45:00'),
    isEligible: false,
    status: "completed",
    bloodPressure: "150/95",
    hemoglobin: 12.8,
    weight: 48,
    pulse: 90,
    temperature: 36.8,
    generalCondition: "Huyết áp cao",
    deferralReason: "Huyết áp vượt ngưỡng cho phép",
    notes: "Cần điều trị huyết áp trước khi hiến máu",
  },
];

export default function HealthCheckList() {
  const [healthChecks, setHealthChecks] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeek(new Date()));
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [searchText, setSearchText] = useState('');
  const [calendarVisible, setCalendarVisible] = useState(false);

  const fetchHealthChecks = async () => {
    try {
      // Simulating API call with mock data
      setHealthChecks(MOCK_HEALTH_CHECKS);
    } catch (error) {
      console.error("Error fetching health checks:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHealthChecks();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchHealthChecks();
  }, []);

  // Lọc health checks theo ngày, trạng thái, tên
  const filteredHealthChecks = healthChecks.filter((healthCheck) => {
    const checkDate = new Date(healthCheck.checkDate);
    const matchDate =
      checkDate.getFullYear() === selectedDate.getFullYear() &&
      checkDate.getMonth() === selectedDate.getMonth() &&
      checkDate.getDate() === selectedDate.getDate();
    
    const matchStatus =
      statusFilter === 'Tất cả' ||
      (statusFilter === 'Chờ khám' && healthCheck.status === 'pending') ||
      (statusFilter === 'Đang khám' && healthCheck.status === 'in_progress') ||
      (statusFilter === 'Đảm bảo sức khỏe' && healthCheck.status === 'completed' && healthCheck.isEligible === true) ||
      (statusFilter === 'Không đảm bảo' && healthCheck.status === 'completed' && healthCheck.isEligible === false);
    
    const matchName = healthCheck.patient.name.toLowerCase().includes(searchText.toLowerCase());
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

  const getStatusInfo = (healthCheck) => {
    if (healthCheck.status === 'pending') {
      return { label: 'Chờ khám', color: '#4A90E2', icon: 'clock-outline' };
    } else if (healthCheck.status === 'in_progress') {
      return { label: 'Đang khám', color: '#FFA502', icon: 'medical-bag' };
    } else if (healthCheck.status === 'completed' && healthCheck.isEligible === true) {
      return { label: 'Đảm bảo sức khỏe', color: '#2ED573', icon: 'check-circle' };
    } else if (healthCheck.status === 'completed' && healthCheck.isEligible === false) {
      return { label: 'Không đảm bảo', color: '#FF4757', icon: 'close-circle' };
    } else {
      return { label: 'Chưa xác định', color: '#95A5A6', icon: 'help-circle' };
    }
  };

  const renderHealthCheckItem = ({ item }) => {
    const statusInfo = getStatusInfo(item);

    return (
      <TouchableOpacity
        style={styles.healthCheckCard}
        onPress={() => navigation.navigate('HealthCheckDetail', { healthCheckId: item.id })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.patientInfo}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: item.patient.avatar || "https://via.placeholder.com/50" }}
                style={styles.avatar}
              />
              <View style={styles.bloodTypeBadge}>
                <Text style={styles.bloodTypeText}>{item.patient.bloodType}</Text>
              </View>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.patientName}>{item.patient.name}</Text>
              <View style={styles.detailsRow}>
                <MaterialCommunityIcons name="clock-outline" size={16} color="#4A90E2" />
                <Text style={styles.details}>
                  {formatDateTime(new Date(item.checkDate))}
                </Text>
              </View>
              <View style={styles.detailsRow}>
                <MaterialCommunityIcons name="stethoscope" size={16} color="#636E72" />
                <Text style={styles.details}>BS: {item.doctor.name}</Text>
              </View>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
            <MaterialCommunityIcons name={statusInfo.icon} size={14} color="#FFF" />
            <Text style={styles.statusText}>{statusInfo.label}</Text>
          </View>
        </View>
        
        {/* Health Check Summary */}
        {item.status === 'completed' && (
          <View style={styles.healthSummary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Huyết áp:</Text>
              <Text style={styles.summaryValue}>{item.bloodPressure || '-'} mmHg</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Hemoglobin:</Text>
              <Text style={styles.summaryValue}>{item.hemoglobin || '-'} g/dL</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Cân nặng:</Text>
              <Text style={styles.summaryValue}>{item.weight || '-'} kg</Text>
            </View>
            {item.deferralReason && (
              <View style={styles.deferralReason}>
                <MaterialCommunityIcons name="alert-circle" size={16} color="#FF4757" />
                <Text style={styles.deferralText}>{item.deferralReason}</Text>
              </View>
            )}
          </View>
        )}
        
        <View style={styles.cardFooter}>
          <TouchableOpacity 
            style={styles.viewDetailBtn}
            onPress={() => navigation.navigate('HealthCheckDetail', { healthCheckId: item.id })}
          >
            <MaterialIcons name="visibility" size={18} color="#FF6B6B" />
            <Text style={styles.viewDetailText}>Xem chi tiết</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
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

      {/* Filter & Search Row */}
      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChips}>
          {['Tất cả', 'Chờ khám', 'Đang khám', 'Đảm bảo sức khỏe', 'Không đảm bảo'].map((status) => (
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
              placeholder="Tìm kiếm tên bệnh nhân..."
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

      {/* Danh sách phiếu khám sức khỏe */}
      <FlatList
        data={filteredHealthChecks}
        renderItem={renderHealthCheckItem}
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
            <MaterialCommunityIcons name="medical-bag" size={64} color="#FF6B6B" />
            <Text style={styles.emptyText}>
              Không có phiếu khám sức khỏe nào trong ngày này
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
  healthCheckCard: {
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
  patientInfo: {
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
  patientName: {
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
  healthSummary: {
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
  deferralReason: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEAEA",
    padding: 8,
    borderRadius: 6,
    marginTop: 6,
  },
  deferralText: {
    fontSize: 13,
    color: "#FF4757",
    fontWeight: "500",
    marginLeft: 6,
    flex: 1,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  viewDetailBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEAEA",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewDetailText: {
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