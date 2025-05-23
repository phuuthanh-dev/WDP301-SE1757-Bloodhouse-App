import React from 'react';
import { View, Text, SafeAreaView, StyleSheet, ScrollView, Platform, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

// Mock data (thay bằng props hoặc API thực tế)
const healthCheck = {
  registrationId: 'REG123456',
  user: {
    name: 'Nguyễn Văn A',
    gender: 'Nam',
    dob: '01/01/1990',
    bloodType: 'A+',
    phone: '0901234567',
    avatar: 'https://i.pravatar.cc/150?img=1',
    status: 'checked_in', // 'pending', 'checked_in', 'done'
  },
  doctor: {
    name: 'BS. Trần Văn B',
    avatar: 'https://i.pravatar.cc/150?img=3',
  },
  staff: {
    name: 'Y tá Lê Thị C',
  },
  facility: {
    name: 'Bệnh viện Hữu Nghị Việt Đức',
  },
  checkDate: '2024-06-01T08:30:00Z',
  isEligible: true,
  bloodPressure: '120/80 mmHg',
  hemoglobin: 14.2,
  weight: 62,
  pulse: 75,
  temperature: 36.7,
  generalCondition: 'Tốt',
  deferralReason: '',
  notes: 'Không có vấn đề đặc biệt.',
};

function getStatusLabel(status) {
  if (status === 'checked_in') return 'Đã check-in';
  if (status === 'pending') return 'Chờ check-in';
  if (status === 'done') return 'Đã hoàn thành';
  return 'Không xác định';
}
function getStatusColor(status) {
  if (status === 'checked_in') return '#2ED573';
  if (status === 'pending') return '#4A90E2';
  if (status === 'done') return '#FFA502';
  return '#A0AEC0';
}

const HealthCheckDetailScreen = ({ navigation }) => {
  const handleConfirm = () => {
    // TODO: Xác nhận đủ điều kiện hiến máu (gọi API hoặc điều hướng)
    alert('Đã xác nhận đủ điều kiện hiến máu!');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header: Avatar, tên, trạng thái check-in */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack?.()}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          {/* <Image source={{ uri: healthCheck.user.avatar }} style={styles.avatar} /> */}
          <Text style={styles.userName}>{healthCheck.user.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(healthCheck.user.status) }]}> 
            <Text style={styles.statusBadgeText}>{getStatusLabel(healthCheck.user.status)}</Text>
          </View>
        </View>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Thông tin chi tiết health check */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Thông tin khám sức khoẻ</Text>
          <InfoRow label="Mã đăng ký" value={healthCheck.registrationId} />
          <InfoRow label="Ngày khám" value={new Date(healthCheck.checkDate).toLocaleString()} />
          <InfoRow label="Cơ sở" value={healthCheck.facility.name} />
          <InfoRow label="Y tá hỗ trợ" value={healthCheck.staff.name} />
          <InfoRow label="Bác sĩ khám" value={healthCheck.doctor.name} />
          <InfoRow label="Đủ điều kiện" value={healthCheck.isEligible === true ? 'Đủ' : healthCheck.isEligible === false ? 'Không đủ' : 'Chưa xác định'} badge={healthCheck.isEligible === true ? 'success' : healthCheck.isEligible === false ? 'danger' : 'default'} />
          <InfoRow label="Huyết áp" value={healthCheck.bloodPressure} />
          <InfoRow label="Hemoglobin" value={healthCheck.hemoglobin ? healthCheck.hemoglobin + ' g/dL' : ''} />
          <InfoRow label="Cân nặng" value={healthCheck.weight ? healthCheck.weight + ' kg' : ''} />
          <InfoRow label="Nhịp tim" value={healthCheck.pulse ? healthCheck.pulse + ' bpm' : ''} />
          <InfoRow label="Nhiệt độ" value={healthCheck.temperature ? healthCheck.temperature + ' °C' : ''} />
          <InfoRow label="Tình trạng chung" value={healthCheck.generalCondition} />
          {healthCheck.deferralReason ? <InfoRow label="Lý do loại" value={healthCheck.deferralReason} badge="danger" /> : null}
          {healthCheck.notes ? <InfoRow label="Ghi chú" value={healthCheck.notes} /> : null}
        </View>
      </ScrollView>
      {/* Footer: Button xác nhận đủ điều kiện */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmButton, !healthCheck.isEligible && styles.confirmButtonDisabled]}
          onPress={handleConfirm}
          disabled={!healthCheck.isEligible}
        >
          <MaterialIcons name="check-circle" size={24} color="#fff" />
          <Text style={styles.confirmButtonText}>Xác nhận đủ điều kiện hiến máu</Text>
        </TouchableOpacity>
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
  confirmButton: {
    backgroundColor: '#FF6B6B',
    height: 56,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 1,
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default HealthCheckDetailScreen;