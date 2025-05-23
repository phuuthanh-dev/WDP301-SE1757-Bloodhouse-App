import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Alert,
  Image,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

// Mock data (will be replaced with actual API data)
const MOCK_DONATION_DATA = {
  id: "DON001",
  registrationId: "REG123456",
  healthCheckId: "HC001",
  donor: {
    name: "Nguyễn Văn A",
    avatar: "https://i.pravatar.cc/150?img=1",
    bloodType: "A+",
    gender: "Nam",
    dob: "01/01/1990",
    phone: "0901234567",
  },
  nurse: {
    name: "Y tá Lê Thị C",
  },
  bloodGroup: {
    id: "BG001",
    type: "A+",
  },
  bloodComponent: "Whole Blood", // WHOLE_BLOOD, PLASMA, PLATELETS, RED_BLOOD_CELLS
  startTime: "2024-06-01T10:00:00Z",
  status: "in_progress", // CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, ADVERSE_EVENT
  quantity: 300, // ml hiện tại
  targetQuantity: 450, // ml mục tiêu
  bloodBag: {
    id: "BAG001",
    type: "Whole Blood",
  },
  vitalSigns: {
    bloodPressure: "120/80",
    pulse: 75,
    temperature: 36.5,
  },
  notes: "Quá trình hiến máu diễn ra bình thường",
  donorStatusLogs: [
    {
      id: "LOG001",
      status: "STABLE", // STABLE, MILD_REACTION, SEVERE_REACTION, EMERGENCY
      phase: "DONATION", // DONATION, RESTING, POST_REST_CHECK
      notes: "Người hiến cảm thấy tốt",
      recordedAt: "2024-06-01T10:15:00Z",
    }
  ]
};

const DonationCreateFormScreen = ({ navigation, route }) => {
  const { donationId, mode } = route?.params || {};
  const [donationData, setDonationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form states
  const [currentQuantity, setCurrentQuantity] = useState('');
  const [bloodPressure, setBloodPressure] = useState('');
  const [pulse, setPulse] = useState('');
  const [temperature, setTemperature] = useState('');
  const [notes, setNotes] = useState('');
  const [donorStatus, setDonorStatus] = useState('STABLE');
  const [hasAdverseEvent, setHasAdverseEvent] = useState(false);

  useEffect(() => {
    const fetchDonationData = async () => {
      try {
        // TODO: Fetch actual data from API
        setDonationData(MOCK_DONATION_DATA);
        
        // Pre-fill form with existing data
        if (mode === 'update') {
          setCurrentQuantity(MOCK_DONATION_DATA.quantity.toString());
          setBloodPressure(MOCK_DONATION_DATA.vitalSigns.bloodPressure);
          setPulse(MOCK_DONATION_DATA.vitalSigns.pulse.toString());
          setTemperature(MOCK_DONATION_DATA.vitalSigns.temperature.toString());
          setNotes(MOCK_DONATION_DATA.notes);
        }
      } catch (error) {
        console.error('Error fetching donation data:', error);
        Alert.alert('Lỗi', 'Không thể tải thông tin hiến máu');
      } finally {
        setLoading(false);
      }
    };

    fetchDonationData();
  }, [donationId, mode]);

  const handleSubmit = async () => {
    if (!currentQuantity || !bloodPressure || !pulse || !temperature) {
      Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    setIsSubmitting(true);

    try {
      const quantity = parseInt(currentQuantity);
      const isCompleted = quantity >= donationData.targetQuantity;
      
      // Prepare data for BloodDonation model
      const bloodDonationData = {
        id: donationData.id,
        quantity: quantity,
        status: hasAdverseEvent ? 'ADVERSE_EVENT' : (isCompleted ? 'COMPLETED' : 'IN_PROGRESS'),
        notes: notes,
        donationDate: new Date().toISOString(),
        staffId: 'current_nurse_id', // Get from auth context
        vitalSigns: {
          bloodPressure,
          pulse: parseInt(pulse),
          temperature: parseFloat(temperature),
        }
      };

      // Prepare data for DonorStatusLog model
      const donorStatusLogData = {
        donationId: donationData.id,
        userId: donationData.donor.id,
        staffId: 'current_nurse_id', // Get from auth context
        status: donorStatus,
        phase: 'DONATION',
        notes: notes,
        recordedAt: new Date().toISOString(),
      };

      // TODO: Call API to update blood donation and create status log
      console.log('Updating blood donation:', bloodDonationData);
      console.log('Creating donor status log:', donorStatusLogData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const message = isCompleted 
        ? 'Đã hoàn thành hiến máu thành công!' 
        : hasAdverseEvent 
        ? 'Đã ghi nhận sự cố và dừng hiến máu'
        : 'Đã cập nhật thông tin hiến máu';

      Alert.alert('Thành công', message, [
        {
          text: 'OK',
          onPress: () => {
            if (isCompleted) {
              navigation.navigate('DonationDetail', { donationId: donationData.id });
            } else {
              navigation.goBack();
            }
          }
        }
      ]);

    } catch (error) {
      console.error('Error updating donation:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật thông tin hiến máu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProgressPercentage = () => {
    if (!currentQuantity || !donationData) return 0;
    return Math.min((parseInt(currentQuantity) / donationData.targetQuantity) * 100, 100);
  };

  if (loading || !donationData) {
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
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack?.()}>
            <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {mode === 'start' ? 'Bắt đầu hiến máu' : 'Cập nhật hiến máu'}
          </Text>
          <Text style={styles.headerSubtitle}>Mã: {donationData.bloodBag.id}</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Donor Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin người hiến</Text>
            <View style={styles.donorInfoRow}>
              <Image source={{ uri: donationData.donor.avatar }} style={styles.donorAvatar} />
              <View style={styles.donorDetails}>
                <Text style={styles.donorName}>{donationData.donor.name}</Text>
                <View style={styles.donorInfoItem}>
                  <MaterialCommunityIcons name="water" size={16} color="#FF6B6B" />
                  <Text style={styles.donorInfoText}>Nhóm máu: {donationData.donor.bloodType}</Text>
                </View>
                <View style={styles.donorInfoItem}>
                  <MaterialCommunityIcons name="test-tube" size={16} color="#636E72" />
                  <Text style={styles.donorInfoText}>Loại: {donationData.bloodComponent}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Progress */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tiến độ hiến máu</Text>
            <View style={styles.progressContainer}>
              <View style={styles.progressInfo}>
                <Text style={styles.progressText}>
                  {currentQuantity || donationData.quantity} / {donationData.targetQuantity} ml
                </Text>
                <Text style={styles.progressPercentage}>
                  {Math.round(getProgressPercentage())}%
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${getProgressPercentage()}%` }
                  ]} 
                />
              </View>
            </View>
          </View>

          {/* Vital Signs Form */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cập nhật thông tin</Text>
            
            <View style={styles.formRow}>
              <Text style={styles.formLabel}>Thể tích hiện tại (ml) *</Text>
              <TextInput
                style={styles.formInput}
                value={currentQuantity}
                onChangeText={setCurrentQuantity}
                placeholder="Nhập thể tích..."
                keyboardType="numeric"
                placeholderTextColor="#A0AEC0"
              />
            </View>

            <View style={styles.formRow}>
              <Text style={styles.formLabel}>Huyết áp *</Text>
              <TextInput
                style={styles.formInput}
                value={bloodPressure}
                onChangeText={setBloodPressure}
                placeholder="VD: 120/80"
                placeholderTextColor="#A0AEC0"
              />
            </View>

            <View style={styles.formRowGroup}>
              <View style={styles.formRowHalf}>
                <Text style={styles.formLabel}>Nhịp tim (bpm) *</Text>
                <TextInput
                  style={styles.formInput}
                  value={pulse}
                  onChangeText={setPulse}
                  placeholder="VD: 75"
                  keyboardType="numeric"
                  placeholderTextColor="#A0AEC0"
                />
              </View>
              <View style={styles.formRowHalf}>
                <Text style={styles.formLabel}>Nhiệt độ (°C) *</Text>
                <TextInput
                  style={styles.formInput}
                  value={temperature}
                  onChangeText={setTemperature}
                  placeholder="VD: 36.5"
                  keyboardType="numeric"
                  placeholderTextColor="#A0AEC0"
                />
              </View>
            </View>

            <View style={styles.formRow}>
              <Text style={styles.formLabel}>Tình trạng người hiến</Text>
              <View style={styles.statusButtonGroup}>
                {[
                  { key: 'STABLE', label: 'Ổn định', color: '#2ED573' },
                  { key: 'MILD_REACTION', label: 'Phản ứng nhẹ', color: '#FFA502' },
                  { key: 'SEVERE_REACTION', label: 'Phản ứng nặng', color: '#FF4757' },
                ].map((status) => (
                  <TouchableOpacity
                    key={status.key}
                    style={[
                      styles.statusButton,
                      { borderColor: status.color },
                      donorStatus === status.key && { backgroundColor: status.color }
                    ]}
                    onPress={() => {
                      setDonorStatus(status.key);
                      setHasAdverseEvent(status.key !== 'STABLE');
                    }}
                  >
                    <Text
                      style={[
                        styles.statusButtonText,
                        { color: donorStatus === status.key ? '#fff' : status.color }
                      ]}
                    >
                      {status.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formRow}>
              <Text style={styles.formLabel}>Ghi chú</Text>
              <TextInput
                style={[styles.formInput, styles.formTextArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Nhập ghi chú về tình trạng, sự cố (nếu có)..."
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                placeholderTextColor="#A0AEC0"
              />
            </View>
          </View>
        </ScrollView>

        {/* Footer Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <MaterialIcons name="save" size={24} color="#FFFFFF" />
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Đang lưu...' : 'Cập nhật thông tin'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    paddingBottom: 12,
    paddingHorizontal: 20,
  },
  headerLeft: {
    width: 40,
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {
    width: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  headerSubtitle: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 12,
  },
  donorInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  donorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  donorDetails: {
    flex: 1,
    marginLeft: 16,
  },
  donorName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 4,
  },
  donorInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  donorInfoText: {
    fontSize: 14,
    color: '#636E72',
    marginLeft: 6,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  progressBar: {
    height: 12,
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B6B',
    borderRadius: 6,
  },
  formRow: {
    marginBottom: 16,
  },
  formRowGroup: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  formRowHalf: {
    flex: 1,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#2D3436',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  formTextArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  statusButtonGroup: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  statusButton: {
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flex: 1,
    alignItems: 'center',
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  submitButton: {
    backgroundColor: '#FF6B6B',
    height: 56,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default DonationCreateFormScreen;
