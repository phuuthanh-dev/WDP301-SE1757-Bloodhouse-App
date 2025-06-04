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

const DonorStatusScreen = ({ route }) => {
  const [donationDetail, setDonationDetail] = useState(null);
  const [statusLog, setStatusLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [updateData, setUpdateData] = useState({
    status: '',
    notes: '',
  });
  
  const navigation = useNavigation();
  const donationId = route?.params?.donationId;

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
        
        const transformedData = {
          id: donation._id,
          donor: {
            id: donation.userId?._id,
            name: donation.userId?.fullName || "N/A",
            avatar: donation.userId?.avatar || "https://png.pngtree.com/png-clipart/20240321/original/pngtree-avatar-job-student-flat-portrait-of-man-png-image_14639685.png",
            bloodType: donation.bloodGroupId?.name || "N/A",
            gender: donation.userId?.sex === 'male' ? 'Nam' : donation.userId?.sex === 'female' ? 'Nữ' : 'N/A',
            phone: donation.userId?.phone || 'N/A',
            email: donation.userId?.email || 'N/A',
          },
          staff: {
            name: donation.staffId?.userId?.fullName || "N/A",
          },
          code: donation.code || "N/A",
          bloodComponent: donation.bloodComponent || "Máu toàn phần",
          quantity: donation.quantity || 0,
          donationDate: donation.donationDate,
          status: donation.status,
          facility: {
            name: donation.bloodDonationRegistrationId?.facilityId?.name || "N/A",
          },
        };
        
        setDonationDetail(transformedData);
      }
    } catch (error) {
      console.error('Error fetching donation detail:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin chi tiết hiến máu');
    }
  };

  const fetchStatusLog = async () => {
    try {
      const response = await donorStatusLogAPI.HandleDonorStatusLog(
        `/donation/${donationId}`,
        null,
        'get'
      );

      if (response.data && response.data.data && response.data.data.length > 0) {
        setStatusLog(response.data.data[0]);
      }
    } catch (error) {
      console.error('Error fetching status log:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([fetchDonationDetail(), fetchStatusLog()]);
  }, [donationId]);

  useFocusEffect(
    React.useCallback(() => {
      Promise.all([fetchDonationDetail(), fetchStatusLog()]);
    }, [donationId])
  );

  const handleUpdateStatus = async () => {
    if (!statusLog) {
      Alert.alert('Lỗi', 'Không tìm thấy log trạng thái');
      return;
    }
    
    if (!updateData.status || !updateData.notes.trim()) {
      Alert.alert('Lỗi', 'Vui lòng chọn trạng thái và nhập ghi chú');
      return;
    }

    setIsUpdating(true);
    try {
      const requestData = {
        status: updateData.status,
        phase: 'post_rest_check',
        notes: updateData.notes.trim(),
      };

      const response = await donorStatusLogAPI.HandleDonorStatusLog(
        `/${statusLog._id}`,
        requestData,
        'patch'
      );

      if (response.data) {
        Alert.alert(
          'Thành công',
          'Đã ghi nhận trạng thái sức khỏe người hiến máu thành công!',
          [
            {
              text: 'OK',
              onPress: () => {
                setUpdateModalVisible(false);
                setUpdateData({ status: '', notes: '' });
                fetchStatusLog();
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error updating status:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái';
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'stable':
        return { 
          label: 'Ổn định', 
          color: '#2ED573', 
          icon: 'check-circle',
          description: 'Tình trạng sức khỏe ổn định',
          bgColor: '#E8F8F5'
        };
      case 'fatigued':
        return { 
          label: 'Mệt mỏi', 
          color: '#FFA502', 
          icon: 'alert-circle',
          description: 'Cảm thấy mệt mỏi sau hiến máu',
          bgColor: '#FFF3CD'
        };
      case 'needs_monitoring':
        return { 
          label: 'Cần theo dõi', 
          color: '#FF6B6B', 
          icon: 'heart-pulse',
          description: 'Cần theo dõi sức khỏe chặt chẽ',
          bgColor: '#FFEAEA'
        };
      case 'other':
        return { 
          label: 'Khác', 
          color: '#9B59B6', 
          icon: 'alert',
          description: 'Tình trạng khác (xem ghi chú)',
          bgColor: '#F4ECFF'
        };
      default:
        return { 
          label: 'Đang nghỉ ngơi', 
          color: '#4A90E2', 
          icon: 'bed',
          description: 'Đang trong giai đoạn nghỉ ngơi',
          bgColor: '#EBF3FF'
        };
    }
  };

  const openUpdateModal = () => {
    setUpdateData({ status: '', notes: '' });
    setUpdateModalVisible(true);
  };

  const renderUpdateModal = () => {
    
    const statusOptions = [
      { 
        value: 'stable', 
        label: 'Ổn định', 
        icon: 'check-circle', 
        color: '#2ED573',
        lightColor: '#E8F8F5',
        description: 'Tình trạng sức khỏe bình thường'
      },
      { 
        value: 'fatigued', 
        label: 'Mệt mỏi', 
        icon: 'battery-low', 
        color: '#FFA502',
        lightColor: '#FFF3CD',
        description: 'Cảm thấy mệt mỏi nhẹ sau hiến máu'
      },
      { 
        value: 'needs_monitoring', 
        label: 'Cần theo dõi', 
        icon: 'heart-pulse', 
        color: '#FF6B6B',
        lightColor: '#FFEAEA',
        description: 'Cần theo dõi sức khỏe chặt chẽ'
      },
      { 
        value: 'other', 
        label: 'Tình trạng khác', 
        icon: 'alert-circle-outline', 
        color: '#9B59B6',
        lightColor: '#F4ECFF',
        description: 'Tình trạng đặc biệt khác'
      },
    ];
    
    return (
      <Modal
        visible={updateModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setUpdateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Enhanced Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <View style={styles.modalIconContainer}>
                  <MaterialCommunityIcons name="heart-plus" size={24} color="#FF6B6B" />
                </View>
                <View>
                  <Text style={styles.modalTitle}>Ghi nhận trạng thái</Text>
                  <Text style={styles.modalSubtitle}>Đánh giá sức khỏe sau hiến máu</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={() => setUpdateModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#636E72" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Enhanced Patient Info */}
              <View style={styles.patientInfoCard}>
                <View style={styles.patientInfoHeader}>
                  <MaterialCommunityIcons name="account-circle" size={20} color="#FF6B6B" />
                  <Text style={styles.patientInfoTitle}>Thông tin người hiến</Text>
                </View>
                <View style={styles.patientInfoContent}>
                  <View style={styles.patientInfoRow}>
                    <MaterialCommunityIcons name="account" size={16} color="#636E72" />
                    <Text style={styles.patientInfoLabel}>Họ tên:</Text>
                    <Text style={styles.patientInfoValue}>{donationDetail?.donor?.name || 'Không có thông tin'}</Text>
                  </View>
                  <View style={styles.patientInfoRow}>
                    <MaterialCommunityIcons name="water" size={16} color="#FF6B6B" />
                    <Text style={styles.patientInfoLabel}>Nhóm máu:</Text>
                    <Text style={[styles.patientInfoValue, styles.bloodTypeHighlight]}>
                      {donationDetail?.donor?.bloodType || 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.patientInfoRow}>
                    <MaterialCommunityIcons name="gender-male-female" size={16} color="#636E72" />
                    <Text style={styles.patientInfoLabel}>Giới tính:</Text>
                    <Text style={styles.patientInfoValue}>{donationDetail?.donor?.gender || 'N/A'}</Text>
                  </View>
                </View>
              </View>

              {/* Enhanced Status Selection */}
              <View style={styles.statusSection}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="heart-pulse" size={20} color="#FF6B6B" />
                  <Text style={styles.sectionTitle}>Tình trạng sức khỏe</Text>
                </View>
                <Text style={styles.sectionDescription}>Chọn tình trạng hiện tại của người hiến máu</Text>
                
                <View style={styles.statusOptionsContainer}>
                  {statusOptions.map((option) => {
                    const isSelected = updateData.status === option.value;
                    return (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.statusOptionCard,
                          isSelected && {
                            borderColor: option.color,
                            backgroundColor: option.lightColor,
                            shadowColor: option.color,
                            shadowOpacity: 0.25,
                            elevation: 6,
                            transform: [{ scale: 1.02 }],
                          }
                        ]}
                        onPress={() => {
                          setUpdateData(prev => ({ ...prev, status: option.value }));
                        }}
                        activeOpacity={0.7}
                      >
                        <View style={styles.statusOptionContent}>
                          <View style={[
                            styles.statusOptionIcon, 
                            { backgroundColor: isSelected ? option.color : '#F3F4F6' }
                          ]}>
                            <MaterialCommunityIcons 
                              name={option.icon} 
                              size={20} 
                              color={isSelected ? '#FFFFFF' : '#636E72'} 
                            />
                          </View>
                          <View style={styles.statusOptionTextContainer}>
                            <Text style={[
                              styles.statusOptionLabel,
                              isSelected && { color: option.color, fontWeight: '700' }
                            ]}>
                              {option.label}
                            </Text>
                            <Text style={styles.statusOptionDescription}>
                              {option.description}
                            </Text>
                          </View>
                          {isSelected && (
                            <View style={[styles.statusSelectedIcon, { backgroundColor: option.color }]}>
                              <MaterialCommunityIcons name="check" size={16} color="#FFFFFF" />
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Enhanced Notes Input */}
              <View style={styles.notesSection}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="note-text" size={20} color="#FF6B6B" />
                  <Text style={styles.sectionTitle}>Ghi chú chi tiết</Text>
                </View>
                <Text style={styles.sectionDescription}>Mô tả cụ thể về tình trạng sức khỏe</Text>
                <View style={[
                  styles.notesInputContainer,
                  updateData.notes.trim() && { borderColor: '#FF6B6B', borderWidth: 2 }
                ]}>
                  <TextInput
                    style={styles.notesInput}
                    value={updateData.notes}
                    onChangeText={(text) => {
                      setUpdateData(prev => ({ ...prev, notes: text }));
                    }}
                    placeholder="Nhập ghi chú về tình trạng sức khỏe của người hiến máu..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
              </View>
            </ScrollView>

            {/* Enhanced Modal Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setUpdateModalVisible(false)}
              >
                <MaterialCommunityIcons name="close-circle-outline" size={18} color="#636E72" />
                <Text style={styles.cancelButtonText}>Hủy bỏ</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  (!updateData.status || !updateData.notes.trim() || isUpdating) && styles.saveButtonDisabled
                ]}
                onPress={() => {
                  handleUpdateStatus();
                }}
                disabled={!updateData.status || !updateData.notes.trim() || isUpdating}
              >
                <MaterialCommunityIcons 
                  name={isUpdating ? "loading" : "content-save"} 
                  size={18} 
                  color="#FFFFFF" 
                />
                <Text style={styles.saveButtonText}>
                  {isUpdating ? 'Đang lưu...' : 'Lưu kết quả'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  if (loading || !donationDetail) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <View style={styles.loadingIndicator}>
            <MaterialCommunityIcons name="loading" size={48} color="#FF6B6B" />
          </View>
          <Text style={styles.loadingText}>Đang tải thông tin...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isCompleted = statusLog && statusLog.recordedAt !== null;
  const statusInfo = statusLog ? getStatusInfo(statusLog.status) : null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Theo dõi sau hiến</Text>
          {statusInfo && (
            <View style={[styles.headerStatus, { backgroundColor: statusInfo.color }]}>
              <MaterialCommunityIcons name={statusInfo.icon} size={16} color="#fff" />
              <Text style={styles.headerStatusText}>{statusInfo.label}</Text>
            </View>
          )}
        </View>
        {statusLog && !isCompleted ? (
          <TouchableOpacity style={styles.updateHeaderButton} onPress={openUpdateModal}>
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
            <View style={styles.avatarContainer}>
              <Image source={{ uri: donationDetail.donor.avatar }} style={styles.donorAvatar} />
              <View style={styles.bloodTypeBadge}>
                <Text style={styles.bloodTypeText}>{donationDetail.donor.bloodType}</Text>
              </View>
            </View>
            <View style={styles.donorDetails}>
              <Text style={styles.donorName}>{donationDetail.donor.name}</Text>
              <View style={styles.donorMetaContainer}>
                <View style={styles.donorMeta}>
                  <MaterialCommunityIcons name="account" size={16} color="#636E72" />
                  <Text style={styles.donorMetaText}>{donationDetail.donor.gender}</Text>
                </View>
              </View>
              <View style={styles.donorContact}>
                <View style={styles.contactRow}>
                  <MaterialCommunityIcons name="phone" size={16} color="#636E72" />
                  <Text style={styles.contactText}>{donationDetail.donor.phone}</Text>
                </View>
                <View style={styles.contactRow}>
                  <MaterialCommunityIcons name="calendar" size={16} color="#636E72" />
                  <Text style={styles.contactText}>
                    {formatDateTime(new Date(donationDetail.donationDate)).split(' ')[0]}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Status Information Card */}
        {statusLog ? (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="heart-pulse" size={24} color="#FF6B6B" />
              <Text style={styles.cardTitle}>Tình trạng sức khỏe</Text>
              {isCompleted && (
                <View style={styles.completedBadge}>
                  <MaterialCommunityIcons name="check-circle" size={16} color="#2ED573" />
                  <Text style={styles.completedText}>Đã hoàn tất</Text>
                </View>
              )}
            </View>

            <View style={[styles.statusContent, { backgroundColor: statusInfo.bgColor }]}>
              <View style={styles.statusMainInfo}>
                <View style={[styles.statusIconContainer, { backgroundColor: statusInfo.color }]}>
                  <MaterialCommunityIcons name={statusInfo.icon} size={24} color="#FFFFFF" />
                </View>
                <View style={styles.statusTextContent}>
                  <Text style={[styles.statusLabel, { color: statusInfo.color }]}>
                    {statusInfo.label}
                  </Text>
                  <Text style={styles.statusDescription}>{statusInfo.description}</Text>
                  <Text style={styles.statusPhase}>Đã kiểm tra sau nghỉ ngơi</Text>
                </View>
              </View>

              {statusLog.recordedAt && (
                <View style={styles.statusMeta}>
                  <MaterialCommunityIcons name="clock-outline" size={16} color="#636E72" />
                  <Text style={styles.statusTime}>
                    {formatDateTime(new Date(statusLog.recordedAt))}
                  </Text>
                </View>
              )}

              {statusLog.notes && (
                <View style={styles.notesCard}>
                  <View style={styles.notesHeader}>
                    <MaterialCommunityIcons name="note-text" size={16} color="#FF6B6B" />
                    <Text style={styles.notesTitle}>Ghi chú chi tiết:</Text>
                  </View>
                  <Text style={styles.notesContent}>{statusLog.notes}</Text>
                </View>
              )}
            </View>

            {/* Action Button */}
            {!isCompleted && (
              <TouchableOpacity style={styles.actionButton} onPress={openUpdateModal}>
                <MaterialCommunityIcons name="heart-plus" size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Ghi nhận trạng thái</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.card}>
            <View style={styles.emptyStateContainer}>
              <View style={styles.emptyIconContainer}>
                <MaterialCommunityIcons name="bed" size={64} color="#4A90E2" />
              </View>
              <Text style={styles.emptyStateTitle}>Đang trong giai đoạn nghỉ ngơi</Text>
              <Text style={styles.emptyStateText}>
                Người hiến máu đang nghỉ ngơi sau quá trình hiến máu. 
                Vui lòng kiểm tra và ghi nhận tình trạng sức khỏe.
              </Text>
              <TouchableOpacity style={styles.startCheckButton} onPress={openUpdateModal}>
                <MaterialCommunityIcons name="heart-plus" size={18} color="#FFFFFF" />
                <Text style={styles.startCheckButtonText}>Bắt đầu kiểm tra</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {renderUpdateModal()}
    </SafeAreaView>
  );
};

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
  loadingIndicator: {
    marginBottom: 16,
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
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  donorAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#FF6B6B',
  },
  bloodTypeBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  bloodTypeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  donorDetails: {
    flex: 1,
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
    marginBottom: 12,
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
  donorContact: {
    gap: 6,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactText: {
    fontSize: 14,
    color: '#636E72',
    marginLeft: 6,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F8F5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 'auto',
  },
  completedText: {
    fontSize: 12,
    color: '#2ED573',
    fontWeight: '600',
    marginLeft: 4,
  },
  statusContent: {
    borderRadius: 16,
    padding: 20,
  },
  statusMainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statusTextContent: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusDescription: {
    fontSize: 14,
    color: '#636E72',
    marginBottom: 4,
  },
  statusPhase: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  statusMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTime: {
    fontSize: 14,
    color: '#636E72',
    marginLeft: 6,
    fontWeight: '500',
  },
  notesCard: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  notesTitle: {
    fontSize: 14,
    color: '#2D3436',
    fontWeight: '600',
    marginLeft: 6,
  },
  notesContent: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 16,
    elevation: 2,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyStateContainer: {
    alignItems: 'center',
    padding: 20,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#EBF3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#636E72',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  startCheckButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  startCheckButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFEAEA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#636E72',
    marginTop: 4,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    padding: 20,
    maxHeight: 400,
  },
  patientInfoCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  patientInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  patientInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3436',
    marginLeft: 8,
  },
  patientInfoContent: {
    gap: 8,
  },
  patientInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  patientInfoLabel: {
    fontSize: 14,
    color: '#636E72',
    fontWeight: '500',
    marginLeft: 6,
    marginRight: 8,
    minWidth: 70,
  },
  patientInfoValue: {
    fontSize: 14,
    color: '#2D3436',
    fontWeight: '600',
    flex: 1,
  },
  bloodTypeHighlight: {
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
  statusSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3436',
    marginLeft: 8,
  },
  sectionDescription: {
    fontSize: 13,
    color: '#636E72',
    marginBottom: 16,
    lineHeight: 18,
  },
  statusOptionsContainer: {
    gap: 12,
  },
  statusOptionCard: {
    width: '100%',
    padding: 16,
    borderWidth: 2,
    borderColor: '#E9ECEF',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
  statusOptionLabel: {
    fontSize: 16,
    color: '#2D3436',
    fontWeight: '600',
    marginBottom: 4,
  },
  statusOptionDescription: {
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 18,
  },
  statusSelectedIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 8,
    right: 8,
  },
  notesSection: {
    marginBottom: 20,
  },
  notesInputContainer: {
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    minHeight: 100,
  },
  notesInput: {
    padding: 16,
    fontSize: 14,
    color: '#2D3436',
    textAlignVertical: 'top',
    minHeight: 100,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#636E72',
    fontWeight: '500',
    marginLeft: 6,
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  saveButtonDisabled: {
    backgroundColor: '#E9ECEF',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default DonorStatusScreen; 