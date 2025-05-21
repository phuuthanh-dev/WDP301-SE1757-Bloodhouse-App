import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Share,
  StatusBar,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';

export default function EmergencyRequestScreen({ navigation }) {
  const [formData, setFormData] = useState({
    patientName: '',
    bloodType: '',
    units: '',
    hospital: '',
    contactName: '',
    contactPhone: '',
    notes: '',
    location: null,
  });

  const [loading, setLoading] = useState(false);

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Quyền truy cập vị trí',
          'Chúng tôi cần quyền truy cập vị trí để tìm người hiến máu gần bạn.'
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setFormData(prev => ({
        ...prev,
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
      }));
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lấy vị trí của bạn.');
    }
  };

  const validateForm = () => {
    const required = [
      'patientName',
      'bloodType',
      'units',
      'hospital',
      'contactName',
      'contactPhone',
    ];

    const missing = required.filter(field => !formData[field]);
    if (missing.length > 0) {
      Alert.alert('Thiếu thông tin', 'Vui lòng điền đầy đủ thông tin bắt buộc.');
      return false;
    }

    if (!formData.location) {
      Alert.alert('Thiếu vị trí', 'Vui lòng cho phép truy cập vị trí của bạn.');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // TODO: Implement API call to submit emergency request
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      Alert.alert(
        'Thành công',
        'Yêu cầu khẩn cấp của bạn đã được gửi. Chúng tôi sẽ thông báo ngay khi tìm được người hiến máu phù hợp.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('EmergencyStatus', { requestId: '123' }),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể gửi yêu cầu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Yêu cầu hiến máu khẩn cấp!\nNhóm máu cần: ' + formData.bloodType + '\nBệnh viện: ' + formData.hospital,
        title: 'Yêu cầu hiến máu khẩn cấp',
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <View style={styles.container}>
      
      {/* Header */}
      <View style={styles.headerNav}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleShare}
        >
          <MaterialIcons name="share" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Yêu cầu máu khẩn cấp</Text>
          <Text style={styles.subtitle}>
            Điền thông tin chi tiết để chúng tôi có thể tìm người hiến máu phù hợp nhanh nhất
          </Text>
        </View>

        <View style={styles.form}>
          {/* Patient Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin bệnh nhân</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Tên bệnh nhân *</Text>
              <TextInput
                style={styles.input}
                value={formData.patientName}
                onChangeText={(text) => setFormData(prev => ({ ...prev, patientName: text }))}
                placeholder="Nhập tên bệnh nhân"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nhóm máu cần *</Text>
              <View style={styles.bloodTypeGrid}>
                {bloodTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.bloodTypeButton,
                      formData.bloodType === type && styles.selectedBloodType,
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, bloodType: type }))}
                  >
                    <Text
                      style={[
                        styles.bloodTypeText,
                        formData.bloodType === type && styles.selectedBloodTypeText,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Số đơn vị cần *</Text>
              <TextInput
                style={styles.input}
                value={formData.units}
                onChangeText={(text) => setFormData(prev => ({ ...prev, units: text }))}
                placeholder="Nhập số đơn vị máu cần"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Bệnh viện/Cơ sở y tế *</Text>
              <TextInput
                style={styles.input}
                value={formData.hospital}
                onChangeText={(text) => setFormData(prev => ({ ...prev, hospital: text }))}
                placeholder="Nhập tên bệnh viện"
              />
            </View>
          </View>

          {/* Contact Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Tên người liên hệ *</Text>
              <TextInput
                style={styles.input}
                value={formData.contactName}
                onChangeText={(text) => setFormData(prev => ({ ...prev, contactName: text }))}
                placeholder="Nhập tên người liên hệ"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Số điện thoại *</Text>
              <TextInput
                style={styles.input}
                value={formData.contactPhone}
                onChangeText={(text) => setFormData(prev => ({ ...prev, contactPhone: text }))}
                placeholder="Nhập số điện thoại"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Ghi chú thêm</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.notes}
                onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
                placeholder="Nhập thông tin thêm nếu cần"
                multiline
                numberOfLines={4}
              />
            </View>
          </View>

          {/* Location */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vị trí</Text>
            <TouchableOpacity
              style={styles.locationButton}
              onPress={handleLocationPermission}
            >
              <MaterialIcons name="location-on" size={24} color="#FF6B6B" />
              <Text style={styles.locationButtonText}>
                {formData.location
                  ? 'Đã lấy vị trí của bạn'
                  : 'Cho phép truy cập vị trí'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Đang gửi yêu cầu...' : 'Gửi yêu cầu khẩn cấp'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    top: Platform.OS === 'ios' ? 40 : StatusBar.currentHeight,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerButton: {
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
  },
  header: {
    backgroundColor: '#FF6B6B',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 80 : 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  form: {
    padding: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#2D3436',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  bloodTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  bloodTypeButton: {
    width: '23%',
    margin: '1%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  selectedBloodType: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  bloodTypeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  selectedBloodTypeText: {
    color: '#FFFFFF',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3F3',
    padding: 16,
    borderRadius: 8,
  },
  locationButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#FF6B6B',
  },
  submitButton: {
    backgroundColor: '#FF6B6B',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 