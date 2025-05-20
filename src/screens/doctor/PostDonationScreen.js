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

export default function PostDonationScreen({ navigation, route }) {
  const [postDonationData, setPostDonationData] = useState({
    donorCondition: 'Bình Thường',
    bloodUnitStatus: 'Bình Thường',
    notes: '',
    followUpRequired: false,
    followUpReason: '',
  });

  const handleSave = () => {
    // TODO: Save post-donation monitoring data
    Alert.alert('Thành Công', 'Đã lưu thông tin theo dõi sau hiến máu');
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
        <Text style={styles.headerTitle}>Theo Dõi Sau Hiến</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Donor Info */}
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
            <View style={styles.donationInfo}>
              <Text style={styles.donationText}>
                Thời gian hiến: 09:30 - 10:00
              </Text>
              <Text style={styles.donationText}>
                Lượng máu hiến: 350ml
              </Text>
              <Text style={styles.donationText}>
                Mã túi máu: BU2024031501
              </Text>
            </View>
          </View>
        </View>

        {/* Donor Condition */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tình Trạng Người Hiến</Text>
          <View style={styles.conditionContainer}>
            <TouchableOpacity
              style={[
                styles.conditionButton,
                postDonationData.donorCondition === 'Bình Thường' && styles.activeButton,
              ]}
              onPress={() =>
                setPostDonationData({ ...postDonationData, donorCondition: 'Bình Thường' })
              }
            >
              <MaterialIcons
                name="check-circle"
                size={24}
                color={
                  postDonationData.donorCondition === 'Bình Thường'
                    ? '#FFFFFF'
                    : '#2ED573'
                }
              />
              <Text
                style={[
                  styles.conditionButtonText,
                  {
                    color:
                      postDonationData.donorCondition === 'Bình Thường'
                        ? '#FFFFFF'
                        : '#2ED573',
                  },
                ]}
              >
                Bình Thường
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.conditionButton,
                postDonationData.donorCondition === 'Cần Theo Dõi' && styles.warningButton,
              ]}
              onPress={() =>
                setPostDonationData({
                  ...postDonationData,
                  donorCondition: 'Cần Theo Dõi',
                  followUpRequired: true,
                })
              }
            >
              <MaterialIcons
                name="warning"
                size={24}
                color={
                  postDonationData.donorCondition === 'Cần Theo Dõi'
                    ? '#FFFFFF'
                    : '#FFA502'
                }
              />
              <Text
                style={[
                  styles.conditionButtonText,
                  {
                    color:
                      postDonationData.donorCondition === 'Cần Theo Dõi'
                        ? '#FFFFFF'
                        : '#FFA502',
                  },
                ]}
              >
                Cần Theo Dõi
              </Text>
            </TouchableOpacity>
          </View>

          {postDonationData.followUpRequired && (
            <View style={styles.followUpContainer}>
              <Text style={styles.label}>Lý do cần theo dõi</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={postDonationData.followUpReason}
                onChangeText={(text) =>
                  setPostDonationData({ ...postDonationData, followUpReason: text })
                }
                multiline
                numberOfLines={4}
                placeholder="Nhập lý do cần theo dõi..."
              />
            </View>
          )}
        </View>

        {/* Blood Unit Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tình Trạng Đơn Vị Máu</Text>
          <View style={styles.bloodUnitContainer}>
            <TouchableOpacity
              style={[
                styles.bloodUnitButton,
                postDonationData.bloodUnitStatus === 'Bình Thường' && styles.activeButton,
              ]}
              onPress={() =>
                setPostDonationData({ ...postDonationData, bloodUnitStatus: 'Bình Thường' })
              }
            >
              <MaterialIcons
                name="check-circle"
                size={24}
                color={
                  postDonationData.bloodUnitStatus === 'Bình Thường'
                    ? '#FFFFFF'
                    : '#2ED573'
                }
              />
              <Text
                style={[
                  styles.bloodUnitButtonText,
                  {
                    color:
                      postDonationData.bloodUnitStatus === 'Bình Thường'
                        ? '#FFFFFF'
                        : '#2ED573',
                  },
                ]}
              >
                Bình Thường
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.bloodUnitButton,
                postDonationData.bloodUnitStatus === 'Bất Thường' && styles.errorButton,
              ]}
              onPress={() =>
                setPostDonationData({ ...postDonationData, bloodUnitStatus: 'Bất Thường' })
              }
            >
              <MaterialIcons
                name="error"
                size={24}
                color={
                  postDonationData.bloodUnitStatus === 'Bất Thường'
                    ? '#FFFFFF'
                    : '#FF4757'
                }
              />
              <Text
                style={[
                  styles.bloodUnitButtonText,
                  {
                    color:
                      postDonationData.bloodUnitStatus === 'Bất Thường'
                        ? '#FFFFFF'
                        : '#FF4757',
                  },
                ]}
              >
                Bất Thường
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ghi Chú</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={postDonationData.notes}
            onChangeText={(text) =>
              setPostDonationData({ ...postDonationData, notes: text })
            }
            multiline
            numberOfLines={4}
            placeholder="Nhập ghi chú theo dõi..."
          />
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
    marginBottom: 12,
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
  donationInfo: {
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    paddingTop: 12,
  },
  donationText: {
    fontSize: 14,
    color: '#636E72',
    marginBottom: 4,
  },
  conditionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  conditionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F1F2F6',
    marginHorizontal: 4,
  },
  activeButton: {
    backgroundColor: '#2ED573',
  },
  warningButton: {
    backgroundColor: '#FFA502',
  },
  errorButton: {
    backgroundColor: '#FF4757',
  },
  conditionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  followUpContainer: {
    marginTop: 16,
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
  bloodUnitContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bloodUnitButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F1F2F6',
    marginHorizontal: 4,
  },
  bloodUnitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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