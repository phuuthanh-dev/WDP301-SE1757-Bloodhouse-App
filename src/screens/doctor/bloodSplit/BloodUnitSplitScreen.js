import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Platform,
  Image,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import bloodDonationAPI from '@/apis/bloodDonation';
import bloodUnitAPI from '@/apis/bloodUnit';
import bloodComponentAPI from '@/apis/bloodComponent';
import { toast } from 'sonner-native';
import { formatDateTime } from '@/utils/formatHelpers';

const BloodUnitSplitScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { donationId, donationData } = route.params;

  const [loading, setLoading] = useState(true);
  const [donation, setDonation] = useState(donationData || null);
  const [bloodUnits, setBloodUnits] = useState([]);
  const [bloodComponents, setBloodComponents] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state for multiple blood units
  const [newBloodUnits, setNewBloodUnits] = useState([{
    id: Date.now(),
    componentId: '',
    componentName: '',
    quantity: '',
  }]);

  useEffect(() => {
    fetchDonationDetail();
    fetchBloodComponents();
  }, [donationId]);

  // Refresh when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      fetchDonationDetail();
    }, [donationId])
  );

  const fetchBloodComponents = async () => {
    try {
      const response = await bloodComponentAPI.HandleBloodComponent('', null, 'get');
      if (response.data && Array.isArray(response.data)) {
        // Filter out "Máu toàn phần" as it cannot be split
        const filteredComponents = response.data.filter(component => 
          component.name !== 'Máu toàn phần'
        );
        setBloodComponents(filteredComponents);
      } else {
        setBloodComponents([]);
      }
    } catch (error) {
      console.error('Error fetching blood components:', error);
      setBloodComponents([]);
      // Set default components as fallback (excluding Máu toàn phần)
      setBloodComponents([]);
    }
  };

  const fetchDonationDetail = async () => {
    try {
      setLoading(true);
      
      // Get donation detail
      const donationResponse = await bloodDonationAPI.HandleBloodDonation(
        `/${donationId}`,
        null,
        'get'
      );
      
      if (donationResponse.data) {
        setDonation(donationResponse.data);
        
        const unitsResponse = await bloodUnitAPI.HandleBloodUnit(
          `/donation/${donationId}`,
          null,
          'get'
        );
        
        if (unitsResponse.data && unitsResponse.data.data) {
          setBloodUnits(unitsResponse.data.data);
        } else {
          setBloodUnits([]);
        }
      }
    } catch (error) {
      console.error('Error fetching donation detail:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin hiến máu');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBloodUnit = async () => {
    try {
      // Validation for all units
      const validUnits = [];
      let hasError = false;

      for (let i = 0; i < newBloodUnits.length; i++) {
        const unit = newBloodUnits[i];
        
        if (!unit.componentId) {
          Alert.alert('Lỗi', `Vui lòng chọn thành phần máu cho đơn vị ${i + 1}`);
          hasError = true;
          break;
        }

        if (!unit.quantity) {
          Alert.alert('Lỗi', `Vui lòng nhập thể tích cho đơn vị ${i + 1}`);
          hasError = true;
          break;
        }

        const quantity = parseFloat(unit.quantity);
        if (isNaN(quantity) || quantity <= 0) {
          Alert.alert('Lỗi', `Thể tích phải là số dương cho đơn vị ${i + 1}`);
          hasError = true;
          break;
        }

        validUnits.push({
          componentId: unit.componentId,
          quantity: quantity,
        });
      }

      if (hasError) return;

      // Check total volume
      const totalExistingVolume = bloodUnits.reduce((sum, unit) => sum + (unit.quantity || 0), 0);
      const totalNewVolume = validUnits.reduce((sum, unit) => sum + unit.quantity, 0);
      
      if (totalExistingVolume + totalNewVolume > (donation.quantity || 0)) {
        Alert.alert('Lỗi', `Tổng thể tích không được vượt quá ${donation.quantity}ml`);
        return;
      }

      setCreating(true);

      const bloodUnitData = {
        donationId,
        units: validUnits
      };

      const response = await bloodUnitAPI.HandleBloodUnit(
        '',
        bloodUnitData,
        'post'
      );

      if (response.data) {
        toast.success(`Tạo thành công ${validUnits.length} đơn vị máu!`);
        setShowAddModal(false);
        resetForm();
        fetchDonationDetail();
      }
    } catch (error) {
      console.error('Error creating blood units:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi tạo đơn vị máu';
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setNewBloodUnits([{
      id: Date.now(),
      componentId: '',
      componentName: '',
      quantity: '',
    }]);
  };

  const addNewUnitRow = () => {
    setNewBloodUnits(prev => [...prev, {
      id: Date.now() + Math.random(),
      componentId: '',
      componentName: '',
      quantity: '',
    }]);
  };

  const removeUnitRow = (id) => {
    if (newBloodUnits.length > 1) {
      setNewBloodUnits(prev => prev.filter(unit => unit.id !== id));
    }
  };

  const updateUnit = (id, field, value) => {
    setNewBloodUnits(prev => prev.map(unit => 
      unit.id === id ? { ...unit, [field]: value } : unit
    ));
  };

  const updateUnitComponent = (id, componentId, componentName) => {
    setNewBloodUnits(prev => prev.map(unit => 
      unit.id === id ? { ...unit, componentId, componentName } : unit
    ));
  };

  const getTotalNewVolume = () => {
    return newBloodUnits.reduce((sum, unit) => {
      const quantity = parseFloat(unit.quantity) || 0;
      return sum + quantity;
    }, 0);
  };

  const renderUnitRow = (unit, index) => (
    <View key={unit.id} style={styles.unitRow}>
      <View style={styles.unitRowHeader}>
        <Text style={styles.unitRowTitle}>Đơn vị máu #{index + 1}</Text>
        {newBloodUnits.length > 1 && (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => removeUnitRow(unit.id)}
          >
            <MaterialIcons name="close" size={20} color="#FF4757" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.unitRowContent}>
        <View style={styles.formField}>
          <Text style={styles.fieldLabel}>Thành phần máu *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.componentSelector}>
            {bloodComponents.map((component) => (
              <TouchableOpacity
                key={component._id}
                style={[
                  styles.componentChip,
                  unit.componentId === component._id && styles.componentChipActive
                ]}
                onPress={() => updateUnitComponent(unit.id, component._id, component.name)}
              >
                <Text style={[
                  styles.componentChipText,
                  unit.componentId === component._id && styles.componentChipTextActive
                ]}>
                  {component.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.formField}>
          <Text style={styles.fieldLabel}>Thể tích (ml) *</Text>
          <TextInput
            style={styles.textInput}
            value={unit.quantity}
            onChangeText={(text) => updateUnit(unit.id, 'quantity', text)}
            placeholder="450"
            keyboardType="numeric"
            placeholderTextColor="#A0AEC0"
          />
        </View>
      </View>
    </View>
  );

  const renderAddBloodUnitModal = () => {
    const totalVolume = getTotalNewVolume();
    const remainingVolume = (donation?.quantity || 0) - bloodUnits.reduce((sum, unit) => sum + (unit.quantity || 0), 0);
    const isOverLimit = totalVolume > remainingVolume;

    return (
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTop}>
                <Text style={styles.modalTitle}>Thêm đơn vị máu mới</Text>
                <TouchableOpacity onPress={() => {
                  setShowAddModal(false);
                  resetForm();
                }}>
                  <MaterialIcons name="close" size={24} color="#636E72" />
                </TouchableOpacity>
              </View>
              
              {/* Volume Info in Header */}
              <View style={styles.modalVolumeInfo}>
                <View style={styles.volumeStatusRow}>
                  <View style={styles.volumeStatusItem}>
                    <Text style={styles.volumeStatusLabel}>Còn lại</Text>
                    <Text style={styles.volumeStatusValue}>{remainingVolume}ml</Text>
                  </View>
                  <MaterialIcons name="arrow-forward" size={16} color="#636E72" />
                  <View style={styles.volumeStatusItem}>
                    <Text style={styles.volumeStatusLabel}>Sẽ tạo</Text>
                    <Text style={[
                      styles.volumeStatusValue, 
                      { color: isOverLimit ? '#FF4757' : '#2ED573' }
                    ]}>
                      {totalVolume}ml
                    </Text>
                  </View>
                </View>
                {isOverLimit && (
                  <View style={styles.warningBanner}>
                    <MaterialIcons name="warning" size={16} color="#FF4757" />
                    <Text style={styles.warningText}>Tổng thể tích vượt quá giới hạn!</Text>
                  </View>
                )}
              </View>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalDescription}>
                Chọn thành phần máu để phân chia từ máu toàn phần
              </Text>

              {newBloodUnits.map((unit, index) => renderUnitRow(unit, index))}

              <TouchableOpacity
                style={styles.addUnitButton}
                onPress={addNewUnitRow}
              >
                <MaterialIcons name="add" size={20} color="#4A90E2" />
                <Text style={styles.addUnitButtonText}>Thêm đơn vị máu</Text>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.createButton, 
                  (creating || isOverLimit) && styles.createButtonDisabled
                ]}
                onPress={handleAddBloodUnit}
                disabled={creating || isOverLimit}
              >
                <Text style={styles.createButtonText}>
                  {creating ? 'Đang tạo...' : `Tạo ${newBloodUnits.length} đơn vị máu`}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const handleConfirmSplitComplete = async () => {
    try {
      const totalVolume = bloodUnits.reduce((sum, unit) => sum + (unit.quantity || 0), 0);
      const donationQuantity = donation?.quantity || 0;
      
      if (totalVolume < donationQuantity) {
        Alert.alert(
          'Xác nhận',
          `Bạn chưa phân chia hết máu hiến (${totalVolume}ml/${donationQuantity}ml). Bạn có muốn hoàn thành phân chia?`,
          [
            { text: 'Tiếp tục phân chia', style: 'cancel' },
            { 
              text: 'Hoàn thành', 
              onPress: () => confirmSplitComplete()
            }
          ]
        );
      } else {
        Alert.alert('Xác nhận', 'Bạn có muốn hoàn thành phân chia?', [
          { text: 'Tiếp tục phân chia', style: 'cancel' },
          { 
            text: 'Hoàn thành', 
            onPress: () => confirmSplitComplete()
          }
        ]);
      }
    } catch (error) {
      console.error('Error confirming split complete:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi xác nhận hoàn thành phân chia');
    }
  };

  const confirmSplitComplete = async () => {
    try {
      setSaving(true);

      const response = await bloodDonationAPI.HandleBloodDonation(
        `/doctor/${donationId}/mark-divided`,
        {},
        'patch'
      );

      if (response.data) {
        toast.success('✅ Đã hoàn thành phân chia máu!');
        
          navigation.navigate('TabNavigatorDoctor', {
            screen: 'BloodDonations',
            params: {
              screen: 'BloodDonationList',
            },
          });
      }
    } catch (error) {
      console.error('Error marking donation as divided:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái';
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'testing':
        return { label: 'Đang kiểm tra', color: '#4A90E2', icon: 'clock-outline' };
      case 'available':
        return { label: 'Sẵn sàng', color: '#2ED573', icon: 'check-circle' };
      case 'rejected':
        return { label: 'Từ chối', color: '#FF4757', icon: 'close-circle' };
      case 'expired':
        return { label: 'Hết hạn', color: '#95A5A6', icon: 'calendar-remove' };
      default:
        return { label: 'Không xác định', color: '#95A5A6', icon: 'help-circle' };
    }
  };

  const renderBloodUnitItem = ({ item }) => {
    const statusInfo = getStatusInfo(item.status);
    const isExpiringSoon = new Date(item.expiresAt) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    return (
      <TouchableOpacity
        style={[styles.bloodUnitCard, isExpiringSoon && styles.bloodUnitCardWarning]}
        onPress={() => navigation.navigate('BloodUnitUpdate', { 
          bloodUnitId: item._id,
          donationId: donationId
        })}
      >
        <View style={styles.bloodUnitHeader}>
          <View style={styles.bloodUnitInfo}>
            <View style={styles.componentBadge}>
              <MaterialCommunityIcons name="test-tube" size={20} color="#FF6B6B" />
              <Text style={styles.componentText}>{item.component}</Text>
            </View>
            <Text style={styles.bloodUnitCode}>{item.code || item._id.slice(-8)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
            <MaterialCommunityIcons name={statusInfo.icon} size={14} color="#FFF" />
            <Text style={styles.statusText}>{statusInfo.label}</Text>
          </View>
        </View>

        <View style={styles.bloodUnitDetails}>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="water" size={16} color="#636E72" />
            <Text style={styles.detailLabel}>Thể tích:</Text>
            <Text style={styles.detailValue}>{item.quantity}ml</Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="calendar" size={16} color="#636E72" />
            <Text style={styles.detailLabel}>Hạn sử dụng:</Text>
            <Text style={[styles.detailValue, isExpiringSoon && styles.expiringText]}>
              {new Date(item.expiresAt).toLocaleDateString('vi-VN')}
            </Text>
          </View>
          {item.testResults && (
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="flask" size={16} color="#636E72" />
              <Text style={styles.detailLabel}>Kết quả xét nghiệm:</Text>
              <Text style={styles.detailValue}>{item.testResults.notes || 'Đang xử lý'}</Text>
            </View>
          )}
        </View>

        {isExpiringSoon && (
          <View style={styles.warningBanner}>
            <MaterialCommunityIcons name="alert" size={16} color="#FF4757" />
            <Text style={styles.warningText}>Sắp hết hạn sử dụng!</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons name="loading" size={48} color="#FF6B6B" />
          <Text style={styles.loadingText}>Đang tải thông tin...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Check if donation can be divided - Now all donations can be divided
  if (!donation) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons name="loading" size={48} color="#FF6B6B" />
          <Text style={styles.loadingText}>Đang tải thông tin...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const totalVolume = bloodUnits.reduce((sum, unit) => sum + (unit.quantity || 0), 0);
  const remainingVolume = (donation?.quantity || 0) - totalVolume;
  const isFullySplit = remainingVolume <= 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { marginRight: !donation.isDivided ? 0 : 44 }]}>Quản lý đơn vị máu</Text>
        {!donation.isDivided && (
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <MaterialIcons name="add" size={24} color="#fff" />
        </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* Donation Info Card */}
        <View style={styles.donationCard}>
          <View style={styles.donationHeader}>
            <View style={styles.donorInfo}>
              <Image
                source={{ 
                  uri: donation?.userId?.avatar || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 10)}`
                }}
                style={styles.avatar}
              />
              <View style={styles.donorDetails}>
                <Text style={styles.donorName}>{donation?.userId?.fullName || 'N/A'}</Text>
                <View style={styles.donorMetaRow}>
                  <View style={styles.bloodTypeBadge}>
                    <Text style={styles.bloodTypeText}>
                      {donation?.bloodGroupId?.name || donation?.bloodGroupId?.type || 'N/A'}
                    </Text>
                  </View>
                  <Text style={styles.donationCode}>
                    {donation?.code || donation?._id?.slice(-8)}
                  </Text>
                </View>
                <Text style={styles.donationDate}>
                  {formatDateTime(new Date(donation?.donationDate))}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.volumeInfo}>
            <View style={styles.volumeRow}>
              <Text style={styles.volumeLabel}>Tổng lượng hiến:</Text>
              <Text style={styles.volumeValue}>{donation?.quantity || 0}ml</Text>
            </View>
            <View style={styles.volumeRow}>
              <Text style={styles.volumeLabel}>Còn lại:</Text>
              <Text style={[styles.volumeValue, { color: remainingVolume > 0 ? '#2ED573' : '#FF4757' }]}>
                {remainingVolume}ml
              </Text>
            </View>
          </View>

          {/* Split Progress */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Tiến độ phân chia</Text>
              <Text style={styles.progressPercentage}>
                {Math.round((totalVolume / (donation?.quantity || 1)) * 100)}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${Math.min((totalVolume / (donation?.quantity || 1)) * 100, 100)}%`,
                    backgroundColor: isFullySplit ? '#2ED573' : '#4A90E2'
                  }
                ]} 
              />
            </View>
          </View>
        </View>

        {/* Blood Units List */}
        <View style={styles.bloodUnitsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Danh sách đơn vị máu ({bloodUnits.length})</Text>
          </View>

          {bloodUnits.length > 0 ? (
            <FlatList
              data={bloodUnits}
              renderItem={renderBloodUnitItem}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="test-tube-empty" size={64} color="#95A5A6" />
              <Text style={styles.emptyText}>Chưa có đơn vị máu nào</Text>
              <Text style={styles.emptySubText}>Nhấn nút + để thêm đơn vị máu mới</Text>
            </View>
          )}
        </View>

        {/* Complete Split Section */}
        {bloodUnits.length > 0 && (
          <View style={styles.completeSplitCard}>
            <View style={styles.completeSplitHeader}>
              <MaterialCommunityIcons name="check-circle" size={24} color="#2ED573" />
              <Text style={styles.completeSplitTitle}>{donation.isDivided ? "Đã phân chia đơn vị máu" : "Hoàn thành phân chia"}</Text>
            </View>
            
            {!donation.isDivided && (
            <Text style={styles.completeSplitDescription}>
              {isFullySplit 
                ? "Bạn đã phân chia hết máu hiến. Nhấn nút bên dưới để xác nhận hoàn thành."
                : `Còn lại ${remainingVolume}ml chưa được phân chia. Bạn có thể tiếp tục thêm đơn vị máu hoặc hoàn thành phân chia.`
              }
            </Text>
            )}
            <View style={styles.splitSummary}>
              <View style={styles.summaryItem}>
                <MaterialCommunityIcons name="test-tube" size={20} color="#4A90E2" />
                <Text style={styles.summaryText}>{bloodUnits.length} đơn vị máu</Text>
              </View>
              <View style={styles.summaryItem}>
                <MaterialCommunityIcons name="water" size={20} color="#FF6B6B" />
                <Text style={styles.summaryText}>{totalVolume}ml đã phân chia</Text>
              </View>
              <View style={styles.summaryItem}>
                <MaterialCommunityIcons 
                  name={isFullySplit ? "check-circle" : "alert-circle"} 
                  size={20} 
                  color={isFullySplit ? "#2ED573" : "#FFA726"} 
                />
                <Text style={[styles.summaryText, { color: isFullySplit ? "#2ED573" : "#FFA726" }]}>
                  {isFullySplit ? "Hoàn thành" : "Chưa hoàn thành"}
                </Text>
              </View>
            </View>

            {!donation.isDivided && (
            <TouchableOpacity
              style={[styles.completeSplitButton, saving && styles.completeSplitButtonDisabled]}
              onPress={handleConfirmSplitComplete}
              disabled={saving}
            >
              <MaterialCommunityIcons name="check-circle" size={20} color="#FFF" />
              <Text style={styles.completeSplitButtonText}>
                {saving ? 'Đang xử lý...' : 'Xác nhận hoàn thành phân chia'}
              </Text>
            </TouchableOpacity>
            )}

          </View>
        )}
      </ScrollView>

      {renderAddBloodUnitModal()}
    </SafeAreaView>
  );
};

export default BloodUnitSplitScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
    
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF4757',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#636E72',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  backToListButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  backToListText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  donationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  donationHeader: {
    marginBottom: 16,
  },
  donorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#FF6B6B',
    marginRight: 16,
  },
  donorDetails: {
    flex: 1,
  },
  donorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 8,
  },
  donorMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 12,
  },
  bloodTypeBadge: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  bloodTypeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  donationDate: {
    fontSize: 13,
    color: '#636E72',
  },
  donationCode: {
    fontSize: 12,
    color: '#4A5568',
    fontWeight: '500',
    fontFamily: 'monospace',
  },
  volumeInfo: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  volumeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  volumeLabel: {
    fontSize: 14,
    color: '#636E72',
    fontWeight: '500',
  },
  volumeValue: {
    fontSize: 14,
    color: '#2D3748',
    fontWeight: 'bold',
  },
  progressSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  bloodUnitsSection: {
    flex: 1,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  bloodUnitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bloodUnitCardWarning: {
    borderColor: '#FF4757',
    borderWidth: 2,
  },
  bloodUnitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bloodUnitInfo: {
    flex: 1,
  },
  componentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEAEA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  componentText: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '600',
    marginLeft: 6,
  },
  bloodUnitCode: {
    fontSize: 12,
    color: '#636E72',
    fontFamily: 'monospace',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  bloodUnitDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 14,
    color: '#636E72',
    marginLeft: 8,
    marginRight: 8,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#2D3748',
    fontWeight: '600',
    marginLeft: 'auto',
  },
  expiringText: {
    color: '#FF4757',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEAEA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF4757',
  },
  warningText: {
    fontSize: 13,
    color: '#FF4757',
    fontWeight: '600',
    marginLeft: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  emptyText: {
    fontSize: 16,
    color: '#636E72',
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: '#95A5A6',
    marginTop: 8,
    textAlign: 'center',
  },
  completeSplitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: '#2ED573',
  },
  completeSplitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  completeSplitTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2ED573',
    marginLeft: 12,
  },
  completeSplitDescription: {
    fontSize: 14,
    color: '#636E72',
    lineHeight: 20,
    marginBottom: 16,
  },
  splitSummary: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2D3748',
    marginLeft: 8,
  },
  completeSplitButton: {
    backgroundColor: '#2ED573',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  completeSplitButtonDisabled: {
    backgroundColor: '#95A5A6',
    opacity: 0.6,
  },
  completeSplitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  modalHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalVolumeInfo: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  volumeStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  volumeStatusItem: {
    alignItems: 'center',
  },
  volumeStatusLabel: {
    fontSize: 12,
    color: '#636E72',
    fontWeight: '500',
    marginBottom: 4,
  },
  volumeStatusValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    backgroundColor: '#FFEAEA',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  modalDescription: {
    fontSize: 14,
    color: '#636E72',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  modalBody: {
    padding: 20,
    maxHeight: 400,
  },
  formField: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 8,
  },
  fieldHint: {
    fontSize: 12,
    color: '#95A5A6',
    marginBottom: 8,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  componentSelector: {
    flexDirection: 'row',
  },
  componentChip: {
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  componentChipActive: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  componentChipText: {
    fontSize: 14,
    color: '#4A5568',
    fontWeight: '500',
  },
  componentChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2D3748',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingVertical: 12,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#636E72',
    fontWeight: '600',
  },
  createButton: {
    flex: 1,
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    paddingVertical: 12,
    marginLeft: 8,
    alignItems: 'center',
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  unitRow: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  unitRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  unitRowTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  removeButton: {
    backgroundColor: '#FFEAEA',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unitRowContent: {
    gap: 16,
  },
  infoSection: {
    backgroundColor: '#E6F7FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#91D5FF',
  },
  infoText: {
    fontSize: 14,
    color: '#2D3748',
    marginBottom: 12,
    textAlign: 'center',
  },
  volumeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  volumeInfoText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  warningText: {
    fontSize: 12,
    color: '#FF4757',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '600',
  },
  addUnitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#4A90E2',
    borderStyle: 'dashed',
    marginBottom: 20,
  },
  addUnitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90E2',
    marginLeft: 8,
  },
}); 