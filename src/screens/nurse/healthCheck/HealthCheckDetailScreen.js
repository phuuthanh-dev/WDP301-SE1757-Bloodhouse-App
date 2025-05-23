import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, StyleSheet, ScrollView, Platform, TouchableOpacity, Image, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

// Mock data - same as in HealthCheckList.js
const MOCK_HEALTH_CHECKS = [
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
    facility: {
      name: 'Bệnh viện Hữu Nghị Việt Đức',
    },
    checkDate: '2024-06-01T08:30:00Z',
    isEligible: true,
    status: "completed",
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
    facility: {
      name: 'Bệnh viện Hữu Nghị Việt Đức',
    },
    checkDate: '2024-06-01T10:00:00Z',
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
    facility: {
      name: 'Bệnh viện Hữu Nghị Việt Đức',
    },
    checkDate: '2024-06-01T09:15:00Z',
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
    facility: {
      name: 'Bệnh viện Hữu Nghị Việt Đức',
    },
    checkDate: '2024-06-01T09:00:00Z',
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
    facility: {
      name: 'Bệnh viện Hữu Nghị Việt Đức',
    },
    checkDate: '2024-06-01T10:30:00Z',
    isEligible: null,
    status: "pending",
    notes: "Chờ khám sức khỏe",
  },
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
    facility: {
      name: 'Bệnh viện Hữu Nghị Việt Đức',
    },
    checkDate: '2024-06-01T08:45:00Z',
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

function getStatusLabel(status, isEligible) {
  if (status === 'pending') return 'Chờ khám';
  if (status === 'in_progress') return 'Đang khám';
  if (status === 'completed' && isEligible === true) return 'Đảm bảo sức khỏe';
  if (status === 'completed' && isEligible === false) return 'Không đảm bảo';
  return 'Chưa xác định';
}

function getStatusColor(status, isEligible) {
  if (status === 'pending') return '#4A90E2';
  if (status === 'in_progress') return '#FFA502';
  if (status === 'completed' && isEligible === true) return '#2ED573';
  if (status === 'completed' && isEligible === false) return '#FF4757';
  return '#95A5A6';
}

const HealthCheckDetailScreen = ({ navigation, route }) => {
  const [healthCheck, setHealthCheck] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const healthCheckId = route?.params?.healthCheckId;

  useEffect(() => {
    // Simulate API call to fetch health check details
    const fetchHealthCheckDetails = () => {
      const foundHealthCheck = MOCK_HEALTH_CHECKS.find(hc => hc.id === healthCheckId);
      if (foundHealthCheck) {
        setHealthCheck(foundHealthCheck);
      } else {
        // Fallback to first item if ID not found
        setHealthCheck(MOCK_HEALTH_CHECKS[0]);
      }
      setLoading(false);
    };

    fetchHealthCheckDetails();
  }, [healthCheckId]);

  const handleProceedToDonation = () => {
    Alert.alert(
      'Tiến hành hiến máu',
      `Xác nhận tiến hành hiến máu cho ${healthCheck.patient.name}?`,
      [
        { 
          text: 'Hủy', 
          style: 'cancel' 
        },
        {
          text: 'Xác nhận',
          onPress: () => {
            // TODO: Navigate to donation process or call API
            Alert.alert(
              'Thành công',
              'Đã chuyển người hiến đến quy trình hiến máu!',
              [
                {
                  text: 'OK',
                  onPress: () => navigation.navigate('Donations') // Navigate to donation list/process
                }
              ]
            );
          }
        }
      ]
    );
  };

  const handleUpdateStatus = () => {
    Alert.alert(
      'Cập nhật trạng thái',
      'Chọn hành động:',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Đủ điều kiện', 
          onPress: () => {
            setHealthCheck(prev => ({ ...prev, isEligible: true, status: 'completed' }));
            Alert.alert('Thành công', 'Đã cập nhật: Đủ điều kiện hiến máu');
          }
        },
        { 
          text: 'Không đủ điều kiện', 
          onPress: () => {
            setHealthCheck(prev => ({ ...prev, isEligible: false, status: 'completed' }));
            Alert.alert('Thành công', 'Đã cập nhật: Không đủ điều kiện hiến máu');
          }
        }
      ]
    );
  };

  if (loading || !healthCheck) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header: Avatar, tên, trạng thái */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack?.()}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Image source={{ uri: healthCheck.patient.avatar }} style={styles.avatar} />
          <Text style={styles.userName}>{healthCheck.patient.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(healthCheck.status, healthCheck.isEligible) }]}> 
            <Text style={styles.statusBadgeText}>{getStatusLabel(healthCheck.status, healthCheck.isEligible)}</Text>
          </View>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Thông tin bệnh nhân */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Thông tin bệnh nhân</Text>
          <InfoRow label="Họ tên" value={healthCheck.patient.name} />
          <InfoRow label="Ngày sinh" value={healthCheck.patient.dob} />
          <InfoRow label="Giới tính" value={healthCheck.patient.gender} />
          <InfoRow label="Nhóm máu" value={healthCheck.patient.bloodType} />
          <InfoRow label="SĐT" value={healthCheck.patient.phone} />
        </View>

        {/* Thông tin chi tiết health check */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Thông tin khám sức khoẻ</Text>
          <InfoRow label="Mã đăng ký" value={healthCheck.registrationId} />
          <InfoRow label="Ngày khám" value={new Date(healthCheck.checkDate).toLocaleString('vi-VN')} />
          <InfoRow label="Cơ sở" value={healthCheck.facility?.name || 'Bệnh viện Hữu Nghị Việt Đức'} />
          <InfoRow label="Y tá hỗ trợ" value={healthCheck.nurse.name} />
          <InfoRow label="Bác sĩ khám" value={healthCheck.doctor.name} />
          
          {healthCheck.status === 'completed' && (
            <>
              <InfoRow 
                label="Đủ điều kiện" 
                value={healthCheck.isEligible === true ? 'Đủ' : healthCheck.isEligible === false ? 'Không đủ' : 'Chưa xác định'} 
                badge={healthCheck.isEligible === true ? 'success' : healthCheck.isEligible === false ? 'danger' : 'default'} 
              />
              
              {healthCheck.bloodPressure && <InfoRow label="Huyết áp" value={healthCheck.bloodPressure + ' mmHg'} />}
              {healthCheck.hemoglobin && <InfoRow label="Hemoglobin" value={healthCheck.hemoglobin + ' g/dL'} />}
              {healthCheck.weight && <InfoRow label="Cân nặng" value={healthCheck.weight + ' kg'} />}
              {healthCheck.pulse && <InfoRow label="Nhịp tim" value={healthCheck.pulse + ' bpm'} />}
              {healthCheck.temperature && <InfoRow label="Nhiệt độ" value={healthCheck.temperature + ' °C'} />}
              {healthCheck.generalCondition && <InfoRow label="Tình trạng chung" value={healthCheck.generalCondition} />}
              {healthCheck.deferralReason && <InfoRow label="Lý do loại" value={healthCheck.deferralReason} badge="danger" />}
            </>
          )}
          
          {healthCheck.notes && <InfoRow label="Ghi chú" value={healthCheck.notes} />}
        </View>
      </ScrollView>

      {/* Footer: Action buttons */}
      <View style={styles.footer}>
        {healthCheck.status === 'pending' || healthCheck.status === 'in_progress' ? (
          <TouchableOpacity
            style={styles.updateButton}
            onPress={handleUpdateStatus}
          >
            <MaterialIcons name="edit" size={24} color="#fff" />
            <Text style={styles.updateButtonText}>Cập nhật kết quả khám</Text>
          </TouchableOpacity>
        ) : healthCheck.status === 'completed' && healthCheck.isEligible === true ? (
          <TouchableOpacity
            style={styles.donationButton}
            onPress={handleProceedToDonation}
          >
            <MaterialIcons name="bloodtype" size={24} color="#fff" />
            <Text style={styles.donationButtonText}>Tiến hành hiến máu</Text>
          </TouchableOpacity>
        ) : healthCheck.status === 'completed' && healthCheck.isEligible === false ? (
          <View style={styles.notEligibleContainer}>
            <MaterialIcons name="cancel" size={24} color="#FF4757" />
            <Text style={styles.notEligibleText}>Không đủ điều kiện hiến máu</Text>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
};

const InfoRow = ({ label, value, badge }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}:</Text>
    {badge ? (
      <View style={[styles.badge, badge === 'success' && styles.badgeSuccess, badge === 'danger' && styles.badgeDanger]}>
        <Text style={[styles.badgeText, badge === 'success' && { color: '#2ED573' }, badge === 'danger' && { color: '#FF4757' }]}>{value || '-'}</Text>
      </View>
    ) : (
      <Text style={styles.infoValue}>{value || '-'}</Text>
    )}
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
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: '#fff',
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 2,
  },
  statusBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F2F6',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 16,
    letterSpacing: 0.2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    color: '#636E72',
    fontSize: 15,
    width: 120,
    fontWeight: '500',
  },
  infoValue: {
    color: '#2D3436',
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#F1F2F6',
    alignSelf: 'flex-start',
  },
  badgeSuccess: {
    backgroundColor: '#E6FAF0',
  },
  badgeDanger: {
    backgroundColor: '#FFEAEA',
  },
  badgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#636E72',
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  donationButton: {
    backgroundColor: '#2ED573',
    height: 56,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donationButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  updateButton: {
    backgroundColor: '#4A90E2',
    height: 56,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  notEligibleContainer: {
    height: 56,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: '#FF4757',
  },
  notEligibleText: {
    color: '#FF4757',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default HealthCheckDetailScreen;