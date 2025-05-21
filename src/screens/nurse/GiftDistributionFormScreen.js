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
  KeyboardAvoidingView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function GiftDistributionFormScreen({ route, navigation }) {
  const { gift } = route.params;
  const [formData, setFormData] = useState({
    donorId: '', // userId - người nhận quà
    donationId: '', // mã lần hiến máu
    quantity: '1', // số lượng quà phát
    notes: '', // ghi chú
    donorName: '', // tên người nhận (hiển thị sau khi quét)
    donationDate: '', // ngày hiến máu (hiển thị sau khi quét)
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleScanDonor = () => {
    navigation.navigate('Scanner', {
      mode: 'gift',
      giftId: gift.id,
      giftName: gift.name,
      onScanSuccess: (scannedData) => {
        // TODO: Call API to get donor and donation info
        // Mock data for now
        setFormData(prev => ({
          ...prev,
          donorId: scannedData.donorId,
          donationId: scannedData.donationId,
          donorName: 'Nguyễn Văn A', // Will be from API
          donationDate: '20/03/2024', // Will be from API
        }));
      }
    });
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.donorId.trim()) {
      Alert.alert('Lỗi', 'Vui lòng quét mã người hiến máu');
      return;
    }

    if (!formData.donationId.trim()) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin lần hiến máu');
      return;
    }

    if (!formData.quantity || parseInt(formData.quantity) < 1) {
      Alert.alert('Lỗi', 'Số lượng quà phải lớn hơn 0');
      return;
    }

    if (parseInt(formData.quantity) > gift.quantity) {
      Alert.alert('Lỗi', 'Số lượng quà vượt quá số lượng còn lại');
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Implement API call to submit gift distribution
      const giftDistribution = {
        userId: formData.donorId,
        donationId: formData.donationId,
        giftItemId: gift.id,
        quantity: parseInt(formData.quantity),
        note: formData.notes,
        distributedAt: new Date().toISOString(),
      };

      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      Alert.alert(
        'Thành công',
        'Đã phát quà thành công',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể phát quà. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
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
        <Text style={styles.headerTitle}>Phát Quà Tặng</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Gift Info Card */}
          <View style={styles.giftCard}>
            <View style={styles.giftHeader}>
              <MaterialIcons name="card-giftcard" size={24} color="#FF6B6B" />
              <Text style={styles.giftTitle}>Thông tin quà tặng</Text>
            </View>
            <View style={styles.giftDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Mã quà:</Text>
                <Text style={styles.detailValue}>{gift.code}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Tên quà:</Text>
                <Text style={styles.detailValue}>{gift.name}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Loại:</Text>
                <Text style={styles.detailValue}>{gift.type}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Còn lại:</Text>
                <Text style={[
                  styles.detailValue,
                  gift.quantity < 10 && styles.warningText
                ]}>
                  {gift.quantity} món
                </Text>
              </View>
            </View>
          </View>

          {/* Donor Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin người nhận</Text>
            <View style={styles.donorInputContainer}>
              <TextInput
                style={styles.donorInput}
                placeholder="Mã người hiến máu"
                value={formData.donorId}
                editable={false}
              />
              <TouchableOpacity
                style={styles.scanButton}
                onPress={handleScanDonor}
              >
                <MaterialIcons name="qr-code-scanner" size={24} color="#FFFFFF" />
                <Text style={styles.scanButtonText}>Quét mã</Text>
              </TouchableOpacity>
            </View>
            
            {formData.donorId && (
              <View style={styles.donorInfo}>
                <View style={styles.infoRow}>
                  <MaterialIcons name="person" size={16} color="#636E72" />
                  <Text style={styles.infoText}>{formData.donorName}</Text>
                </View>
                <View style={styles.infoRow}>
                  <MaterialIcons name="event" size={16} color="#636E72" />
                  <Text style={styles.infoText}>Ngày hiến: {formData.donationDate}</Text>
                </View>
              </View>
            )}
          </View>

          {/* Quantity Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Số lượng</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => {
                  const currentQty = parseInt(formData.quantity) || 0;
                  if (currentQty > 1) {
                    setFormData(prev => ({
                      ...prev,
                      quantity: (currentQty - 1).toString()
                    }));
                  }
                }}
              >
                <MaterialIcons name="remove" size={24} color="#FF6B6B" />
              </TouchableOpacity>
              <TextInput
                style={styles.quantityInput}
                value={formData.quantity}
                onChangeText={(text) => {
                  const number = parseInt(text) || 0;
                  if (number <= gift.quantity) {
                    setFormData(prev => ({
                      ...prev,
                      quantity: text
                    }));
                  }
                }}
                keyboardType="number-pad"
                maxLength={2}
              />
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => {
                  const currentQty = parseInt(formData.quantity) || 0;
                  if (currentQty < gift.quantity) {
                    setFormData(prev => ({
                      ...prev,
                      quantity: (currentQty + 1).toString()
                    }));
                  }
                }}
              >
                <MaterialIcons name="add" size={24} color="#FF6B6B" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Notes Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ghi chú</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Nhập ghi chú (nếu có)"
              multiline
              numberOfLines={4}
              value={formData.notes}
              onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
            />
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <MaterialIcons name="check" size={24} color="#FFFFFF" />
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Đang xử lý...' : 'Xác nhận phát quà'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  giftCard: {
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
  giftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  giftTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3436',
    marginLeft: 8,
  },
  giftDetails: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#636E72',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#2D3436',
    fontWeight: '500',
    flex: 2,
  },
  warningText: {
    color: '#FF6B6B',
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
  donorInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  donorInput: {
    flex: 1,
    height: 48,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#2D3436',
  },
  scanButton: {
    backgroundColor: '#FF6B6B',
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  donorInfo: {
    marginTop: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#2D3436',
    marginLeft: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  quantityButton: {
    width: 48,
    height: 48,
    backgroundColor: '#FFF0F0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityInput: {
    width: 80,
    height: 48,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  notesInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    height: 120,
    textAlignVertical: 'top',
    fontSize: 16,
    color: '#2D3436',
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