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
  Animated,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { BLOOD_COMPONENT } from '@/constants/bloodComponents';
import { 
  BLOOD_UNIT_STATUS_OPTIONS, 
  TEST_RESULT_OPTIONS,
  getStatusInfo,
  getTestResultInfo 
} from '@/constants/bloodUnitStatus';
import bloodUnitAPI from '@/apis/bloodUnit';
import bloodInventoryAPI from '@/apis/bloodInventoryAPI';
import { toast } from 'sonner-native';

const { width: screenWidth } = Dimensions.get('window');

const BloodUnitUpdateScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { bloodUnitId, donationId } = route.params || {};

  // Validate required params
  if (!bloodUnitId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={48} color="#FF4757" />
          <Text style={styles.errorText}>Thiếu thông tin đơn vị máu</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bloodUnit, setBloodUnit] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const fadeAnim = new Animated.Value(1);

  // Form state - chỉ các field được phép cập nhật theo backend service
  const [formData, setFormData] = useState({
    quantity: '',
    expiresAt: new Date(),
    status: 'testing',
    testResults: {
      hiv: 'pending',
      hepatitisB: 'pending',
      hepatitisC: 'pending',
      syphilis: 'pending',
      notes: ''
    }
  });

  // Animation cho smooth transitions
  useEffect(() => {
    // Animation will be triggered when bloodUnit is loaded
  }, []);

  // Trigger animation when bloodUnit data is loaded
  useEffect(() => {
    if (bloodUnit) {
      // Simple fade-in animation when data loads
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [bloodUnit]);

  useEffect(() => {
  }, [formData]);

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
      
      const response = await bloodUnitAPI.HandleBloodUnit(
        `/${bloodUnitId}`,
        null,
        'get'
      );
      
      
      // Check different possible response structures
      let bloodUnitData = null;
      if (response?.data?.data) {
        // If the response is wrapped in a data object
        bloodUnitData = response.data.data;
      } else if (response?.data) {
        // If the response data is directly in response.data
        bloodUnitData = response.data;
      } else {
        throw new Error("No data found in response");
      }
      
      if (bloodUnitData) {
        setBloodUnit(bloodUnitData);
        
        // Chỉ set các field được phép cập nhật
        const newFormData = {
          quantity: bloodUnitData.quantity?.toString() || '',
          expiresAt: bloodUnitData.expiresAt ? new Date(bloodUnitData.expiresAt) : new Date(),
          status: bloodUnitData.status || 'testing',
          testResults: {
            hiv: bloodUnitData.testResults?.hiv || 'pending',
            hepatitisB: bloodUnitData.testResults?.hepatitisB || 'pending',
            hepatitisC: bloodUnitData.testResults?.hepatitisC || 'pending',
            syphilis: bloodUnitData.testResults?.syphilis || 'pending',
            notes: bloodUnitData.testResults?.notes || ''
          }
        };
        
        setFormData(newFormData);
      } else {
        throw new Error("Blood unit data is null or undefined");
      }
    } catch (error) {
      console.error('❌ Error fetching blood unit detail:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      Alert.alert(
        'Lỗi', 
        `Không thể tải thông tin đơn vị máu: ${error.message || 'Unknown error'}\n\nVui lòng kiểm tra kết nối mạng và thử lại.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // Enhanced validation
      if (!formData.quantity || !formData.expiresAt || !formData.status) {
        Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
      }

      const quantity = parseFloat(formData.quantity);
      if (isNaN(quantity) || quantity <= 0) {
        Alert.alert('Lỗi', 'Số lượng phải là số dương');
        return;
      }

      // Kiểm tra ngày hết hạn không được là quá khứ
      if (formData.expiresAt <= new Date()) {
        Alert.alert('Lỗi', 'Ngày hết hạn phải lớn hơn ngày hiện tại');
        return;
      }

      setSaving(true);

      // Chỉ gửi các field được phép cập nhật theo backend service
      const updateData = {
        quantity: quantity,
        expiresAt: formData.expiresAt.toISOString(),
        status: formData.status,
        testResults: formData.testResults,
        notes: formData.testResults.notes
      };

      const response = await bloodUnitAPI.HandleBloodUnit(
        `/${bloodUnitId}`,
        updateData,
        'patch'
      );

      if (response.data) {
        toast.success('✅ Cập nhật đơn vị máu thành công!');
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

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData(prev => ({ ...prev, expiresAt: selectedDate }));
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
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
            {BLOOD_UNIT_STATUS_OPTIONS.map((option) => (
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
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Đang tải...</Text>
          <View style={styles.saveButton} />
        </View>
        <View style={styles.loadingContainer}>
          <Animated.View style={{ transform: [{ rotate: '0deg' }] }}>
            <MaterialCommunityIcons name="loading" size={48} color="#FF6B6B" />
          </Animated.View>
          <Text style={styles.loadingText}>Đang tải thông tin đơn vị máu...</Text>
          <Text style={styles.loadingSubText}>ID: {bloodUnitId}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Check if bloodUnit data is loaded
  if (!bloodUnit) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lỗi tải dữ liệu</Text>
          <View style={styles.saveButton} />
        </View>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#FF4757" />
          <Text style={styles.errorTitle}>Không thể tải dữ liệu</Text>
          <Text style={styles.errorText}>
            Không tìm thấy thông tin đơn vị máu với ID: {bloodUnitId}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchBloodUnitDetail}
          >
            <MaterialCommunityIcons name="refresh" size={20} color="#FFFFFF" />
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
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

  // Custom Date Picker Component
  const CustomDatePicker = () => {
    const [tempDate, setTempDate] = useState(formData.expiresAt);
    const currentYear = new Date().getFullYear();
    const years = Array.from({length: 10}, (_, i) => currentYear + i);
    const months = Array.from({length: 12}, (_, i) => i + 1);
    const getDaysInMonth = (year, month) => new Date(year, month, 0).getDate();
    const days = Array.from({length: getDaysInMonth(tempDate.getFullYear(), tempDate.getMonth() + 1)}, (_, i) => i + 1);

    const handleConfirmDate = () => {
      setFormData(prev => ({ ...prev, expiresAt: tempDate }));
      setShowDatePicker(false);
    };

    return (
      <Modal
        transparent={true}
        animationType="slide"
        visible={showDatePicker}
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.dateModalOverlay}>
          <View style={styles.dateModalContent}>
            <View style={styles.dateModalHeader}>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={styles.dateModalCancel}>Hủy</Text>
              </TouchableOpacity>
              <Text style={styles.dateModalTitle}>Chọn ngày hết hạn</Text>
              <TouchableOpacity onPress={handleConfirmDate}>
                <Text style={styles.dateModalDone}>Xong</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.datePickerBody}>
              <View style={styles.datePickerColumns}>
                {/* Day Column */}
                <View style={styles.dateColumn}>
                  <Text style={styles.columnTitle}>Ngày</Text>
                  <ScrollView style={styles.dateScrollView} showsVerticalScrollIndicator={false}>
                    {days.map(day => (
                      <TouchableOpacity
                        key={day}
                        style={[
                          styles.dateItem,
                          tempDate.getDate() === day && styles.selectedDateItem
                        ]}
                        onPress={() => {
                          const newDate = new Date(tempDate);
                          newDate.setDate(day);
                          setTempDate(newDate);
                        }}
                      >
                        <Text style={[
                          styles.dateItemText,
                          tempDate.getDate() === day && styles.selectedDateText
                        ]}>
                          {day.toString().padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Month Column */}
                <View style={styles.dateColumn}>
                  <Text style={styles.columnTitle}>Tháng</Text>
                  <ScrollView style={styles.dateScrollView} showsVerticalScrollIndicator={false}>
                    {months.map(month => (
                      <TouchableOpacity
                        key={month}
                        style={[
                          styles.dateItem,
                          tempDate.getMonth() + 1 === month && styles.selectedDateItem
                        ]}
                        onPress={() => {
                          const newDate = new Date(tempDate);
                          newDate.setMonth(month - 1);
                          setTempDate(newDate);
                        }}
                      >
                        <Text style={[
                          styles.dateItemText,
                          tempDate.getMonth() + 1 === month && styles.selectedDateText
                        ]}>
                          {month.toString().padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Year Column */}
                <View style={styles.dateColumn}>
                  <Text style={styles.columnTitle}>Năm</Text>
                  <ScrollView style={styles.dateScrollView} showsVerticalScrollIndicator={false}>
                    {years.map(year => (
                      <TouchableOpacity
                        key={year}
                        style={[
                          styles.dateItem,
                          tempDate.getFullYear() === year && styles.selectedDateItem
                        ]}
                        onPress={() => {
                          const newDate = new Date(tempDate);
                          newDate.setFullYear(year);
                          setTempDate(newDate);
                        }}
                      >
                        <Text style={[
                          styles.dateItemText,
                          tempDate.getFullYear() === year && styles.selectedDateText
                        ]}>
                          {year}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    );
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

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Compact Blood Unit Card - Combined Info & Form */}
        <Animated.View style={[styles.compactCard, { opacity: fadeAnim }]}>
          {/* Basic Info Section */}
          <View style={styles.compactHeader}>
            <MaterialCommunityIcons name="test-tube" size={20} color="#FF6B6B" />
            <Text style={styles.compactTitle}>Thông tin đơn vị máu</Text>
          </View>
          
          <View style={styles.infoRowContainer}>
            <View style={styles.infoRowItem}>
              <Text style={styles.compactLabel}>Mã đơn vị</Text>
              <Text style={styles.compactValue}>
                {bloodUnit?.code || bloodUnit?._id?.slice(-8) || 'Đang tải...'}
              </Text>
            </View>
            <View style={styles.infoRowItem}>
              <Text style={styles.compactLabel}>Thành phần</Text>
              <Text style={styles.compactValue}>
                {bloodUnit?.component ? getComponentLabel(bloodUnit.component) : 'Đang tải...'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRowContainer}>
            <View style={styles.infoRowItem}>
              <Text style={styles.compactLabel}>Ngày tạo</Text>
              <Text style={styles.compactValue}>
                {bloodUnit?.createdAt ? new Date(bloodUnit.createdAt).toLocaleDateString('vi-VN') : 'Đang tải...'}
              </Text>
            </View>
            <View style={styles.infoRowItem}>
              <Text style={styles.compactLabel}>Ngày thu thập</Text>
              <Text style={styles.compactValue}>
                {bloodUnit?.collectedAt ? new Date(bloodUnit.collectedAt).toLocaleDateString('vi-VN') : 'Đang tải...'}
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Editable Fields Section */}
          <View style={styles.compactHeader}>
            <MaterialCommunityIcons name="form-select" size={20} color="#FF6B6B" />
            <Text style={styles.compactTitle}>Chỉnh sửa</Text>
          </View>

          {/* Quantity & Expiry Date in Row */}
          <View style={styles.formRowContainer}>
            <View style={styles.halfField}>
              <Text style={styles.compactFieldLabel}>Số lượng (ml) *</Text>
              <View style={styles.compactInputContainer}>
                <TextInput
                  style={styles.compactTextInput}
                  value={formData.quantity}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, quantity: text }))}
                  placeholder="450"
                  keyboardType="numeric"
                  placeholderTextColor="#A0AEC0"
                />
                <Text style={styles.unitText}>ml</Text>
              </View>
            </View>

            <View style={styles.halfField}>
              <Text style={styles.compactFieldLabel}>Ngày hết hạn *</Text>
              <TouchableOpacity
                style={styles.compactDatePicker}
                onPress={() => setShowDatePicker(true)}
              >
                <View style={styles.compactDateContent}>
                  <Text style={styles.compactDateText}>
                    {formatDate(formData.expiresAt)}
                  </Text>
                  <MaterialIcons name="keyboard-arrow-down" size={18} color="#636E72" />
                </View>
              </TouchableOpacity>
              
              {/* Compact Expiry Indicator */}
              {(() => {
                const today = new Date();
                const expiryDate = new Date(formData.expiresAt);
                const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
                
                if (daysUntilExpiry <= 0) {
                  return <Text style={styles.compactExpiredText}>Đã hết hạn</Text>;
                } else if (daysUntilExpiry <= 7) {
                  return <Text style={styles.compactExpiringSoonText}>Còn {daysUntilExpiry} ngày</Text>;
                } else {
                  return <Text style={styles.compactValidText}>Còn {daysUntilExpiry} ngày</Text>;
                }
              })()}
            </View>
          </View>

          {/* Status Field */}
          <View style={styles.compactField}>
            <Text style={styles.compactFieldLabel}>Trạng thái *</Text>
            <TouchableOpacity
              style={styles.compactStatusSelector}
              onPress={() => setShowStatusModal(true)}
            >
              <View style={styles.compactStatusContent}>
                <MaterialCommunityIcons 
                  name={getStatusInfo(formData.status).icon} 
                  size={20} 
                  color={getStatusInfo(formData.status).color} 
                />
                <Text style={styles.compactStatusText}>
                  {getStatusInfo(formData.status).label}
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color="#636E72" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Compact Test Results Card */}
        <Animated.View style={[styles.compactCard, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={styles.testResultsHeader}
            onPress={() => setShowTestModal(true)}
          >
            <View style={styles.compactHeader}>
              <MaterialCommunityIcons name="flask" size={20} color="#FF6B6B" />
              <Text style={styles.compactTitle}>Kết quả xét nghiệm</Text>
            </View>
            <MaterialIcons name="edit" size={18} color="#FF6B6B" />
          </TouchableOpacity>

          <View style={styles.compactTestGrid}>
            {['hiv', 'hepatitisB', 'hepatitisC', 'syphilis'].map((test, index) => {
              const labels = { hiv: 'HIV', hepatitisB: 'HBV', hepatitisC: 'HCV', syphilis: 'Syphilis' };
              const result = formData.testResults[test];
              const resultInfo = getTestResultInfo(result);
              
              return (
                <View key={test} style={styles.compactTestItem}>
                  <Text style={styles.compactTestLabel}>{labels[test]}:</Text>
                  <View style={[styles.compactTestBadge, { backgroundColor: resultInfo.color }]}>
                    <MaterialCommunityIcons 
                      name={resultInfo.icon} 
                      size={12} 
                      color="#FFF" 
                    />
                    <Text style={styles.compactTestText}>{resultInfo.label}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          {formData.testResults.notes && (
            <Text style={styles.compactNotes}>
              Ghi chú: {formData.testResults.notes}
            </Text>
          )}
        </Animated.View>

        {/* Compact Confirm Card */}
        {formData.status === 'testing' && (
          <Animated.View style={[styles.compactConfirmCard, { opacity: fadeAnim }]}>
            <View style={styles.compactHeader}>
              <MaterialCommunityIcons name="check-circle" size={20} color="#2ED573" />
              <Text style={styles.compactTitle}>Xác nhận và lưu vào kho</Text>
            </View>
            
            <TouchableOpacity
              style={[
                styles.compactConfirmButton,
                !canConfirmBloodUnit() && styles.compactConfirmButtonDisabled,
                saving && styles.compactConfirmButtonDisabled
              ]}
              onPress={handleConfirmAndSaveToInventory}
              disabled={!canConfirmBloodUnit() || saving}
            >
              <MaterialCommunityIcons 
                name={canConfirmBloodUnit() ? "check-circle" : "clock-outline"} 
                size={18} 
                color="#FFF" 
              />
              <Text style={styles.compactConfirmButtonText}>
                {saving ? 'Đang xử lý...' : 
                 !canConfirmBloodUnit() ? 'Hoàn thành xét nghiệm trước' : 
                 'Xác nhận và lưu vào kho'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>

      {renderStatusModal()}
      {renderTestResultModal()}

      {/* Enhanced Date Picker Modal */}
      <CustomDatePicker />
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
  loadingSubText: {
    fontSize: 14,
    color: '#A0AEC0',
    marginTop: 4,
    fontFamily: 'monospace',
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
  infoGrid: {
    flexDirection: 'column',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  infoTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: '#636E72',
    fontWeight: '500',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  inputIcon: {
    marginRight: 12,
  },
  enhancedTextInput: {
    flex: 1,
    fontSize: 16,
    color: '#2D3748',
  },
  unitText: {
    fontSize: 14,
    color: '#636E72',
    fontWeight: '500',
    marginLeft: 8,
  },
  datePickerContainer: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  datePickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  datePickerText: {
    fontSize: 16,
    color: '#2D3748',
    fontWeight: '500',
    marginLeft: 8,
  },
  expiryIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  expiryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  expiredBadge: {
    backgroundColor: '#FFE8E8',
  },
  expiredText: {
    fontSize: 12,
    color: '#FF4757',
    fontWeight: '600',
    marginLeft: 4,
  },
  expiringSoonBadge: {
    backgroundColor: '#FFF4E6',
  },
  expiringSoonText: {
    fontSize: 12,
    color: '#FFA502',
    fontWeight: '600',
    marginLeft: 4,
  },
  validBadge: {
    backgroundColor: '#E8F5E8',
  },
  validText: {
    fontSize: 12,
    color: '#2ED573',
    fontWeight: '600',
    marginLeft: 4,
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
    fontWeight: '600',
    marginBottom: 2,
  },
  statusDescription: {
    fontSize: 13,
    color: '#636E72',
    lineHeight: 18,
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
  dateModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  dateModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  dateModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  dateModalCancel: {
    fontSize: 16,
    color: '#636E72',
    fontWeight: '600',
  },
  dateModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  dateModalDone: {
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  datePickerBody: {
    padding: 20,
  },
  datePickerColumns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  dateColumn: {
    flex: 1,
    alignItems: 'center',
  },
  columnTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 12,
    textAlign: 'center',
  },
  dateScrollView: {
    maxHeight: 200,
    width: '100%',
  },
  dateItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginVertical: 2,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
  },
  selectedDateItem: {
    backgroundColor: '#FF6B6B',
  },
  dateItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    textAlign: 'center',
  },
  selectedDateText: {
    color: '#FFFFFF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF4757',
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF4757',
    marginBottom: 4,
  },
  retryButton: {
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
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  debugCard: {
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
  debugTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 12,
  },
  debugText: {
    fontSize: 14,
    color: '#636E72',
    marginBottom: 8,
  },
  compactCard: {
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
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  compactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginLeft: 12,
  },
  infoRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  infoRowItem: {
    flex: 1,
  },
  compactLabel: {
    fontSize: 14,
    color: '#636E72',
    fontWeight: '500',
    marginBottom: 2,
  },
  compactValue: {
    fontSize: 15,
    color: '#2D3748',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 16,
  },
  formRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  halfField: {
    flex: 1,
    marginHorizontal: 4,
  },
  compactInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 3,
    backgroundColor: '#FFFFFF',
  },
  compactTextInput: {
    flex: 1,
    fontSize: 16,
    color: '#2D3748',
  },
  compactDatePicker: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  compactDateContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  compactDateText: {
    fontSize: 16,
    color: '#2D3748',
    fontWeight: '500',
    marginLeft: 8,
  },
  compactExpiredText: {
    fontSize: 12,
    color: '#FF4757',
    fontWeight: '600',
    marginLeft: 4,
  },
  compactExpiringSoonText: {
    fontSize: 12,
    color: '#FFA502',
    fontWeight: '600',
    marginLeft: 4,
  },
  compactValidText: {
    fontSize: 12,
    color: '#2ED573',
    fontWeight: '600',
    marginLeft: 4,
  },
  compactField: {
    marginBottom: 16,
  },
  compactFieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 8,
  },
  compactStatusSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  compactStatusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  compactStatusText: {
    fontSize: 15,
    color: '#2D3748',
    fontWeight: '600',
    marginLeft: 8,
  },
  testResultsHeader: {
    marginBottom: 16,
  },
  compactTestGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  compactTestItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  compactTestLabel: {
    fontSize: 13,
    color: '#636E72',
    fontWeight: '500',
  },
  compactTestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  compactTestText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  compactNotes: {
    fontSize: 13,
    color: '#636E72',
    fontStyle: 'italic',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  compactConfirmCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: '#2ED573',
  },
  compactConfirmButton: {
    backgroundColor: '#2ED573',
    borderRadius: 12,
    paddingVertical: 14,
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
  compactConfirmButtonDisabled: {
    backgroundColor: '#95A5A6',
    opacity: 0.6,
  },
  compactConfirmButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 8,
  },
}); 