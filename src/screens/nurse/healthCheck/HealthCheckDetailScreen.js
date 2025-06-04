import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, StyleSheet, ScrollView, Platform, TouchableOpacity, Image, Alert } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import healthCheckAPI from '@/apis/healthCheckAPI';
import bloodDonationAPI from '@/apis/bloodDonation';
import { useSelector } from 'react-redux';
import { authSelector } from '@/redux/reducers/authReducer';

// Health Check Status mapping
const HEALTH_CHECK_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed", 
  CANCELLED: "cancelled",
  DONATED: "donated",
};

// Registration Status mapping
const DONATION_STATUS = {
  PENDING_APPROVAL: "pending_approval",
  REGISTERED: "registered", 
  CHECKED_IN: "checked_in",
  IN_CONSULT: "in_consult",
  REJECTED: "rejected",
  WAITING_DONATION: "waiting_donation",
  DONATING: "donating",
  DONATED: "donated",
  COMPLETED: "completed",
};

// Status styling functions
const getHealthCheckStatusInfo = (status) => {
  switch (status) {
    case HEALTH_CHECK_STATUS.PENDING:
      return { label: 'Chờ khám', color: '#FFA502', bgColor: '#FFF4E6', icon: 'clock-outline' };
    case HEALTH_CHECK_STATUS.COMPLETED:
      return { label: 'Hoàn thành', color: '#2ED573', bgColor: '#E8F5E8', icon: 'check-circle' };
    case HEALTH_CHECK_STATUS.CANCELLED:
      return { label: 'Đã hủy', color: '#FF4757', bgColor: '#FFE8E8', icon: 'close-circle' };
    case HEALTH_CHECK_STATUS.DONATED:
      return { label: 'Đã hiến máu', color: '#3742FA', bgColor: '#E6E8FF', icon: 'heart' };
    default:
      return { label: 'Chưa xác định', color: '#95A5A6', bgColor: '#F8F9FA', icon: 'help-circle' };
  }
};

const getEligibilityInfo = (isEligible) => {
  if (isEligible === true) {
    return { label: 'Đủ điều kiện', color: '#2ED573', bgColor: '#E8F5E8', icon: 'check-circle' };
  } else if (isEligible === false) {
    return { label: 'Không đủ điều kiện', color: '#FF4757', bgColor: '#FFE8E8', icon: 'close-circle' };
  }
  return { label: 'Chưa đánh giá', color: '#95A5A6', bgColor: '#F8F9FA', icon: 'help-circle' };
};

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

  useFocusEffect(
    React.useCallback(() => {
      fetchHealthCheckDetail();
    }, [registrationId])
  );

  const handleCreateBloodDonation = async () => {
    if (!registrationData || !healthCheckData) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin đăng ký hoặc khám sức khỏe');
      return;
    }

    Alert.alert(
      'Tiến hành hiến máu',
      `Xác nhận tiến hành hiến máu cho ${registrationData.userId?.fullName}?`,
      [
        { text: 'Hủy', style: 'cancel' },
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
                        navigation.navigate('TabNavigatorNurse', {
                          screen: 'HealthChecks',
                          params: { screen: 'HealthChecks' },
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

  // Get status info
  const healthCheckStatusInfo = healthCheckData 
    ? getHealthCheckStatusInfo(healthCheckData.status)
    : { label: 'Chưa khám', color: '#95A5A6', bgColor: '#F8F9FA', icon: 'stethoscope' };
  
  const eligibilityInfo = healthCheckData 
    ? getEligibilityInfo(healthCheckData.isEligible)
    : { label: 'Chưa đánh giá', color: '#95A5A6', bgColor: '#F8F9FA', icon: 'help-circle' };

  return (
    <SafeAreaView style={styles.container}>
      {/* Compact Header with Code and Status */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack?.()}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerCode}>
            Đơn khám sức khoẻ
          </Text>
          <Text style={styles.headerCode}>
            {healthCheckData?.code ||  `#${registrationData?._id?.slice(-6)}`}
          </Text>
          <View style={[styles.headerStatusBadge, { backgroundColor: healthCheckStatusInfo.bgColor }]}>
            <MaterialCommunityIcons 
              name={healthCheckStatusInfo.icon} 
              size={14} 
              color={healthCheckStatusInfo.color} 
            />
            <Text style={[styles.headerStatusText, { color: healthCheckStatusInfo.color }]}>
              {healthCheckStatusInfo.label}
            </Text>
          </View>
        </View>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Patient Info Card */}
        <View style={styles.card}>
          <View style={styles.patientHeader}>
            <View style={styles.avatarSection}>
              <Image 
                source={{ 
                  uri: registrationData.userId?.avatar || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 10)}`
                }} 
                style={styles.avatar} 
              />
              <View style={styles.bloodTypeBadge}>
                <Text style={styles.bloodTypeText}>
                  {registrationData.bloodGroupId?.name || registrationData.bloodGroupId?.type}
                </Text>
              </View>
            </View>
            
            <View style={styles.patientInfo}>
              <Text style={styles.patientName}>{registrationData.userId?.fullName}</Text>
              <Text style={styles.patientSubInfo}>
                {registrationData.userId?.sex === 'male' ? ' Nam' : ' Nữ'} • {' '}
                {registrationData.userId?.yob ? new Date().getFullYear() - new Date(registrationData.userId.yob).getFullYear() + ' tuổi' : 'N/A'}
              </Text>
              <Text style={styles.patientContact}>📞 {registrationData.userId?.phone}</Text>
            </View>
          </View>

          {/* Eligibility Status */}
          <View style={[styles.eligibilityCard, { backgroundColor: eligibilityInfo.bgColor }]}>
            <MaterialCommunityIcons 
              name={eligibilityInfo.icon} 
              size={20} 
              color={eligibilityInfo.color} 
            />
            <Text style={[styles.eligibilityText, { color: eligibilityInfo.color }]}>
              {eligibilityInfo.label}
            </Text>
          </View>
        </View>

        {/* Registration Info */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Thông tin đăng ký</Text>
          <View style={styles.infoGrid}>
            <InfoItem icon="calendar" label="Ngày khám" value={new Date(healthCheckData.checkDate).toLocaleString('vi-VN')} />
            <InfoItem icon="hospital-building" label="Cơ sở" value={registrationData.facilityId?.name} />
            <InfoItem icon="account-tie" label="Y tá hỗ trợ" value={registrationData.staffId?.userId?.fullName || 'Chưa phân công'} />
            <InfoItem icon="heart-plus" label="Thành phần" value={registrationData.bloodComponent || 'Máu toàn phần'} />
          </View>
        </View>

        {/* Health Check Results */}
        {healthCheckData ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Kết quả khám sức khỏe</Text>
            
            <View style={styles.doctorInfo}>
              <MaterialCommunityIcons name="doctor" size={20} color="#4A90E2" />
              <Text style={styles.doctorText}>
                BS. {healthCheckData.doctorId?.userId?.fullName || 'Chưa phân công'}
              </Text>
            </View>

            {/* Vital Signs Grid */}
            <View style={styles.vitalSignsGrid}>
              {healthCheckData.bloodPressure && (
                <VitalCard 
                  icon="heart-pulse" 
                  label="Huyết áp" 
                  value={healthCheckData.bloodPressure + ' mmHg'} 
                  color="#E74C3C" 
                />
              )}
              {healthCheckData.pulse && (
                <VitalCard 
                  icon="heart" 
                  label="Nhịp tim" 
                  value={healthCheckData.pulse + ' bpm'} 
                  color="#FF6B6B" 
                />
              )}
              {healthCheckData.temperature && (
                <VitalCard 
                  icon="thermometer" 
                  label="Nhiệt độ" 
                  value={healthCheckData.temperature + ' °C'} 
                  color="#3498DB" 
                />
              )}
              {healthCheckData.weight && (
                <VitalCard 
                  icon="weight" 
                  label="Cân nặng" 
                  value={healthCheckData.weight + ' kg'} 
                  color="#F39C12" 
                />
              )}
              {healthCheckData.hemoglobin && (
                <VitalCard 
                  icon="water-percent" 
                  label="Hemoglobin" 
                  value={healthCheckData.hemoglobin + ' g/dL'} 
                  color="#9B59B6" 
                />
              )}
              {healthCheckData.generalCondition && (
                <VitalCard 
                  icon="account-check" 
                  label="Tình trạng" 
                  value={healthCheckData.generalCondition} 
                  color="#2ED573" 
                />
              )}
            </View>

            {/* Deferral Reason */}
            {healthCheckData.deferralReason && (
              <View style={styles.warningCard}>
                <MaterialCommunityIcons name="alert-circle" size={20} color="#FF4757" />
                <View style={styles.warningContent}>
                  <Text style={styles.warningTitle}>Lý do không đủ điều kiện</Text>
                  <Text style={styles.warningText}>{healthCheckData.deferralReason}</Text>
                </View>
              </View>
            )}

            {/* Doctor Notes */}
            {healthCheckData.notes && (
              <View style={styles.notesCard}>
                <MaterialCommunityIcons name="note-text" size={18} color="#636E72" />
                <View style={styles.notesContent}>
                  <Text style={styles.notesTitle}>Ghi chú bác sĩ</Text>
                  <Text style={styles.notesText}>{healthCheckData.notes}</Text>
                </View>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.card}>
            <View style={styles.noDataCard}>
              <MaterialCommunityIcons name="stethoscope" size={48} color="#95A5A6" />
              <Text style={styles.noDataTitle}>Chưa có thông tin khám sức khỏe</Text>
              <Text style={styles.noDataText}>
                {registrationData.status === DONATION_STATUS.CHECKED_IN 
                  ? 'Người hiến đã check-in, đang chờ tạo phiếu khám sức khỏe'
                  : 'Thông tin khám sức khỏe sẽ được cập nhật sau khi bác sĩ thực hiện khám'
                }
              </Text>
            </View>
          </View>
        )}

        {/* Registration Notes */}
        {registrationData.notes && (
          <View style={styles.card}>
            <View style={styles.notesCard}>
              <MaterialCommunityIcons name="clipboard-text" size={18} color="#4A90E2" />
              <View style={styles.notesContent}>
                <Text style={styles.notesTitle}>Ghi chú đăng ký</Text>
                <Text style={styles.notesText}>{registrationData.notes}</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Action Footer */}
      <View style={styles.footer}>
        {registrationData.status === DONATION_STATUS.IN_CONSULT ? (
          <View style={styles.pendingContainer}>
            <MaterialCommunityIcons name="clock-outline" size={20} color="#4A90E2" />
            <Text style={styles.pendingText}>Đang chờ bác sĩ khám</Text>
          </View>
        ) : registrationData.status === DONATION_STATUS.WAITING_DONATION && healthCheckData?.isEligible ? (
          <TouchableOpacity
            style={[styles.actionButton, styles.donationButton, isCreatingDonation && styles.buttonDisabled]}
            onPress={handleCreateBloodDonation}
            disabled={isCreatingDonation}
          >
            <MaterialCommunityIcons name="heart-plus" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>
              {isCreatingDonation ? 'Đang tạo...' : 'Tiến hành hiến máu'}
            </Text>
          </TouchableOpacity>
        ) : registrationData.status === DONATION_STATUS.REJECTED || healthCheckData?.isEligible === false ? (
          <View style={styles.rejectedContainer}>
            <MaterialCommunityIcons name="close-circle" size={20} color="#FF4757" />
            <Text style={styles.rejectedText}>Không đủ điều kiện hiến máu</Text>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
};

// Helper Components
const InfoItem = ({ icon, label, value }) => (
  <View style={styles.infoItem}>
    <MaterialCommunityIcons name={icon} size={16} color="#636E72" />
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || '-'}</Text>
    </View>
  </View>
);

const VitalCard = ({ icon, label, value, color }) => (
  <View style={styles.vitalCard}>
    <View style={[styles.vitalIcon, { backgroundColor: color }]}>
      <MaterialCommunityIcons name={icon} size={16} color="#fff" />
    </View>
    <Text style={styles.vitalLabel}>{label}</Text>
    <Text style={styles.vitalValue}>{value}</Text>
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
  
  // Header Styles
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
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerCode: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
  },
  headerStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  headerStatusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },

  // Scroll Container
  scrollContainer: {
    flex: 1,
    padding: 16,
  },

  // Card Styles
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  // Patient Info
  patientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarSection: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F0F0F0',
  },
  bloodTypeBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: '#FF6B6B',
  },
  bloodTypeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 4,
  },
  patientSubInfo: {
    fontSize: 14,
    color: '#636E72',
    marginBottom: 2,
  },
  patientContact: {
    fontSize: 14,
    color: '#636E72',
  },

  // Eligibility Card
  eligibilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  eligibilityText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },

  // Section Title
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 12,
  },

  // Info Grid
  infoGrid: {
    gap: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#636E72',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
  },

  // Doctor Info
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  doctorText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90E2',
    marginLeft: 8,
  },

  // Vital Signs
  vitalSignsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  vitalCard: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  vitalIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  vitalLabel: {
    fontSize: 11,
    color: '#636E72',
    textAlign: 'center',
    marginBottom: 2,
  },
  vitalValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2D3748',
    textAlign: 'center',
  },

  // Warning Card
  warningCard: {
    backgroundColor: '#FFEAEA',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#FF4757',
  },
  warningContent: {
    marginLeft: 12,
    flex: 1,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF4757',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 13,
    color: '#2D3748',
    lineHeight: 18,
  },

  // Notes Card
  notesCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 3,
    borderLeftColor: '#636E72',
  },
  notesContent: {
    marginLeft: 12,
    flex: 1,
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 13,
    color: '#636E72',
    lineHeight: 18,
    fontStyle: 'italic',
  },

  // No Data Card
  noDataCard: {
    alignItems: 'center',
    padding: 24,
  },
  noDataTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#636E72',
    marginTop: 12,
    marginBottom: 6,
    textAlign: 'center',
  },
  noDataText: {
    fontSize: 14,
    color: '#95A5A6',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Footer
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
  },
  donationButton: {
    backgroundColor: '#2ED573',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  pendingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: '#F0F8FF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  pendingText: {
    color: '#4A90E2',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  rejectedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: '#FFEAEA',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FF4757',
  },
  rejectedText: {
    color: '#FF4757',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default HealthCheckDetailScreen;