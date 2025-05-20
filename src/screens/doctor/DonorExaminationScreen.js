import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function DonorExaminationScreen({ navigation, route }) {
  const [medicalData, setMedicalData] = useState({
    weight: '',
    bloodPressure: '',
    heartRate: '',
    hemoglobin: '',
    temperature: '',
    notes: '',
    rejectionReason: '',
  });

  const [isEligible, setIsEligible] = useState(null);

  const handleSave = () => {
    // TODO: Save medical examination data
    Alert.alert('Thành Công', 'Đã lưu thông tin khám sàng lọc');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Khám Sàng Lọc</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Patient Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông Tin Người Hiến</Text>
          <View style={styles.infoCard}>
            <Text style={styles.name}>Nguyễn Văn A</Text>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <MaterialIcons name="person" size={16} color="#636E72" />
                <Text style={styles.infoText}>28 tuổi • Nam</Text>
              </View>
              <View style={styles.infoItem}>
                <MaterialIcons name="opacity" size={16} color="#FF6B6B" />
                <Text style={styles.infoText}>A+</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Medical History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tiền Sử Y Tế</Text>
          <View style={styles.historyCard}>
            <Text style={styles.historyText}>• Lần hiến máu gần nhất: 3 tháng trước</Text>
            <Text style={styles.historyText}>• Không có bệnh lý nền</Text>
            <Text style={styles.historyText}>• Không dị ứng thuốc</Text>
          </View>
        </View>

        {/* Examination Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chỉ Số Khám</Text>
          <View style={styles.formCard}>
            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Cân nặng (kg)</Text>
                <TextInput
                  style={styles.input}
                  value={medicalData.weight}
                  onChangeText={(text) => setMedicalData({ ...medicalData, weight: text })}
                  keyboardType="numeric"
                  placeholder="0.0"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Huyết áp (mmHg)</Text>
                <TextInput
                  style={styles.input}
                  value={medicalData.bloodPressure}
                  onChangeText={(text) => setMedicalData({ ...medicalData, bloodPressure: text })}
                  placeholder="120/80"
                />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nhịp tim (bpm)</Text>
                <TextInput
                  style={styles.input}
                  value={medicalData.heartRate}
                  onChangeText={(text) => setMedicalData({ ...medicalData, heartRate: text })}
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nhiệt độ (°C)</Text>
                <TextInput
                  style={styles.input}
                  value={medicalData.temperature}
                  onChangeText={(text) => setMedicalData({ ...medicalData, temperature: text })}
                  keyboardType="numeric"
                  placeholder="0.0"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Hemoglobin (g/dL)</Text>
              <TextInput
                style={styles.input}
                value={medicalData.hemoglobin}
                onChangeText={(text) => setMedicalData({ ...medicalData, hemoglobin: text })}
                keyboardType="numeric"
                placeholder="0.0"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ghi chú y tế</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={medicalData.notes}
                onChangeText={(text) => setMedicalData({ ...medicalData, notes: text })}
                multiline
                numberOfLines={4}
                placeholder="Nhập ghi chú..."
              />
            </View>
          </View>
        </View>

        {/* Eligibility Decision */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kết Luận</Text>
          <View style={styles.eligibilityContainer}>
            <TouchableOpacity
              style={[
                styles.eligibilityButton,
                isEligible === true && styles.eligibilityButtonActive,
                { backgroundColor: isEligible === true ? '#2ED573' : '#F1F2F6' },
              ]}
              onPress={() => setIsEligible(true)}
            >
              <MaterialIcons
                name="check-circle"
                size={24}
                color={isEligible === true ? '#FFFFFF' : '#2ED573'}
              />
              <Text
                style={[
                  styles.eligibilityButtonText,
                  { color: isEligible === true ? '#FFFFFF' : '#2ED573' },
                ]}
              >
                Đủ Điều Kiện
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.eligibilityButton,
                isEligible === false && styles.eligibilityButtonActive,
                { backgroundColor: isEligible === false ? '#FF4757' : '#F1F2F6' },
              ]}
              onPress={() => setIsEligible(false)}
            >
              <MaterialIcons
                name="cancel"
                size={24}
                color={isEligible === false ? '#FFFFFF' : '#FF4757'}
              />
              <Text
                style={[
                  styles.eligibilityButtonText,
                  { color: isEligible === false ? '#FFFFFF' : '#FF4757' },
                ]}
              >
                Không Đủ Điều Kiện
              </Text>
            </TouchableOpacity>
          </View>

          {isEligible === false && (
            <View style={styles.rejectionReasonContainer}>
              <Text style={styles.label}>Lý do từ chối</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={medicalData.rejectionReason}
                onChangeText={(text) =>
                  setMedicalData({ ...medicalData, rejectionReason: text })
                }
                multiline
                numberOfLines={4}
                placeholder="Nhập lý do từ chối..."
              />
            </View>
          )}
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Lưu Kết Quả</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

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
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  infoText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#636E72',
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historyText: {
    fontSize: 14,
    color: '#636E72',
    marginBottom: 8,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  inputGroup: {
    flex: 1,
    marginRight: 8,
  },
  label: {
    fontSize: 14,
    color: '#636E72',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F1F2F6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2D3436',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  eligibilityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  eligibilityButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  eligibilityButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  rejectionReasonContainer: {
    marginTop: 16,
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  saveButton: {
    backgroundColor: '#FF6B6B',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});