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
  TextInput,
  Modal,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { BLOOD_COMPONENT } from '@/constants/bloodComponents';
import bloodUnitAPI from '@/apis/bloodUnit';
import bloodInventoryAPI from '@/apis/bloodInventoryAPI';
import { toast } from 'sonner-native';

const BloodUnitUpdateScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { bloodUnitId, donationId } = route.params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bloodUnit, setBloodUnit] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);

  // Form state - phù hợp với backend model
  const [formData, setFormData] = useState({
    component: '',
    quantity: '',
    expiresAt: '',
    status: '',
    testResults: {
      hiv: 'pending',
      hepatitisB: 'pending',
      hepatitisC: 'pending',
      syphilis: 'pending',
      notes: ''
    },
    processedBy: null,
    processedAt: null,
    approvedBy: null,
    approvedAt: null
  });

  // Status options - phù hợp với backend enum
  const STATUS_OPTIONS = [
    { 
      value: 'testing', 
      label: 'Đang xét nghiệm', 
      color: '#4A90E2', 
      icon: 'test-tube',
      description: 'Đơn vị máu đang được xét nghiệm'
    },
    { 
      value: 'available', 
      label: 'Sẵn sàng sử dụng', 
      color: '#2ED573', 
      icon: 'check-circle',
      description: 'Đơn vị máu đã qua xét nghiệm và sẵn sàng sử dụng'
    },
    { 
      value: 'reserved', 
      label: 'Đã đặt trước', 
      color: '#FFA726', 
      icon: 'bookmark',
      description: 'Đơn vị máu đã được đặt trước cho bệnh nhân'
    },
    { 
      value: 'used', 
      label: 'Đã sử dụng', 
      color: '#6C5CE7', 
      icon: 'check-all',
      description: 'Đơn vị máu đã được sử dụng'
    },
    { 
      value: 'expired', 
      label: 'Hết hạn', 
      color: '#95A5A6', 
      icon: 'calendar-remove',
      description: 'Đơn vị máu đã hết hạn sử dụng'
    },
    { 
      value: 'rejected', 
      label: 'Từ chối', 
      color: '#FF4757', 
      icon: 'close-circle',
      description: 'Đơn vị máu bị từ chối do không đạt tiêu chuẩn'
    },
  ];

  // Test result options
  const TEST_RESULT_OPTIONS = [
    { value: 'pending', label: 'Chờ kết quả', color: '#4A90E2', icon: 'clock-outline' },
    { value: 'negative', label: 'Âm tính', color: '#2ED573', icon: 'check-circle' },
    { value: 'positive', label: 'Dương tính', color: '#FF4757', icon: 'alert-circle' },
  ];

  // Blood component options - sử dụng constants từ backend enum
  const BLOOD_COMPONENTS = Object.values(BLOOD_COMPONENT);

  const COMPONENT_LABELS = {
    [BLOOD_COMPONENT.WHOLE]: 'Máu toàn phần',
    [BLOOD_COMPONENT.RED_CELLS]: 'Hồng cầu',
    [BLOOD_COMPONENT.PLASMA]: 'Huyết tương',
    [BLOOD_COMPONENT.PLATELETS]: 'Tiểu cầu',
  };

  // Helper function để lấy label của component
  const getComponentLabel = (component) => {
    return COMPONENT_LABELS[component] || component;
  };

  useEffect(() => {
    fetchBloodUnitDetail();
  }, [bloodUnitId]);

  const fetchBloodUnitDetail = async () => {
    try {
      setLoading(true);
      
      // Gọi API backend để lấy chi tiết blood unit
      const response = await bloodUnitAPI.HandleBloodUnit(
        `/${bloodUnitId}`,
        null,
        'get'
      );
      
      if (response.data) {
        setBloodUnit(response.data);
        setFormData({
          component: response.data.component || BLOOD_COMPONENT.WHOLE,
          quantity: response.data.quantity?.toString() || '',
          expiresAt: response.data.expiresAt ? new Date(response.data.expiresAt).toISOString().split('T')[0] : '',
          status: response.data.status || 'testing',
          testResults: {
            hiv: response.data.testResults?.hiv || 'pending',
            hepatitisB: response.data.testResults?.hepatitisB || 'pending',
            hepatitisC: response.data.testResults?.hepatitisC || 'pending',
            syphilis: response.data.testResults?.syphilis || 'pending',
            notes: response.data.testResults?.notes || ''
          },
          processedBy: response.data.processedBy,
          processedAt: response.data.processedAt,
          approvedBy: response.data.approvedBy,
          approvedAt: response.data.approvedAt
        });
      }
    } catch (error) {
      console.error('Error fetching blood unit detail:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin đơn vị máu');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // Validation
      if (!formData.quantity || !formData.expiresAt || !formData.status) {
        Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
      }

      const quantity = parseFloat(formData.quantity);
      if (isNaN(quantity) || quantity <= 0) {
        Alert.alert('Lỗi', 'Số lượng phải là số dương');
        return;
      }

      setSaving(true);

      const updateData = {
        component: formData.component,
        quantity: quantity,
        expiresAt: new Date(formData.expiresAt).toISOString(),
        status: formData.status,
        testResults: formData.testResults,
        notes: formData.testResults.notes
      };

      // Gọi API PATCH để update blood unit
      const response = await bloodUnitAPI.HandleBloodUnit(
        `/${bloodUnitId}`,
        updateData,
        'patch'
      );

      if (response.data) {
        toast.success('Cập nhật đơn vị máu thành công!');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error updating blood unit:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật';
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmAndSaveToInventory = async () => {
    try {
      // Check if all test results are completed and negative
      const { hiv, hepatitisB, hepatitisC, syphilis } = formData.testResults;
      
      if (hiv === 'pending' || hepatitisB === 'pending' || hepatitisC === 'pending' || syphilis === 'pending') {
        Alert.alert('Cảnh báo', 'Vui lòng hoàn thành tất cả các xét nghiệm trước khi lưu vào kho');
        return;
      }

      if (hiv === 'positive' || hepatitisB === 'positive' || hepatitisC === 'positive' || syphilis === 'positive') {
        Alert.alert(
          'Xác nhận',
          'Có kết quả xét nghiệm dương tính. Đơn vị máu này sẽ bị từ chối và không được lưu vào kho. Bạn có muốn tiếp tục?',
          [
            { text: 'Hủy', style: 'cancel' },
            { 
              text: 'Xác nhận', 
              onPress: async () => {
                await updateBloodUnitStatus('rejected');
              }
            }
          ]
        );
        return;
      }

      // All tests are negative, confirm to save to inventory
      Alert.alert(
        'Xác nhận lưu vào kho',
        'Tất cả kết quả xét nghiệm đều âm tính. Đơn vị máu này sẽ được lưu vào kho máu của cơ sở. Bạn có muốn tiếp tục?',
        [
          { text: 'Hủy', style: 'cancel' },
          { 
            text: 'Lưu vào kho', 
            onPress: async () => {
              await updateBloodUnitStatus('available');
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error confirming blood unit:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi xác nhận đơn vị máu');
    }
  };

  const updateBloodUnitStatus = async (newStatus) => {
    try {
      setSaving(true);

      const updateData = {
        component: formData.component,
        quantity: parseFloat(formData.quantity),
        expiresAt: new Date(formData.expiresAt).toISOString(),
        status: newStatus,
        testResults: formData.testResults,
        notes: formData.testResults.notes
      };

      // Gọi API PATCH để update status
      const response = await bloodUnitAPI.HandleBloodUnit(
        `/${bloodUnitId}`,
        updateData,
        'patch'
      );

      if (response.data) {
        if (newStatus === 'available') {
          toast.success('✅ Đơn vị máu đã được lưu vào kho thành công!');
        } else {
          toast.success('❌ Đơn vị máu đã bị từ chối do kết quả xét nghiệm dương tính');
        }
        
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error updating blood unit status:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái';
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const getStatusInfo = (status) => {
    return STATUS_OPTIONS.find(option => option.value === status) || STATUS_OPTIONS[0];
  };

  const getTestResultInfo = (result) => {
    return TEST_RESULT_OPTIONS.find(option => option.value === result) || TEST_RESULT_OPTIONS[0];
  };

  const updateTestResult = (testType, value) => {
    setFormData(prev => ({
      ...prev,
      testResults: {
        ...prev.testResults,
        [testType]: value
      }
    }));
  };

  const renderStatusModal = () => (
    <Modal
      visible={showStatusModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowStatusModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chọn trạng thái</Text>
            <TouchableOpacity onPress={() => setShowStatusModal(false)}>
              <MaterialIcons name="close" size={24} color="#636E72" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.statusOptions}>
            {STATUS_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.statusOption,
                  formData.status === option.value && styles.statusOptionSelected,
                  { borderColor: option.color }
                ]}
                onPress={() => {
                  setFormData(prev => ({ ...prev, status: option.value }));
                  setShowStatusModal(false);
                }}
              >
                <MaterialCommunityIcons name={option.icon} size={32} color={option.color} />
                <Text style={[styles.statusOptionTitle, { color: option.color }]}>
                  {option.label}
                </Text>
                <Text style={styles.statusOptionDesc}>
                  {option.description}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderTestResultModal = () => (
    <Modal
      visible={showTestModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowTestModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Kết quả xét nghiệm</Text>
            <TouchableOpacity onPress={() => setShowTestModal(false)}>
              <MaterialIcons name="close" size={24} color="#636E72" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.testModalBody}>
            {/* HIV Test */}
            <View style={styles.testSection}>
              <Text style={styles.testTitle}>HIV</Text>
              <View style={styles.testOptions}>
                {TEST_RESULT_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.testOption,
                      formData.testResults.hiv === option.value && styles.testOptionSelected,
                      { borderColor: option.color }
                    ]}
                    onPress={() => updateTestResult('hiv', option.value)}
                  >
                    <MaterialCommunityIcons name={option.icon} size={20} color={option.color} />
                    <Text style={[styles.testOptionText, { color: option.color }]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Hepatitis B Test */}
            <View style={styles.testSection}>
              <Text style={styles.testTitle}>Viêm gan B (HBV)</Text>
              <View style={styles.testOptions}>
                {TEST_RESULT_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.testOption,
                      formData.testResults.hepatitisB === option.value && styles.testOptionSelected,
                      { borderColor: option.color }
                    ]}
                    onPress={() => updateTestResult('hepatitisB', option.value)}
                  >
                    <MaterialCommunityIcons name={option.icon} size={20} color={option.color} />
                    <Text style={[styles.testOptionText, { color: option.color }]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Hepatitis C Test */}
            <View style={styles.testSection}>
              <Text style={styles.testTitle}>Viêm gan C (HCV)</Text>
              <View style={styles.testOptions}>
                {TEST_RESULT_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.testOption,
                      formData.testResults.hepatitisC === option.value && styles.testOptionSelected,
                      { borderColor: option.color }
                    ]}
                    onPress={() => updateTestResult('hepatitisC', option.value)}
                  >
                    <MaterialCommunityIcons name={option.icon} size={20} color={option.color} />
                    <Text style={[styles.testOptionText, { color: option.color }]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Syphilis Test */}
            <View style={styles.testSection}>
              <Text style={styles.testTitle}>Giang mai (Syphilis)</Text>
              <View style={styles.testOptions}>
                {TEST_RESULT_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.testOption,
                      formData.testResults.syphilis === option.value && styles.testOptionSelected,
                      { borderColor: option.color }
                    ]}
                    onPress={() => updateTestResult('syphilis', option.value)}
                  >
                    <MaterialCommunityIcons name={option.icon} size={20} color={option.color} />
                    <Text style={[styles.testOptionText, { color: option.color }]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Test Notes */}
            <View style={styles.testSection}>
              <Text style={styles.testTitle}>Ghi chú xét nghiệm</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={formData.testResults.notes}
                onChangeText={(text) => updateTestResult('notes', text)}
                placeholder="Nhập ghi chú về kết quả xét nghiệm..."
                multiline
                numberOfLines={3}
                placeholderTextColor="#A0AEC0"
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowTestModal(false)}
            >
              <Text style={styles.cancelButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

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

  const currentStatusInfo = getStatusInfo(formData.status);

  // Check if blood unit can be confirmed (all tests completed)
  const canConfirmBloodUnit = () => {
    const { hiv, hepatitisB, hepatitisC, syphilis } = formData.testResults;
    return hiv !== 'pending' && hepatitisB !== 'pending' && 
           hepatitisC !== 'pending' && syphilis !== 'pending';
  };

  const allTestsNegative = () => {
    const { hiv, hepatitisB, hepatitisC, syphilis } = formData.testResults;
    return hiv === 'negative' && hepatitisB === 'negative' && 
           hepatitisC === 'negative' && syphilis === 'negative';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cập nhật đơn vị máu</Text>
        <TouchableOpacity 
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <MaterialIcons name="save" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* Blood Unit Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="test-tube" size={24} color="#FF6B6B" />
            <Text style={styles.cardTitle}>Thông tin đơn vị máu</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mã đơn vị:</Text>
            <Text style={styles.infoValue}>{bloodUnit?.code || bloodUnit?._id?.slice(-8)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Thành phần máu:</Text>
            <Text style={styles.infoValue}>{getComponentLabel(bloodUnit?.component)}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ngày tạo:</Text>
            <Text style={styles.infoValue}>
              {bloodUnit?.createdAt ? new Date(bloodUnit.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ngày thu thập:</Text>
            <Text style={styles.infoValue}>
              {bloodUnit?.collectedAt ? new Date(bloodUnit.collectedAt).toLocaleDateString('vi-VN') : 'N/A'}
            </Text>
          </View>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="form-select" size={24} color="#FF6B6B" />
            <Text style={styles.cardTitle}>Thông tin chi tiết</Text>
          </View>

          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Thành phần máu *</Text>
            <View style={styles.componentSelector}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {BLOOD_COMPONENTS.map((component) => (
                  <TouchableOpacity
                    key={component}
                    style={[
                      styles.componentChip,
                      formData.component === component && styles.componentChipActive
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, component }))}
                  >
                    <Text style={[
                      styles.componentChipText,
                      formData.component === component && styles.componentChipTextActive
                    ]}>
                      {getComponentLabel(component)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Số lượng (ml) *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.quantity}
                onChangeText={(text) => setFormData(prev => ({ ...prev, quantity: text }))}
                placeholder="450"
                keyboardType="numeric"
                placeholderTextColor="#A0AEC0"
              />
            </View>
            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Ngày hết hạn *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.expiresAt}
                onChangeText={(text) => setFormData(prev => ({ ...prev, expiresAt: text }))}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#A0AEC0"
              />
            </View>
          </View>

          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Trạng thái *</Text>
            <TouchableOpacity
              style={styles.statusSelector}
              onPress={() => setShowStatusModal(true)}
            >
              <View style={styles.statusSelectorContent}>
                <MaterialCommunityIcons 
                  name={currentStatusInfo.icon} 
                  size={24} 
                  color={currentStatusInfo.color} 
                />
                <Text style={styles.statusSelectorText}>
                  {currentStatusInfo.label}
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#636E72" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Test Results Card */}
        <View style={styles.formCard}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="flask" size={24} color="#FF6B6B" />
            <Text style={styles.cardTitle}>Kết quả xét nghiệm</Text>
          </View>

          <TouchableOpacity
            style={styles.testResultsSelector}
            onPress={() => setShowTestModal(true)}
          >
            <View style={styles.testResultsGrid}>
              <View style={styles.testResultItem}>
                <Text style={styles.testResultLabel}>HIV:</Text>
                <View style={[styles.testResultBadge, { backgroundColor: getTestResultInfo(formData.testResults.hiv).color }]}>
                  <MaterialCommunityIcons 
                    name={getTestResultInfo(formData.testResults.hiv).icon} 
                    size={16} 
                    color="#FFF" 
                  />
                  <Text style={styles.testResultText}>
                    {getTestResultInfo(formData.testResults.hiv).label}
                  </Text>
                </View>
              </View>

              <View style={styles.testResultItem}>
                <Text style={styles.testResultLabel}>HBV:</Text>
                <View style={[styles.testResultBadge, { backgroundColor: getTestResultInfo(formData.testResults.hepatitisB).color }]}>
                  <MaterialCommunityIcons 
                    name={getTestResultInfo(formData.testResults.hepatitisB).icon} 
                    size={16} 
                    color="#FFF" 
                  />
                  <Text style={styles.testResultText}>
                    {getTestResultInfo(formData.testResults.hepatitisB).label}
                  </Text>
                </View>
              </View>

              <View style={styles.testResultItem}>
                <Text style={styles.testResultLabel}>HCV:</Text>
                <View style={[styles.testResultBadge, { backgroundColor: getTestResultInfo(formData.testResults.hepatitisC).color }]}>
                  <MaterialCommunityIcons 
                    name={getTestResultInfo(formData.testResults.hepatitisC).icon} 
                    size={16} 
                    color="#FFF" 
                  />
                  <Text style={styles.testResultText}>
                    {getTestResultInfo(formData.testResults.hepatitisC).label}
                  </Text>
                </View>
              </View>

              <View style={styles.testResultItem}>
                <Text style={styles.testResultLabel}>Syphilis:</Text>
                <View style={[styles.testResultBadge, { backgroundColor: getTestResultInfo(formData.testResults.syphilis).color }]}>
                  <MaterialCommunityIcons 
                    name={getTestResultInfo(formData.testResults.syphilis).icon} 
                    size={16} 
                    color="#FFF" 
                  />
                  <Text style={styles.testResultText}>
                    {getTestResultInfo(formData.testResults.syphilis).label}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.editTestButton}>
              <MaterialIcons name="edit" size={20} color="#FF6B6B" />
              <Text style={styles.editTestText}>Chỉnh sửa kết quả</Text>
            </View>
          </TouchableOpacity>

          {formData.testResults.notes && (
            <View style={styles.testNotesSection}>
              <Text style={styles.fieldLabel}>Ghi chú xét nghiệm:</Text>
              <Text style={styles.testNotesText}>{formData.testResults.notes}</Text>
            </View>
          )}
        </View>

        {/* Warning Card for Expiring Units */}
        {formData.expiresAt && new Date(formData.expiresAt) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && (
          <View style={styles.warningCard}>
            <MaterialCommunityIcons name="alert" size={24} color="#FF4757" />
            <View style={styles.warningContent}>
              <Text style={styles.warningTitle}>Cảnh báo hết hạn</Text>
              <Text style={styles.warningText}>
                Đơn vị máu này sắp hết hạn sử dụng. Vui lòng kiểm tra và cập nhật trạng thái phù hợp.
              </Text>
            </View>
          </View>
        )}

        {/* Confirm and Save to Inventory Card */}
        {formData.status === 'testing' && (
          <View style={styles.confirmCard}>
            <View style={styles.confirmHeader}>
              <MaterialCommunityIcons name="check-circle" size={24} color="#2ED573" />
              <Text style={styles.confirmTitle}>Xác nhận và lưu vào kho</Text>
            </View>
            
            <Text style={styles.confirmDescription}>
              Sau khi hoàn thành tất cả xét nghiệm, bạn có thể xác nhận và lưu đơn vị máu vào kho của cơ sở.
            </Text>

            {canConfirmBloodUnit() && (
              <View style={styles.testStatusSummary}>
                <Text style={styles.testStatusTitle}>Tóm tắt kết quả xét nghiệm:</Text>
                <View style={styles.testStatusGrid}>
                  <View style={[styles.testStatusItem, { backgroundColor: allTestsNegative() ? '#E8F5E8' : '#FFF2F2' }]}>
                    <MaterialCommunityIcons 
                      name={allTestsNegative() ? "check-circle" : "alert-circle"} 
                      size={20} 
                      color={allTestsNegative() ? "#2ED573" : "#FF4757"} 
                    />
                    <Text style={[styles.testStatusText, { color: allTestsNegative() ? "#2ED573" : "#FF4757" }]}>
                      {allTestsNegative() ? "Tất cả âm tính - An toàn sử dụng" : "Có kết quả dương tính - Không an toàn"}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.confirmButton,
                !canConfirmBloodUnit() && styles.confirmButtonDisabled,
                saving && styles.confirmButtonDisabled
              ]}
              onPress={handleConfirmAndSaveToInventory}
              disabled={!canConfirmBloodUnit() || saving}
            >
              <MaterialCommunityIcons 
                name={canConfirmBloodUnit() ? "check-circle" : "clock-outline"} 
                size={20} 
                color="#FFF" 
              />
              <Text style={styles.confirmButtonText}>
                {saving ? 'Đang xử lý...' : 
                 !canConfirmBloodUnit() ? 'Hoàn thành xét nghiệm trước' : 
                 'Xác nhận và lưu vào kho'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {renderStatusModal()}
      {renderTestResultModal()}
    </SafeAreaView>
  );
};

export default BloodUnitUpdateScreen;

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
  saveButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
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
  formCard: {
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
    color: '#2D3748',
    marginLeft: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#636E72',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#2D3748',
    fontWeight: '600',
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  formField: {
    flex: 1,
    marginHorizontal: 4,
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 8,
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
  componentSelector: {
    marginBottom: 8,
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
  statusSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statusSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusSelectorText: {
    fontSize: 16,
    color: '#2D3748',
    marginLeft: 12,
    fontWeight: '500',
  },
  testResultsSelector: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  testResultsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  testResultItem: {
    width: '48%',
    marginBottom: 12,
  },
  testResultLabel: {
    fontSize: 14,
    color: '#636E72',
    fontWeight: '500',
    marginBottom: 6,
  },
  testResultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  testResultText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  editTestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  editTestText: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '600',
    marginLeft: 6,
  },
  testNotesSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  testNotesText: {
    fontSize: 14,
    color: '#2D3748',
    lineHeight: 20,
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  warningCard: {
    backgroundColor: '#FFEAEA',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#FF4757',
  },
  warningContent: {
    flex: 1,
    marginLeft: 12,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF4757',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 14,
    color: '#FF4757',
    lineHeight: 20,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  statusOptions: {
    padding: 20,
    maxHeight: 400,
  },
  statusOption: {
    borderWidth: 2,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    marginBottom: 16,
  },
  statusOptionSelected: {
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
  },
  statusOptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  statusOptionDesc: {
    fontSize: 13,
    color: '#636E72',
    textAlign: 'center',
    lineHeight: 18,
  },
  testModalBody: {
    padding: 20,
    maxHeight: 500,
  },
  testSection: {
    marginBottom: 24,
  },
  testTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 12,
  },
  testOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  testOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 2,
    backgroundColor: '#F8F9FA',
  },
  testOptionSelected: {
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
  },
  testOptionText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  cancelButton: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#636E72',
    fontWeight: '600',
  },
  confirmCard: {
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
  confirmHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2ED573',
    marginLeft: 12,
  },
  confirmDescription: {
    fontSize: 14,
    color: '#636E72',
    lineHeight: 20,
    marginBottom: 16,
  },
  testStatusSummary: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  testStatusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 12,
  },
  testStatusGrid: {
    marginBottom: 8,
  },
  testStatusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  testStatusText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  confirmButton: {
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
  confirmButtonDisabled: {
    backgroundColor: '#95A5A6',
    opacity: 0.6,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
}); 