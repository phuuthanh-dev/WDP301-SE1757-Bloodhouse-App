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
  TextInput,
  Modal,
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { formatDateTime } from '@/utils/formatHelpers';
import bloodDonationAPI from '@/apis/bloodDonation';
import donorStatusLogAPI from '@/apis/donorStatusLog';
import { DONATION_STATUS, getStatusName, getStatusColor } from '@/constants/donationStatus';

const DonationDetailScreen = ({ route }) => {
  const [donationDetail, setDonationDetail] = useState(null);
  const [donorStatusLog, setDonorStatusLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [updateData, setUpdateData] = useState({
    quantity: '',
    notes: '',
    status: '',
  });
  const [isCreatingRestingLog, setIsCreatingRestingLog] = useState(false);
  
  const navigation = useNavigation();
  const donationId = route?.params?.donationId;
  const mode = route?.params?.mode || 'view'; // 'view' or 'update'

  const fetchDonationDetail = async () => {
    try {
      if (!donationId) {
        Alert.alert('Lỗi', 'Không tìm thấy thông tin hiến máu');
        return;
      }

      const response = await bloodDonationAPI.HandleBloodDonation(
        `/${donationId}`,
        null,
        'get'
      );

      if (response.data) {
        const donation = response.data;
        
        // Transform data để phù hợp với UI
        const transformedData = {
          id: donation._id,
          registrationId: donation.bloodDonationRegistrationId?._id || donation.bloodDonationRegistrationId,
          registrationCode: donation.bloodDonationRegistrationId?.code || "N/A",
          donor: {
            id: donation.userId?._id,
            name: donation.userId?.fullName || "N/A",
            avatar: donation.userId?.avatar || "https://png.pngtree.com/png-clipart/20240321/original/pngtree-avatar-job-student-flat-portrait-of-man-png-image_14639685.png",
            bloodType: donation.bloodGroupId?.name || "N/A",
            gender: donation.userId?.sex === 'male' ? 'Nam' : donation.userId?.sex === 'female' ? 'Nữ' : 'N/A',
            dob: donation.userId?.yob ? new Date(donation.userId.yob).toLocaleDateString('vi-VN') : 'N/A',
            phone: donation.userId?.phone || 'N/A',
            email: donation.userId?.email || 'N/A',
          },
          staff: {
            id: donation.staffId?._id || donation.staffId,
            name: donation.staffId?.userId?.fullName || "N/A",
            avatar: donation.staffId?.userId?.avatar || "https://png.pngtree.com/png-clipart/20240321/original/pngtree-avatar-job-student-flat-portrait-of-man-png-image_14639685.png",
          },
          bloodGroup: {
            id: donation.bloodGroupId?._id,
            type: donation.bloodGroupId?.name || "N/A",
          },
          code: donation.code || "N/A",
          bloodComponent: donation.bloodComponent || "Máu toàn phần",
          quantity: donation.quantity || 0,
          donationDate: donation.donationDate,
          donationStartAt: donation.donationDate,
          donationEndAt: donation.updatedAt,
          status: donation.status,
          notes: donation.notes || "",
          facility: {
            name: donation.bloodDonationRegistrationId?.facilityId?.name || "N/A",
            address: donation.bloodDonationRegistrationId?.facilityId?.address || "N/A",
          },
          originalData: donation,
        };
        
        setDonationDetail(transformedData);
        
        // Set initial update data
        setUpdateData({
          quantity: donation.quantity?.toString() || '',
          notes: donation.notes || '',
          status: donation.status || '',
        });
      }
    } catch (error) {
      console.error('Error fetching donation detail:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin chi tiết hiến máu');
    }
  };

  const fetchDonorStatusLog = async () => {
    try {
      const response = await donorStatusLogAPI.HandleDonorStatusLog(
        `/donation/${donationId}`,
        null,
        'get'
      );

      if (response.data && response.data.data && response.data.data.length > 0) {
        setDonorStatusLog(response.data.data[0]);
      } else {
        setDonorStatusLog(null);
      }
    } catch (error) {
      console.error('Error fetching donor status log:', error);
      setDonorStatusLog(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([fetchDonationDetail(), fetchDonorStatusLog()]);
  }, [donationId]);

  // Refresh when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      Promise.all([fetchDonationDetail(), fetchDonorStatusLog()]);
    }, [donationId])
  );

  const handleUpdateDonation = async () => {
    if (!donationDetail) return;
    
    if (!updateData.status) {
      Alert.alert('Lỗi', 'Vui lòng chọn trạng thái');
      return;
    }
    // Validation
    if (updateData.status === 'completed' && (!updateData.quantity || parseInt(updateData.quantity) <= 0)) {
      Alert.alert('Lỗi', 'Vui lòng nhập thể tích hiến máu hợp lệ');
      return;
    }

    

    setIsUpdating(true);
    try {
      const updatePayload = {
        quantity: parseInt(updateData.quantity),
        notes: updateData.notes.trim(),
        status: updateData.status,
      };

      const response = await bloodDonationAPI.HandleBloodDonation(
        `/${donationId}`,
        updatePayload,
        'patch'
      );

      if (response.data) {
        Alert.alert(
          'Thành công',
          'Đã cập nhật thông tin hiến máu thành công!',
          [
            {
              text: 'OK',
              onPress: () => {
                setUpdateModalVisible(false);
                // Reload the detail page to show updated information
                fetchDonationDetail();
                // Refetch donor status log to update button display
                fetchDonorStatusLog();
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error updating donation:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin';
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreateRestingLog = async () => {
    if (!donationDetail) return;
    
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn chuyển người hiến máu sang giai đoạn nghỉ ngơi?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Xác nhận',
          onPress: async () => {
            setIsCreatingRestingLog(true);
            try {
              const response = await donorStatusLogAPI.HandleDonorStatusLog(
                '/',
                {
                  donationId: donationDetail.id,
                  userId: donationDetail.donor.id,
                },
                'post'
              );

              if (response.data) {
                Alert.alert(
                  'Thành công',
                  'Đã chuyển người hiến máu sang giai đoạn nghỉ ngơi!',
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        // Reload the detail page and donor status log
                        fetchDonationDetail();
                        fetchDonorStatusLog();
                      }
                    }
                  ]
                );
              }
            } catch (error) {
              console.error('Error creating resting log:', error);
              const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi chuyển trạng thái';
              Alert.alert('Lỗi', errorMessage);
            } finally {
              setIsCreatingRestingLog(false);
            }
          }
        }
      ]
    );
  };

  const handleNavigateToDonorStatus = () => {
    navigation.navigate('DonorStatus', {
      donationId: donationDetail.id,
    });
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'donating':
        return { label: 'Đang hiến', color: '#FFA502', icon: 'heart-pulse' };
      case 'completed':
        return { label: 'Hoàn thành', color: '#2ED573', icon: 'check-circle' };
      case 'cancelled':
        return { label: 'Đã hủy', color: '#95A5A6', icon: 'cancel' };
      default:
        return { label: 'Chờ xác nhận', color: '#4A90E2', icon: 'clock-outline' };
    }
  };

  const renderUpdateModal = () => (
    <Modal
      visible={updateModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setUpdateModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Cập nhật thông tin hiến máu</Text>
            <TouchableOpacity onPress={() => setUpdateModalVisible(false)}>
              <MaterialIcons name="close" size={24} color="#636E72" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.modalBody}
            showsVerticalScrollIndicator={false}
          >
            {/* Current Information Display */}
            <View style={styles.currentInfoSection}>
              <Text style={styles.currentInfoTitle}>Thông tin hiện tại:</Text>
              <Text style={styles.currentInfoText}>Người hiến: {donationDetail.donor.name}</Text>
              <Text style={styles.currentInfoText}>Nhóm máu: {donationDetail.donor.bloodType}</Text>
              <Text style={styles.currentInfoText}>Loại máu: {donationDetail.bloodComponent}</Text>
              <Text style={styles.currentInfoText}>Trạng thái: {getStatusInfo(donationDetail.status).label}</Text>
            </View>

            {/* Quantity Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Thể tích hiến máu (ml) *</Text>
              <TextInput
                style={styles.textInput}
                value={updateData.quantity}
                onChangeText={(text) => setUpdateData(prev => ({ ...prev, quantity: text }))}
                placeholder="Nhập thể tích hiến máu (VD: 450)"
                keyboardType="numeric"
              />
              <Text style={styles.inputHint}>Thể tích tiêu chuẩn: 450ml</Text>
            </View>

            {/* Status Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Trạng thái *</Text>
              <View style={styles.statusOptions}>
                {[
                  { value: 'completed', label: 'Hoàn thành', icon: 'check-circle', color: '#2ED573' },
                  { value: 'cancelled', label: 'Hủy bỏ', icon: 'cancel', color: '#FF4757' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.statusOption,
                      updateData.status === option.value && styles.statusOptionActive,
                      updateData.status === option.value && { 
                        borderColor: option.color, 
                        shadowColor: option.color,
                        borderWidth: 3,
                      }
                    ]}
                    onPress={() => setUpdateData(prev => ({ ...prev, status: option.value }))}
                  >
                    <View style={styles.statusOptionContent}>
                      <View style={[styles.statusOptionIcon, { backgroundColor: option.color }]}>
                        <MaterialCommunityIcons 
                          name={option.icon} 
                          size={20} 
                          color="#fff" 
                        />
                      </View>
                      <View style={styles.statusOptionTextContainer}>
                        <Text style={[
                          styles.statusOptionText,
                          updateData.status === option.value && { color: option.color, fontWeight: '600' }
                        ]}>
                          {option.label}
                        </Text>
                        <Text style={styles.statusOptionDescription}>
                          {option.value === 'completed' ? 'Quá trình hiến máu thành công' : 'Dừng quá trình hiến máu'}
                        </Text>
                      </View>
                      {updateData.status === option.value && (
                        <View style={[styles.statusSelectedIndicator, { backgroundColor: option.color }]}>
                          <MaterialCommunityIcons name="check" size={16} color="#fff" />
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Notes Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Ghi chú</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={updateData.notes}
                onChangeText={(text) => setUpdateData(prev => ({ ...prev, notes: text }))}
                placeholder="Nhập ghi chú về quá trình hiến máu..."
                multiline
                numberOfLines={4}
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setUpdateModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.updateButton, isUpdating && styles.updateButtonDisabled]}
              onPress={handleUpdateDonation}
              disabled={isUpdating}
            >
              <Text style={styles.updateButtonText}>
                {isUpdating ? 'Đang cập nhật...' : 'Cập nhật'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading || !donationDetail) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <MaterialCommunityIcons name="loading" size={48} color="#FF6B6B" />
          <Text style={styles.loadingText}>Đang tải thông tin...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusInfo = getStatusInfo(donationDetail.status);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => {
          navigation.navigate('TabNavigatorNurse', {
            screen: 'Donations',
            params: {
              screen: 'Donations',
            },
          });
        }}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Chi tiết hiến máu</Text>
          <View style={[styles.headerStatus, { backgroundColor: statusInfo.color }]}>
            <MaterialCommunityIcons name={statusInfo.icon} size={16} color="#fff" />
            <Text style={styles.headerStatusText}>{statusInfo.label}</Text>
          </View>
        </View>
        {mode === 'update' && donationDetail?.status === 'donating' ? (
          <TouchableOpacity 
            style={styles.updateHeaderButton} 
            onPress={() => setUpdateModalVisible(true)}
          >
            <MaterialIcons name="edit" size={24} color="#fff" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Donor Information Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="account-heart" size={24} color="#FF6B6B" />
            <Text style={styles.cardTitle}>Thông tin người hiến</Text>
          </View>
          <View style={styles.donorInfoContainer}>
            <Image source={{ uri: donationDetail.donor.avatar }} style={styles.donorAvatar} />
            <View style={styles.donorDetails}>
              <Text style={styles.donorName}>{donationDetail.donor.name}</Text>
              <View style={styles.donorMetaContainer}>
                <View style={styles.donorMeta}>
                  <MaterialCommunityIcons name="water" size={16} color="#FF6B6B" />
                  <Text style={styles.donorMetaText}>{donationDetail.donor.bloodType}</Text>
                </View>
                <View style={styles.donorMeta}>
                  <MaterialCommunityIcons name="account" size={16} color="#636E72" />
                  <Text style={styles.donorMetaText}>{donationDetail.donor.gender}</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.donorContactInfo}>
            <InfoRow icon="phone" label="Số điện thoại" value={donationDetail.donor.phone} />
            <InfoRow icon="email" label="Email" value={donationDetail.donor.email} />
            <InfoRow icon="calendar" label="Ngày sinh" value={donationDetail.donor.dob} />
          </View>
        </View>

        {/* Donation Information Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="heart-pulse" size={24} color="#FF6B6B" />
            <Text style={styles.cardTitle}>Thông tin hiến máu</Text>
          </View>
          <View style={styles.donationInfoGrid}>
            <InfoCard 
              icon="identifier" 
              label="Mã hiến máu" 
              value={donationDetail.code}
              color="#4A90E2"
            />
            <InfoCard 
              icon="identifier" 
              label="Mã đăng ký" 
              value={donationDetail.registrationCode}
              color="#9B59B6"
            />
            <InfoCard 
              icon="water-outline" 
              label="Loại máu" 
              value={donationDetail.bloodComponent}
              color="#E74C3C"
            />
            <InfoCard 
              icon="beaker" 
              label="Thể tích" 
              value={donationDetail.quantity > 0 ? `${donationDetail.quantity} ml` : 'Chưa cập nhật'}
              color="#F39C12"
            />
          </View>
          
          <View style={styles.donationDetails}>
            <InfoRow icon="clock-outline" label="Thời gian bắt đầu" value={formatDateTime(new Date(donationDetail.donationStartAt))} />
            {donationDetail.donationEndAt && donationDetail.status === 'completed' && (
              <InfoRow icon="clock-check-outline" label="Thời gian kết thúc" value={formatDateTime(new Date(donationDetail.donationEndAt))} />
            )}
            <InfoRow icon="account-tie" label="Y tá phụ trách" value={donationDetail.staff.name} />
            <InfoRow icon="hospital-building" label="Cơ sở y tế" value={donationDetail.facility.name} />
            
            {/* Status with enhanced styling */}
            <View style={styles.statusRow}>
              <MaterialCommunityIcons name="information" size={18} color="#636E72" />
              <Text style={styles.infoLabel}>Trạng thái:</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
                <MaterialCommunityIcons name={statusInfo.icon} size={16} color="#fff" />
                <Text style={styles.statusBadgeText}>{statusInfo.label}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Notes Card */}
        {donationDetail.notes && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="note-text" size={24} color="#FF6B6B" />
              <Text style={styles.cardTitle}>Ghi chú</Text>
            </View>
            <View style={styles.notesContainer}>
              <Text style={styles.notesText}>{donationDetail.notes}</Text>
            </View>
          </View>
        )}

        {/* Post-Donation Action Card - Show when donation is completed */}
        {donationDetail.status === 'completed' && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons 
                name={donorStatusLog ? "check-circle" : "bed"} 
                size={24} 
                color="#2ED573" 
              />
              <Text style={styles.cardTitle}>
                {donorStatusLog ? "Theo dõi sau hiến" : "Giai đoạn nghỉ ngơi"}
              </Text>
              {donorStatusLog && (
                <View style={styles.statusIndicatorBadge}>
                  <MaterialCommunityIcons name="check-circle" size={16} color="#2ED573" />
                  <Text style={styles.statusIndicatorText}>
                    {donorStatusLog.recordedAt ? "Đã hoàn tất" : "Đang theo dõi"}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.restingActionContainer}>
              {donorStatusLog ? (
                <>
                  <Text style={styles.restingDescription}>
                    {donorStatusLog.recordedAt 
                      ? "Đã hoàn tất theo dõi sau hiến máu. Bạn có thể xem chi tiết hoặc cập nhật thông tin nếu cần."
                      : "Người hiến máu đang trong giai đoạn nghỉ ngơi. Bạn có thể xem và cập nhật tình trạng sức khỏe."
                    }
                  </Text>
                  <TouchableOpacity
                    style={styles.viewStatusButton}
                    onPress={handleNavigateToDonorStatus}
                  >
                    <MaterialCommunityIcons 
                      name="heart-plus" 
                      size={20} 
                      color="#fff" 
                    />
                    <Text style={styles.viewStatusButtonText}>
                      {donorStatusLog.recordedAt ? "Xem chi tiết theo dõi" : "Xem và cập nhật trạng thái"}
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.restingDescription}>
                    Người hiến máu đã hoàn thành quá trình hiến máu. Hãy chuyển họ sang giai đoạn nghỉ ngơi để theo dõi sức khỏe.
                  </Text>
                  <TouchableOpacity
                    style={[styles.restingButton, isCreatingRestingLog && styles.restingButtonDisabled]}
                    onPress={handleCreateRestingLog}
                    disabled={isCreatingRestingLog}
                  >
                    <MaterialCommunityIcons 
                      name="bed" 
                      size={20} 
                      color="#fff" 
                    />
                    <Text style={styles.restingButtonText}>
                      {isCreatingRestingLog ? 'Đang xử lý...' : 'Chuyển sang nghỉ ngơi'}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        )}

        {/* Mode Information */}
        <View style={styles.modeInfo}>
          <MaterialCommunityIcons 
            name={mode === 'update' ? 'pencil' : 'eye'} 
            size={16} 
            color="#636E72" 
          />
          <Text style={styles.modeText}>
            Chế độ: {mode === 'update' ? 'Cập nhật' : 'Xem'}
          </Text>
        </View>
      </ScrollView>

      {renderUpdateModal()}
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

const InfoCard = ({ icon, label, value, color }) => (
  <View style={styles.infoCard}>
    <View style={[styles.infoCardIcon, { backgroundColor: color }]}>
      <MaterialCommunityIcons name={icon} size={20} color="#fff" />
    </View>
    <Text style={styles.infoCardLabel}>{label}</Text>
    <Text style={styles.infoCardValue}>{value}</Text>
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
  updateHeaderButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
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
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3436',
    marginLeft: 8,
  },
  donorInfoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  donorAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#FF6B6B',
  },
  donorDetails: {
    flex: 1,
    marginLeft: 16,
  },
  donorName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 8,
  },
  donorMetaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  donorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  donorMetaText: {
    fontSize: 14,
    color: '#636E72',
    fontWeight: '500',
    marginLeft: 4,
  },
  donorContactInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  donationInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  infoCard: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
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
  },
  infoCardValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2D3436',
    textAlign: 'center',
  },
  donationDetails: {
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: '#636E72',
    marginLeft: 8,
    minWidth: 120,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#2D3436',
    fontWeight: '600',
    flex: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 'auto',
  },
  statusBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 4,
  },
  notesContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  notesText: {
    fontSize: 15,
    color: '#2D3436',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  modeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#E9ECEF',
    borderRadius: 8,
  },
  modeText: {
    fontSize: 14,
    color: '#636E72',
    marginLeft: 8,
    fontWeight: '500',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '92%',
    maxHeight: '85%',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  modalBody: {
    maxHeight: 450,
  },
  currentInfoSection: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  currentInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentInfoText: {
    fontSize: 14,
    color: '#636E72',
    marginBottom: 6,
    paddingLeft: 8,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#E9ECEF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#FAFBFC',
    color: '#2D3436',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 16,
  },
  inputHint: {
    fontSize: 12,
    color: '#636E72',
    marginTop: 6,
    fontStyle: 'italic',
    paddingLeft: 4,
  },
  statusOptions: {
    flexDirection: 'column',
  },
  statusOption: {
    padding: 16,
    borderWidth: 2,
    borderColor: '#E9ECEF',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    marginBottom: 12,
  },
  statusOptionActive: {
    borderWidth: 2,
    elevation: 4,
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  statusOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statusOptionTextContainer: {
    flex: 1,
  },
  statusOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 2,
  },
  statusOptionDescription: {
    fontSize: 13,
    color: '#636E72',
    lineHeight: 18,
  },
  statusSelectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E9ECEF',
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#636E72',
    textAlign: 'center',
  },
  updateButton: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  updateButtonDisabled: {
    backgroundColor: '#E9ECEF',
    elevation: 0,
    shadowOpacity: 0,
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  restingActionContainer: {
    padding: 16,
  },
  restingDescription: {
    fontSize: 14,
    color: '#636E72',
    lineHeight: 20,
    marginBottom: 16,
  },
  restingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#2ED573',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#2ED573',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  restingButtonDisabled: {
    backgroundColor: '#E9ECEF',
    elevation: 0,
    shadowOpacity: 0,
  },
  restingButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  statusIndicatorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F8F5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 'auto',
  },
  statusIndicatorText: {
    fontSize: 12,
    color: '#2ED573',
    fontWeight: '600',
    marginLeft: 4,
  },
  viewStatusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  viewStatusButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
});

export default DonationDetailScreen;
