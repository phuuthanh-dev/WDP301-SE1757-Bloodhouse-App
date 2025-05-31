import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, StyleSheet, ScrollView, Platform, TouchableOpacity, Image, Alert } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import healthCheckAPI from '@/apis/healthCheckAPI';
import bloodDonationAPI from '@/apis/bloodDonation';
import { useSelector } from 'react-redux';
import { authSelector } from '@/redux/reducers/authReducer';
import { DONATION_STATUS, getStatusName, getStatusColor } from '@/constants/donationStatus';

function getStatusLabel(registrationStatus, isEligible) {
  if (registrationStatus === DONATION_STATUS.IN_CONSULT) return 'Chờ khám';
  if (registrationStatus === DONATION_STATUS.REJECTED) return 'Không đảm bảo';
  if (registrationStatus === DONATION_STATUS.WAITING_DONATION) return 'Đảm bảo sức khỏe';
  return 'Chưa xác định';
}

function getStatusColorFromRegistration(registrationStatus, isEligible) {
  if (registrationStatus === DONATION_STATUS.IN_CONSULT) return '#4A90E2';
  if (registrationStatus === DONATION_STATUS.REJECTED) return '#FF4757';
  if (registrationStatus === DONATION_STATUS.WAITING_DONATION) return '#2ED573';
  return '#95A5A6';
}

const HealthCheckDetailScreen = ({ route }) => {
  const [registrationData, setRegistrationData] = useState(null);
  const [healthCheckData, setHealthCheckData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCreatingDonation, setIsCreatingDonation] = useState(false);
  const navigation = useNavigation();
  const { user } = useSelector(authSelector);
  
  const registrationId = route?.params?.registrationId;

  const fetchHealthCheckDetail = async () => {
    try {
      if (!registrationId) {
        Alert.alert('Lỗi', 'Không tìm thấy thông tin đăng ký');
        setLoading(false);
        return;
      }

      // Sử dụng API mới để lấy thông tin theo registration ID
      const response = await healthCheckAPI.HandleHealthCheck(
        `/registration/${registrationId}`,
        null,
        'get'
      );

      if (response.data) {
        setRegistrationData(response.data.registration);
        setHealthCheckData(response.data.healthCheck);
      } else {
        Alert.alert('Lỗi', 'Không thể tải thông tin chi tiết');
      }
    } catch (error) {
      console.error('Error fetching health check detail:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin chi tiết');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 10000); 
    
    const runFetch = async () => {
      try {
        await fetchHealthCheckDetail();
      } catch (error) {
        setLoading(false);
      } finally {
        clearTimeout(timeoutId);
      }
    };
    
    runFetch();
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [registrationId]);

  // Refresh when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      fetchHealthCheckDetail();
    }, [registrationId])
  );

  const handleCreateBloodDonation = async () => {
    if (!registrationData) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin đăng ký');
      return;
    }

    Alert.alert(
      'Tiến hành hiến máu',
      `Xác nhận tiến hành hiến máu cho ${registrationData.userId?.fullName}?`,
      [
        { 
          text: 'Hủy', 
          style: 'cancel' 
        },
        {
          text: 'Xác nhận',
          onPress: async () => {
            setIsCreatingDonation(true);
            try {
              const donationData = {
                userId: registrationData.userId._id,
                bloodGroupId: registrationData.bloodGroupId._id,
                bloodDonationRegistrationId: registrationData._id,
                bloodComponent: registrationData.bloodComponent || 'Máu toàn phần',
                healthCheckId: healthCheckData._id,
              };

              const response = await bloodDonationAPI.HandleBloodDonation(
                '',
                donationData,
                'post'
              );

              if (response.data) {
                Alert.alert(
                  'Thành công',
                  'Đã tạo bản ghi hiến máu thành công!',
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        // Navigate back to HealthCheckList and refresh
                        navigation.navigate('TabNavigatorNurse', {
                          screen: 'HealthChecks',
                          params: {
                            screen: 'HealthChecks',
                          },
                        });
                      }
                    }
                  ]
                );
              }
            } catch (error) {
              console.error('Error creating blood donation:', error);
              const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi tạo bản ghi hiến máu';
              Alert.alert('Lỗi', errorMessage);
            } finally {
              setIsCreatingDonation(false);
            }
          }
        }
      ]
    );
  };

  if (loading || !registrationData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <MaterialCommunityIcons name="loading" size={48} color="#FF6B6B" />
          <Text style={styles.loadingText}>Đang tải thông tin...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Determine status and eligibility from registration data
  const isEligible = registrationData.status === DONATION_STATUS.WAITING_DONATION;
  const statusLabel = getStatusLabel(registrationData.status, isEligible);
  const statusColor = getStatusColorFromRegistration(registrationData.status, isEligible);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header: Avatar, tên, trạng thái */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack?.()}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ 
                uri: registrationData.userId?.avatar || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 10)}`
              }} 
              style={styles.avatar} 
            />
            <View style={styles.bloodTypeBadge}>
              <Text style={styles.bloodTypeText}>{registrationData.bloodGroupId?.name || registrationData.bloodGroupId?.type}</Text>
            </View>
          </View>
          <Text style={styles.userName}>{registrationData.userId?.fullName || 'N/A'}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}> 
            <MaterialCommunityIcons 
              name={isEligible ? 'check-circle' : registrationData.status === DONATION_STATUS.REJECTED ? 'close-circle' : 'clock'} 
              size={16} 
              color="#fff" 
            />
            <Text style={styles.statusBadgeText}>{statusLabel}</Text>
          </View>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Thông tin bệnh nhân */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="account-heart" size={24} color="#FF6B6B" />
            <Text style={styles.cardTitle}>Thông tin người hiến</Text>
          </View>
          <View style={styles.patientInfoGrid}>
            <InfoCard icon="account" label="Họ tên" value={registrationData.userId?.fullName} color="#4A90E2" />
            <InfoCard icon="calendar" label="Ngày sinh" value={registrationData.userId?.yob ? new Date(registrationData.userId.yob).toLocaleDateString('vi-VN') : 'N/A'} color="#9B59B6" />
            <InfoCard icon="human-male-female" label="Giới tính" value={registrationData.userId?.sex === 'male' ? 'Nam' : registrationData.userId?.sex === 'female' ? 'Nữ' : 'N/A'} color="#E74C3C" />
            <InfoCard icon="water" label="Nhóm máu" value={registrationData.bloodGroupId?.name || registrationData.bloodGroupId?.type} color="#FF6B6B" />
          </View>
          <View style={styles.contactInfo}>
            <InfoRow icon="phone" label="Số điện thoại" value={registrationData.userId?.phone} />
            <InfoRow icon="email" label="Email" value={registrationData.userId?.email} />
          </View>
        </View>

        {/* Thông tin chi tiết health check */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="stethoscope" size={24} color="#FF6B6B" />
            <Text style={styles.cardTitle}>Thông tin khám sức khỏe</Text>
          </View>
          
          <View style={styles.healthCheckInfo}>
            <InfoRow icon="identifier" label="Mã đăng ký" value={registrationData.code || registrationData._id} />
            <InfoRow icon="calendar-clock" label="Ngày khám" value={new Date(registrationData.preferredDate).toLocaleString('vi-VN')} />
            <InfoRow icon="hospital-building" label="Cơ sở" value={registrationData.facilityId?.name} />
            <InfoRow icon="account-tie" label="Y tá hỗ trợ" value={registrationData.staffId?.userId?.fullName || 'Chưa phân công'} />
            <InfoRow icon="doctor" label="Bác sĩ khám" value={healthCheckData?.doctorId?.userId?.fullName || 'Chưa phân công'} />
            
            <View style={styles.eligibilityRow}>
              <MaterialCommunityIcons name="clipboard-check" size={18} color="#636E72" />
              <Text style={styles.infoLabel}>Đủ điều kiện:</Text>
              <View style={[
                styles.eligibilityBadge, 
                { backgroundColor: isEligible ? '#2ED573' : registrationData.status === DONATION_STATUS.REJECTED ? '#FF4757' : '#95A5A6' }
              ]}>
                <MaterialCommunityIcons 
                  name={isEligible ? 'check' : registrationData.status === DONATION_STATUS.REJECTED ? 'close' : 'help'} 
                  size={14} 
                  color="#fff" 
                />
                <Text style={styles.eligibilityText}>
                  {isEligible ? 'Đủ' : registrationData.status === DONATION_STATUS.REJECTED ? 'Không đủ' : 'Chưa xác định'}
                </Text>
              </View>
            </View>
          </View>
          
          {/* Health check details if available */}
          {healthCheckData && (
            <View style={styles.vitalSignsSection}>
              <Text style={styles.subSectionTitle}>📊 Chỉ số sinh hiệu</Text>
              <View style={styles.vitalSignsGrid}>
                {healthCheckData.bloodPressure && (
                  <VitalCard icon="heart-pulse" label="Huyết áp" value={healthCheckData.bloodPressure + ' mmHg'} color="#E74C3C" />
                )}
                {healthCheckData.hemoglobin && (
                  <VitalCard icon="water-percent" label="Hemoglobin" value={healthCheckData.hemoglobin + ' g/dL'} color="#9B59B6" />
                )}
                {healthCheckData.weight && (
                  <VitalCard icon="weight" label="Cân nặng" value={healthCheckData.weight + ' kg'} color="#F39C12" />
                )}
                {healthCheckData.pulse && (
                  <VitalCard icon="heart" label="Nhịp tim" value={healthCheckData.pulse + ' bpm'} color="#FF6B6B" />
                )}
                {healthCheckData.temperature && (
                  <VitalCard icon="thermometer" label="Nhiệt độ" value={healthCheckData.temperature + ' °C'} color="#3498DB" />
                )}
                {healthCheckData.generalCondition && (
                  <VitalCard icon="account-check" label="Tình trạng" value={healthCheckData.generalCondition} color="#2ED573" />
                )}
              </View>
              
              {healthCheckData.deferralReason && (
                <View style={styles.deferralSection}>
                  <MaterialCommunityIcons name="alert-circle" size={20} color="#FF4757" />
                  <Text style={styles.deferralTitle}>Lý do không đủ điều kiện:</Text>
                  <Text style={styles.deferralText}>{healthCheckData.deferralReason}</Text>
                </View>
              )}
              
              {healthCheckData.notes && (
                <View style={styles.notesSection}>
                  <MaterialCommunityIcons name="note-text" size={20} color="#636E72" />
                  <Text style={styles.notesTitle}>Ghi chú bác sĩ:</Text>
                  <Text style={styles.notesText}>{healthCheckData.notes}</Text>
                </View>
              )}
            </View>
          )}

          {/* Hiển thị thông báo nếu chưa có health check */}
          {!healthCheckData && (
            <View style={styles.noHealthCheckSection}>
              <MaterialCommunityIcons name="clipboard-text-outline" size={48} color="#95A5A6" />
              <Text style={styles.noHealthCheckTitle}>Chưa có thông tin khám sức khỏe</Text>
              <Text style={styles.noHealthCheckText}>
                {registrationData.status === DONATION_STATUS.CHECKED_IN 
                  ? 'Người hiến đã check-in, đang chờ tạo phiếu khám sức khỏe'
                  : 'Thông tin khám sức khỏe sẽ được cập nhật sau khi bác sĩ thực hiện khám'
                }
              </Text>
            </View>
          )}
          
          {registrationData.notes && (
            <View style={styles.registrationNotesSection}>
              <MaterialCommunityIcons name="clipboard-text" size={20} color="#636E72" />
              <Text style={styles.notesTitle}>Ghi chú đăng ký:</Text>
              <Text style={styles.notesText}>{registrationData.notes}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Footer: Action buttons */}
      <View style={styles.footer}>
        {registrationData.status === DONATION_STATUS.IN_CONSULT ? (
          <View style={styles.pendingContainer}>
            <MaterialCommunityIcons name="clock-outline" size={24} color="#4A90E2" />
            <Text style={styles.pendingText}>Đang chờ bác sĩ khám</Text>
          </View>
        ) : registrationData.status === DONATION_STATUS.WAITING_DONATION && isEligible ? (
          <TouchableOpacity
            style={[styles.donationButton, isCreatingDonation && styles.donationButtonDisabled]}
            onPress={handleCreateBloodDonation}
            disabled={isCreatingDonation}
          >
            <MaterialCommunityIcons name="heart-plus" size={24} color="#fff" />
            <Text style={styles.donationButtonText}>
              {isCreatingDonation ? 'Đang tạo...' : 'Tiến hành hiến máu'}
            </Text>
          </TouchableOpacity>
        ) : registrationData.status === DONATION_STATUS.REJECTED ? (
          <View style={styles.notEligibleContainer}>
            <MaterialCommunityIcons name="close-circle" size={24} color="#FF4757" />
            <Text style={styles.notEligibleText}>Không đủ điều kiện hiến máu</Text>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <MaterialCommunityIcons name={icon} size={20} color="#636E72" />
    <Text style={styles.infoLabel}>{label}:</Text>
    <Text style={styles.infoValue}>{value || '-'}</Text>
  </View>
);

const InfoCard = ({ icon, label, value, color }) => (
  <View style={styles.infoCard}>
    <View style={[styles.infoCardIcon, { backgroundColor: color }]}>
      <MaterialCommunityIcons name={icon} size={20} color="#fff" />
    </View>
    <Text style={styles.infoCardLabel}>{label}</Text>
    <Text style={styles.infoCardValue}>{value}</Text>
  </View>
);

const VitalCard = ({ icon, label, value, color }) => (
  <View style={styles.vitalCard}>
    <View style={[styles.vitalCardIcon, { backgroundColor: color }]}>
      <MaterialCommunityIcons name={icon} size={18} color="#fff" />
    </View>
    <Text style={styles.vitalCardLabel}>{label}</Text>
    <Text style={styles.vitalCardValue}>{value}</Text>
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
    marginTop: 12,
  },
  header: {
    backgroundColor: '#FF6B6B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#fff',
    backgroundColor: '#fff',
  },
  bloodTypeBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  bloodTypeText: {
    color: '#FF6B6B',
    fontWeight: 'bold',
    fontSize: 12,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 4,
  },
  statusBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 6,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3436',
    marginLeft: 12,
  },
  patientInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  contactInfo: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  infoCard: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  infoCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoCardLabel: {
    fontSize: 12,
    color: '#636E72',
    textAlign: 'center',
    marginBottom: 4,
    fontWeight: '500',
  },
  infoCardValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2D3436',
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 4,
  },
  infoLabel: {
    color: '#636E72',
    fontSize: 15,
    width: 120,
    fontWeight: '500',
    marginLeft: 8,
  },
  infoValue: {
    color: '#2D3436',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  healthCheckInfo: {
    marginBottom: 20,
  },
  eligibilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  eligibilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 'auto',
  },
  eligibilityText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 4,
  },
  vitalSignsSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  vitalSignsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  vitalCard: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  vitalCardIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  vitalCardLabel: {
    fontSize: 11,
    color: '#636E72',
    textAlign: 'center',
    marginBottom: 2,
    fontWeight: '500',
  },
  vitalCardValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2D3436',
    textAlign: 'center',
  },
  deferralSection: {
    backgroundColor: '#FFEAEA',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF4757',
  },
  deferralTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FF4757',
    marginLeft: 8,
    marginBottom: 8,
  },
  deferralText: {
    color: '#2D3436',
    fontSize: 14,
    lineHeight: 20,
    paddingLeft: 28,
  },
  notesSection: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#636E72',
  },
  notesTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2D3436',
    marginLeft: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  notesText: {
    color: '#2D3436',
    fontSize: 14,
    lineHeight: 20,
    paddingLeft: 28,
    fontStyle: 'italic',
  },
  registrationNotesSection: {
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  donationButton: {
    backgroundColor: '#2ED573',
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#2ED573',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  donationButtonDisabled: {
    opacity: 0.7,
    elevation: 0,
    shadowOpacity: 0,
  },
  donationButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  pendingContainer: {
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F8FF',
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  pendingText: {
    color: '#4A90E2',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  notEligibleContainer: {
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFEAEA',
    borderWidth: 2,
    borderColor: '#FF4757',
  },
  notEligibleText: {
    color: '#FF4757',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  noHealthCheckSection: {
    alignItems: 'center',
    padding: 32,
    marginTop: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  noHealthCheckTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#636E72',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  noHealthCheckText: {
    fontSize: 14,
    color: '#95A5A6',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default HealthCheckDetailScreen;