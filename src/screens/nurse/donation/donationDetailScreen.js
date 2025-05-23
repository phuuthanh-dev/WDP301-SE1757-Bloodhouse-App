import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { formatDateTime } from '@/utils/formatHelpers';

// Mock data based on backend models
const MOCK_DONATION_DETAIL = {
  id: "DON001",
  registrationId: "REG123456",
  healthCheckId: "HC001",
  donor: {
    id: "USER001",
    name: "Nguyễn Văn A",
    avatar: "https://i.pravatar.cc/150?img=1",
    bloodType: "A+",
    gender: "Nam",
    dob: "01/01/1990",
    phone: "0901234567",
    email: "nguyenvana@email.com",
  },
  staff: {
    id: "STAFF001",
    name: "Y tá Lê Thị C",
    avatar: "https://i.pravatar.cc/150?img=8",
  },
  bloodGroup: {
    id: "BG001",
    type: "A+",
  },
  bloodComponent: "Whole Blood", // From BLOOD_COMPONENT enum
  quantity: 450, // ml
  donationDate: "2024-06-01T10:30:00Z",
  donationStartAt: "2024-06-01T10:00:00Z",
  donationEndAt: "2024-06-01T10:30:00Z",
  status: "COMPLETED", // From BLOOD_DONATION_STATUS enum
  notes: "Hiến máu hoàn thành thành công, không có sự cố",
  bloodBag: {
    id: "BAG001",
    type: "Whole Blood",
    expiryDate: "2024-06-31",
  },
  facility: {
    name: "Bệnh viện Hữu Nghị Việt Đức",
    address: "40 Tràng Thi, Hoàn Kiếm, Hà Nội",
  },
  vitalSigns: {
    initial: {
      bloodPressure: "120/80",
      pulse: 75,
      temperature: 36.5,
      recordedAt: "2024-06-01T10:00:00Z",
    },
    during: {
      bloodPressure: "118/78",
      pulse: 73,
      temperature: 36.4,
      recordedAt: "2024-06-01T10:15:00Z",
    },
    final: {
      bloodPressure: "115/75",
      pulse: 70,
      temperature: 36.3,
      recordedAt: "2024-06-01T10:30:00Z",
    },
  },
  // Based on DonorStatusLog model
  statusLogs: [
    {
      id: "LOG001",
      donationId: "DON001",
      userId: "USER001",
      staffId: "STAFF001",
      status: "STABLE", // From DONOR_STATUS enum
      phase: "DONATION", // From BLOOD_DONATION_REGISTRATION_STATUS enum
      notes: "Bắt đầu hiến máu, người hiến cảm thấy tốt",
      recordedAt: "2024-06-01T10:00:00Z",
    },
    {
      id: "LOG002",
      donationId: "DON001",
      userId: "USER001",
      staffId: "STAFF001",
      status: "STABLE",
      phase: "DONATION",
      notes: "Hiến được 225ml, tình trạng ổn định",
      recordedAt: "2024-06-01T10:15:00Z",
    },
    {
      id: "LOG003",
      donationId: "DON001",
      userId: "USER001",
      staffId: "STAFF001",
      status: "STABLE",
      phase: "RESTING",
      notes: "Hoàn thành hiến máu 450ml, chuyển sang nghỉ ngơi",
      recordedAt: "2024-06-01T10:30:00Z",
    },
    {
      id: "LOG004",
      donationId: "DON001",
      userId: "USER001",
      staffId: "STAFF001",
      status: "STABLE",
      phase: "POST_REST_CHECK",
      notes: "Kiểm tra sau nghỉ ngơi, tình trạng tốt, cho phép về",
      recordedAt: "2024-06-01T10:45:00Z",
    }
  ]
};

const DonationDetailScreen = ({ navigation, route }) => {
  const [donationDetail, setDonationDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, vitals, logs
  
  const donationId = route?.params?.donationId;

  useEffect(() => {
    const fetchDonationDetail = async () => {
      try {
        // TODO: Fetch actual data from API
        setDonationDetail(MOCK_DONATION_DETAIL);
      } catch (error) {
        console.error('Error fetching donation detail:', error);
        Alert.alert('Lỗi', 'Không thể tải thông tin chi tiết hiến máu');
      } finally {
        setLoading(false);
      }
    };

    fetchDonationDetail();
  }, [donationId]);

  const getStatusInfo = (status) => {
    switch (status) {
      case 'COMPLETED':
        return { label: 'Hoàn thành', color: '#2ED573', icon: 'check-circle' };
      case 'IN_PROGRESS':
        return { label: 'Đang hiến', color: '#FFA502', icon: 'heart-pulse' };
      case 'ADVERSE_EVENT':
        return { label: 'Sự cố', color: '#FF4757', icon: 'alert-circle' };
      case 'CANCELLED':
        return { label: 'Đã hủy', color: '#95A5A6', icon: 'cancel' };
      default:
        return { label: 'Chờ xác nhận', color: '#4A90E2', icon: 'clock-outline' };
    }
  };

  const getDonorStatusInfo = (status) => {
    switch (status) {
      case 'STABLE':
        return { label: 'Ổn định', color: '#2ED573' };
      case 'MILD_REACTION':
        return { label: 'Phản ứng nhẹ', color: '#FFA502' };
      case 'SEVERE_REACTION':
        return { label: 'Phản ứng nặng', color: '#FF4757' };
      case 'EMERGENCY':
        return { label: 'Cấp cứu', color: '#FF4757' };
      default:
        return { label: 'Không xác định', color: '#95A5A6' };
    }
  };

  const getPhaseLabel = (phase) => {
    switch (phase) {
      case 'DONATION':
        return 'Hiến máu';
      case 'RESTING':
        return 'Nghỉ ngơi';
      case 'POST_REST_CHECK':
        return 'Kiểm tra sau nghỉ';
      default:
        return phase;
    }
  };

  const renderOverviewTab = () => (
    <View>
      {/* Donor Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin người hiến</Text>
        <View style={styles.donorInfoContainer}>
          <Image source={{ uri: donationDetail.donor.avatar }} style={styles.donorAvatar} />
          <View style={styles.donorDetails}>
            <Text style={styles.donorName}>{donationDetail.donor.name}</Text>
            <InfoRow icon="water" label="Nhóm máu" value={donationDetail.donor.bloodType} />
            <InfoRow icon="account" label="Giới tính" value={donationDetail.donor.gender} />
            <InfoRow icon="calendar" label="Ngày sinh" value={donationDetail.donor.dob} />
            <InfoRow icon="phone" label="SĐT" value={donationDetail.donor.phone} />
          </View>
        </View>
      </View>

      {/* Donation Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin hiến máu</Text>
        <InfoRow icon="identifier" label="Mã đăng ký" value={donationDetail.registrationId} />
        <InfoRow icon="test-tube" label="Mã túi máu" value={donationDetail.bloodBag.id} />
        <InfoRow icon="water-outline" label="Loại máu" value={donationDetail.bloodComponent} />
        <InfoRow icon="beaker" label="Thể tích" value={`${donationDetail.quantity} ml`} />
        <InfoRow icon="clock-outline" label="Bắt đầu" value={formatDateTime(new Date(donationDetail.donationStartAt))} />
        <InfoRow icon="clock-check-outline" label="Kết thúc" value={formatDateTime(new Date(donationDetail.donationEndAt))} />
        <InfoRow icon="account-tie" label="Y tá phụ trách" value={donationDetail.staff.name} />
        <InfoRow icon="hospital-building" label="Cơ sở" value={donationDetail.facility.name} />
      </View>

      {/* Notes */}
      {donationDetail.notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ghi chú</Text>
          <Text style={styles.notesText}>{donationDetail.notes}</Text>
        </View>
      )}
    </View>
  );

  const renderVitalsTab = () => (
    <View>
      {Object.entries(donationDetail.vitalSigns).map(([phase, vitals]) => (
        <View key={phase} style={styles.section}>
          <Text style={styles.sectionTitle}>
            Sinh hiệu {phase === 'initial' ? 'ban đầu' : phase === 'during' ? 'trong quá trình' : 'cuối'}
          </Text>
          <Text style={styles.timeStamp}>
            {formatDateTime(new Date(vitals.recordedAt))}
          </Text>
          <View style={styles.vitalsGrid}>
            <View style={styles.vitalItem}>
              <MaterialCommunityIcons name="heart-pulse" size={24} color="#FF6B6B" />
              <Text style={styles.vitalLabel}>Huyết áp</Text>
              <Text style={styles.vitalValue}>{vitals.bloodPressure} mmHg</Text>
            </View>
            <View style={styles.vitalItem}>
              <MaterialCommunityIcons name="heart" size={24} color="#FF6B6B" />
              <Text style={styles.vitalLabel}>Nhịp tim</Text>
              <Text style={styles.vitalValue}>{vitals.pulse} bpm</Text>
            </View>
            <View style={styles.vitalItem}>
              <MaterialCommunityIcons name="thermometer" size={24} color="#FF6B6B" />
              <Text style={styles.vitalLabel}>Nhiệt độ</Text>
              <Text style={styles.vitalValue}>{vitals.temperature}°C</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const renderLogsTab = () => (
    <View>
      {donationDetail.statusLogs.map((log, index) => {
        const statusInfo = getDonorStatusInfo(log.status);
        return (
          <View key={log.id} style={styles.logItem}>
            <View style={styles.logHeader}>
              <View style={styles.logTime}>
                <MaterialCommunityIcons name="clock-outline" size={16} color="#636E72" />
                <Text style={styles.logTimeText}>
                  {formatDateTime(new Date(log.recordedAt))}
                </Text>
              </View>
              <View style={[styles.logStatus, { backgroundColor: statusInfo.color }]}>
                <Text style={styles.logStatusText}>{statusInfo.label}</Text>
              </View>
            </View>
            <View style={styles.logContent}>
              <Text style={styles.logPhase}>Giai đoạn: {getPhaseLabel(log.phase)}</Text>
              {log.notes && <Text style={styles.logNotes}>{log.notes}</Text>}
            </View>
            {index < donationDetail.statusLogs.length - 1 && <View style={styles.logSeparator} />}
          </View>
        );
      })}
    </View>
  );

  if (loading || !donationDetail) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusInfo = getStatusInfo(donationDetail.status);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack?.()}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Chi tiết hiến máu</Text>
          <View style={[styles.headerStatus, { backgroundColor: statusInfo.color }]}>
            <MaterialCommunityIcons name={statusInfo.icon} size={16} color="#fff" />
            <Text style={styles.headerStatusText}>{statusInfo.label}</Text>
          </View>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {[
          { key: 'overview', label: 'Tổng quan', icon: 'information-outline' },
          { key: 'vitals', label: 'Sinh hiệu', icon: 'heart-pulse' },
          { key: 'logs', label: 'Nhật ký', icon: 'format-list-bulleted' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key)}
          >
            <MaterialCommunityIcons 
              name={tab.icon} 
              size={20} 
              color={activeTab === tab.key ? '#FF6B6B' : '#636E72'} 
            />
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'vitals' && renderVitalsTab()}
        {activeTab === 'logs' && renderLogsTab()}
      </ScrollView>
    </SafeAreaView>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <MaterialCommunityIcons name={icon} size={18} color="#636E72" />
    <Text style={styles.infoLabel}>{label}:</Text>
    <Text style={styles.infoValue}>{value || '-'}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#636E72',
  },
  header: {
    backgroundColor: '#FF6B6B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 4,
  },
  headerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  headerStatusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#FF6B6B',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#636E72',
    marginLeft: 6,
  },
  activeTabText: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 12,
  },
  donorInfoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  donorAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  donorDetails: {
    flex: 1,
    marginLeft: 16,
  },
  donorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#636E72',
    marginLeft: 8,
    minWidth: 80,
  },
  infoValue: {
    fontSize: 14,
    color: '#2D3436',
    fontWeight: '500',
    flex: 1,
  },
  notesText: {
    fontSize: 15,
    color: '#2D3436',
    lineHeight: 22,
  },
  timeStamp: {
    fontSize: 13,
    color: '#636E72',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  vitalsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  vitalItem: {
    alignItems: 'center',
    flex: 1,
  },
  vitalLabel: {
    fontSize: 12,
    color: '#636E72',
    marginTop: 4,
    marginBottom: 4,
  },
  vitalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  logItem: {
    marginBottom: 16,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  logTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logTimeText: {
    fontSize: 13,
    color: '#636E72',
    marginLeft: 4,
  },
  logStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  logStatusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  logContent: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
  },
  logPhase: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B6B',
    marginBottom: 4,
  },
  logNotes: {
    fontSize: 14,
    color: '#2D3436',
    lineHeight: 20,
  },
  logSeparator: {
    height: 1,
    backgroundColor: '#E9ECEF',
    marginTop: 12,
  },
});

export default DonationDetailScreen;
