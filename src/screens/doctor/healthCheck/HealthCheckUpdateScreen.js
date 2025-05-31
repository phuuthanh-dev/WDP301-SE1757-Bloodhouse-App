import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  Platform,
  Image,
  Modal,
  Switch,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import healthCheckAPI from '@/apis/healthCheckAPI';
import { toast } from 'sonner-native';
import { formatBloodPressure } from '@/utils/formatHelpers';

const HealthCheckUpdateScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { healthCheckId, registrationId } = route.params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [healthCheckData, setHealthCheckData] = useState(null);
  const [registrationData, setRegistrationData] = useState(null);
  const [showEligibilityModal, setShowEligibilityModal] = useState(false);

  
  // Form state
  const [formData, setFormData] = useState({
    bloodPressure: '',
    hemoglobin: '',
    weight: '',
    pulse: '',
    temperature: '',
    generalCondition: '',
    isEligible: null,
    deferralReason: '',
    notes: '',
  });


  useEffect(() => {
    fetchHealthCheckDetail();
  }, [healthCheckId, registrationId]);

  const fetchHealthCheckDetail = async () => {
    try {
      setLoading(true);
      
      if (healthCheckId) {
        // Fetch existing health check using real API
        const response = await healthCheckAPI.HandleHealthCheck(
          `/${healthCheckId}`,
          null,
          'get'
        );
        
        if (response.data) {
          setHealthCheckData(response.data);
          setFormData({
            bloodPressure: response.data.bloodPressure || '',
            hemoglobin: response.data.hemoglobin?.toString() || '',
            weight: response.data.weight?.toString() || '',
            pulse: response.data.pulse?.toString() || '',
            temperature: response.data.temperature?.toString() || '',
            generalCondition: response.data.generalCondition || '',
            isEligible: response.data.isEligible,
            deferralReason: response.data.deferralReason || '',
            notes: response.data.notes || '',
          });
        }
      } else if (registrationId) {
        // Fetch registration data for new health check using real API
        const response = await healthCheckAPI.HandleHealthCheck(
          `/registration/${registrationId}`,
          null,
          'get'
        );
        
        if (response.data) {
          setRegistrationData(response.data.registration);
          setHealthCheckData(response.data.healthCheck);
          
          if (response.data.healthCheck) {
            setFormData({
              bloodPressure: response.data.healthCheck.bloodPressure || '',
              hemoglobin: response.data.healthCheck.hemoglobin?.toString() || '',
              weight: response.data.healthCheck.weight?.toString() || '',
              pulse: response.data.healthCheck.pulse?.toString() || '',
              temperature: response.data.healthCheck.temperature?.toString() || '',
              generalCondition: response.data.healthCheck.generalCondition || '',
              isEligible: response.data.healthCheck.isEligible,
              deferralReason: response.data.healthCheck.deferralReason || '',
              notes: response.data.healthCheck.notes || '',
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching health check detail:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin khám sức khỏe');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const {
        bloodPressure,
        hemoglobin,
        weight,
        pulse,
        temperature,
        generalCondition,
        isEligible,
        deferralReason,
        notes,
      } = formData;
  
      // Kiểm tra trường bắt buộc
      if (!bloodPressure || !hemoglobin || !weight || !pulse || !temperature || !generalCondition) {
        Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin khám sức khỏe');
        return;
      }

      // Validate huyết áp
      const bpMatch = formatBloodPressure(bloodPressure);

      if (!bpMatch) {
        Alert.alert('Lỗi', 'Huyết áp phải có định dạng "120/80" hoặc "120/80 mmHg"');
        return;
      }

      const systolic = parseInt(bpMatch.split('/')[0]);
      const diastolic = parseInt(bpMatch.split('/')[1]);

      if (systolic < 90 || systolic > 180) {
        Alert.alert('Lỗi', 'Chỉ số huyết áp tâm thu (số đầu) phải từ 90 đến 180 mmHg');
        return;
      }

      if (diastolic < 60 || diastolic > 120) {
        Alert.alert('Lỗi', 'Chỉ số huyết áp tâm trương (số sau) phải từ 60 đến 120 mmHg');
        return;
      }
  
      // Validate từng trường theo schema:
      const hb = parseFloat(hemoglobin);
      if (hb < 10 || hb > 20) {
        Alert.alert('Lỗi', 'Nồng độ hemoglobin phải từ 10 đến 20 g/dL');
        return;
      }
  
      const wt = parseFloat(weight);
      if (wt < 40 || wt > 150) {
        Alert.alert('Lỗi', 'Cân nặng phải từ 40 đến 150 kg');
        return;
      }
  
      const pl = parseInt(pulse);
      if (pl < 50 || pl > 120) {
        Alert.alert('Lỗi', 'Nhịp tim phải từ 50 đến 120 bpm');
        return;
      }
  
      const temp = parseFloat(temperature);
      if (temp < 35 || temp > 38) {
        Alert.alert('Lỗi', 'Nhiệt độ cơ thể phải từ 35 đến 38°C');
        return;
      }
  
      // Nếu không đủ điều kiện thì bắt buộc nhập lý do
      if (isEligible === false && !deferralReason.trim()) {
        Alert.alert('Lỗi', 'Vui lòng nhập lý do không đủ điều kiện');
        return;
      }


  
      setSaving(true);
  
      const updateData = {
        bloodPressure,
        hemoglobin: hb,
        weight: wt,
        pulse: pl,
        temperature: temp,
        generalCondition,
        isEligible,
        deferralReason: isEligible === false ? deferralReason : null,
        notes,
      };
  
      const targetId = healthCheckData?._id || healthCheckId;
      const response = await healthCheckAPI.HandleHealthCheck(
        `/${targetId}`,
        updateData,
        'patch'
      );
  
      if (response.data) {
        toast.success('Cập nhật thông tin khám sức khỏe thành công!');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error updating health check:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật';
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const renderEligibilityModal = () => (
    <Modal
      visible={showEligibilityModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowEligibilityModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Đánh giá tình trạng sức khỏe</Text>
            <TouchableOpacity onPress={() => setShowEligibilityModal(false)}>
              <MaterialIcons name="close" size={24} color="#636E72" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.eligibilityOptions}>
            <TouchableOpacity
              style={[
                styles.eligibilityOption,
                formData.isEligible === true && styles.eligibilityOptionSelected,
                { borderColor: '#2ED573' }
              ]}
              onPress={() => {
                setFormData(prev => ({ ...prev, isEligible: true, deferralReason: '' }));
                setShowEligibilityModal(false);
              }}
            >
              <MaterialCommunityIcons name="check-circle" size={32} color="#2ED573" />
              <Text style={[styles.eligibilityOptionTitle, { color: '#2ED573' }]}>
                Đủ điều kiện hiến máu
              </Text>
              <Text style={styles.eligibilityOptionDesc}>
                Người hiến có đủ sức khỏe để tiến hành hiến máu
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.eligibilityOption,
                formData.isEligible === false && styles.eligibilityOptionSelected,
                { borderColor: '#FF4757' }
              ]}
              onPress={() => {
                setFormData(prev => ({ ...prev, isEligible: false }));
                setShowEligibilityModal(false);
              }}
            >
              <MaterialCommunityIcons name="close-circle" size={32} color="#FF4757" />
              <Text style={[styles.eligibilityOptionTitle, { color: '#FF4757' }]}>
                Không đủ điều kiện
              </Text>
              <Text style={styles.eligibilityOptionDesc}>
                Người hiến cần hoãn hiến máu do vấn đề sức khỏe
              </Text>
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

  const patientData = healthCheckData?.userId || registrationData?.userId;
  const bloodGroup = healthCheckData?.registrationId?.bloodGroupId || registrationData?.bloodGroupId;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Khám Sức Khỏe</Text>
          <Text style={styles.headerCode}>{healthCheckData?.code}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <MaterialIcons name="save" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* Patient Info Card */}
        <View style={styles.patientCard}>
          <View style={styles.patientHeader}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ 
                  uri: patientData?.avatar || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 10)}`
                }}
                style={styles.avatar}
              />
              <View style={styles.bloodTypeBadge}>
                <Text style={styles.bloodTypeText}>
                  {bloodGroup?.name || bloodGroup?.type || 'N/A'}
                </Text>
              </View>
            </View>
            <View style={styles.patientInfo}>
              <Text style={styles.patientName}>{patientData?.fullName || 'N/A'}</Text>
              <Text style={styles.patientDetail}>
                {patientData?.sex === 'male' ? 'Nam' : patientData?.sex === 'female' ? 'Nữ' : 'N/A'} • 
                {patientData?.yob ? new Date().getFullYear() - new Date(patientData.yob).getFullYear() : 'N/A'} tuổi
              </Text>
              <Text style={styles.patientDetail}>{patientData?.phone || 'N/A'}</Text>
            </View>
          </View>
        </View>

        {/* Vital Signs Form */}
        <View style={styles.formCard}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="heart-pulse" size={24} color="#FF6B6B" />
            <Text style={styles.cardTitle}>Chỉ số sinh hiệu</Text>
          </View>

          <View style={styles.formRow}>
            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Huyết áp (mmHg) *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.bloodPressure}
                onChangeText={(text) => setFormData(prev => ({ ...prev, bloodPressure: text }))}
                placeholder="120/80"
                placeholderTextColor="#A0AEC0"
              />
            </View>
            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Hemoglobin (g/dL) *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.hemoglobin}
                onChangeText={(text) => setFormData(prev => ({ ...prev, hemoglobin: text }))}
                placeholder="12.5"
                keyboardType="numeric"
                placeholderTextColor="#A0AEC0"
              />
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Cân nặng (kg) *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.weight}
                onChangeText={(text) => setFormData(prev => ({ ...prev, weight: text }))}
                placeholder="65"
                keyboardType="numeric"
                placeholderTextColor="#A0AEC0"
              />
            </View>
            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Nhịp tim (bpm) *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.pulse}
                onChangeText={(text) => setFormData(prev => ({ ...prev, pulse: text }))}
                placeholder="72"
                keyboardType="numeric"
                placeholderTextColor="#A0AEC0"
              />
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Nhiệt độ (°C) *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.temperature}
                onChangeText={(text) => setFormData(prev => ({ ...prev, temperature: text }))}
                placeholder="36.5"
                keyboardType="numeric"
                placeholderTextColor="#A0AEC0"
              />
            </View>
            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Tình trạng chung *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.generalCondition}
                onChangeText={(text) => setFormData(prev => ({ ...prev, generalCondition: text }))}
                placeholder="Tốt"
                placeholderTextColor="#A0AEC0"
              />
            </View>
          </View>
        </View>

        {/* Eligibility Assessment */}
        <View style={styles.formCard}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="clipboard-check" size={24} color="#FF6B6B" />
            <Text style={styles.cardTitle}>Đánh giá tình trạng</Text>
          </View>

          <TouchableOpacity
            style={styles.eligibilitySelector}
            onPress={() => setShowEligibilityModal(true)}
          >
            <View style={styles.eligibilitySelectorContent}>
              <MaterialCommunityIcons 
                name={
                  formData.isEligible === true ? 'check-circle' :
                  formData.isEligible === false ? 'close-circle' : 'help-circle'
                } 
                size={24} 
                color={
                  formData.isEligible === true ? '#2ED573' :
                  formData.isEligible === false ? '#FF4757' : '#95A5A6'
                } 
              />
              <Text style={styles.eligibilitySelectorText}>
                {formData.isEligible === true ? 'Đủ điều kiện hiến máu' :
                 formData.isEligible === false ? 'Không đủ điều kiện' : 'Chọn tình trạng sức khỏe'}
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#636E72" />
          </TouchableOpacity>

          {formData.isEligible === false && (
            <View style={styles.deferralSection}>
              <Text style={styles.fieldLabel}>Lý do không đủ điều kiện *</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={formData.deferralReason}
                onChangeText={(text) => setFormData(prev => ({ ...prev, deferralReason: text }))}
                placeholder="Nhập lý do cụ thể..."
                multiline
                numberOfLines={3}
                placeholderTextColor="#A0AEC0"
              />
            </View>
          )}

          <View style={styles.notesSection}>
            <Text style={styles.fieldLabel}>Ghi chú bác sĩ</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.notes}
              onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
              placeholder="Ghi chú thêm về tình trạng sức khỏe..."
              multiline
              numberOfLines={3}
              placeholderTextColor="#A0AEC0"
            />
          </View>
        </View>
      </ScrollView>

      {renderEligibilityModal()}
    </SafeAreaView>
  );
};

export default HealthCheckUpdateScreen;

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
  headerTitleContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  headerCode: {
    fontSize: 16,
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
  patientCard: {
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
  patientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#FF6B6B',
  },
  bloodTypeBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  bloodTypeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 4,
  },
  patientDetail: {
    fontSize: 14,
    color: '#636E72',
    marginBottom: 2,
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
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  formField: {
    flex: 1,
    marginHorizontal: 4,
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
  eligibilitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  eligibilitySelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  eligibilitySelectorText: {
    fontSize: 16,
    color: '#2D3748',
    marginLeft: 12,
    fontWeight: '500',
  },
  deferralSection: {
    marginBottom: 16,
  },
  notesSection: {
    marginTop: 8,
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
    padding: 24,
    width: '100%',
    maxWidth: 400,
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
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  eligibilityOptions: {
    gap: 16,
  },
  eligibilityOption: {
    borderWidth: 2,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  eligibilityOptionSelected: {
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
  },
  eligibilityOptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  eligibilityOptionDesc: {
    fontSize: 14,
    color: '#636E72',
    textAlign: 'center',
    lineHeight: 20,
  },
}); 