import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const donationHistory = [
  {
    id: '1',
    date: '15/03/2024',
    type: 'Toàn Phần',
    volume: '350ml',
    status: 'Hoàn Thành',
    medicalData: {
      weight: '65kg',
      bloodPressure: '120/80',
      heartRate: '72',
      hemoglobin: '14.5',
      notes: 'Không có vấn đề gì đáng lưu ý',
    },
  },
  {
    id: '2',
    date: '10/12/2023',
    type: 'Toàn Phần',
    volume: '350ml',
    status: 'Hoàn Thành',
    medicalData: {
      weight: '64kg',
      bloodPressure: '118/78',
      heartRate: '70',
      hemoglobin: '14.2',
      notes: 'Huyết áp hơi thấp, đã theo dõi sau hiến',
    },
  },
  {
    id: '3',
    date: '05/09/2023',
    type: 'Toàn Phần',
    volume: '350ml',
    status: 'Hoàn Thành',
    medicalData: {
      weight: '63kg',
      bloodPressure: '122/82',
      heartRate: '74',
      hemoglobin: '14.8',
      notes: 'Tình trạng sức khỏe tốt',
    },
  },
];

export default function DonorHistoryScreen({ navigation }) {
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
        <Text style={styles.headerTitle}>Lịch Sử Hiến Máu</Text>
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
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>12</Text>
                <Text style={styles.statLabel}>Lần Hiến</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>4.2L</Text>
                <Text style={styles.statLabel}>Tổng Lượng</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>2019</Text>
                <Text style={styles.statLabel}>Bắt Đầu</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Medical Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ghi Chú Y Tế</Text>
          <View style={styles.noteCard}>
            <View style={styles.noteItem}>
              <MaterialIcons name="info" size={16} color="#FF6B6B" />
              <Text style={styles.noteText}>Không có bệnh lý nền</Text>
            </View>
            <View style={styles.noteItem}>
              <MaterialIcons name="healing" size={16} color="#FF6B6B" />
              <Text style={styles.noteText}>Không dị ứng thuốc</Text>
            </View>
            <View style={styles.noteItem}>
              <MaterialIcons name="favorite" size={16} color="#FF6B6B" />
              <Text style={styles.noteText}>Huyết áp ổn định</Text>
            </View>
          </View>
        </View>

        {/* Donation History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lịch Sử Các Lần Hiến</Text>
          {donationHistory.map((donation) => (
            <View key={donation.id} style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyDate}>{donation.date}</Text>
                <View style={styles.historyType}>
                  <MaterialIcons name="water-drop" size={16} color="#FF6B6B" />
                  <Text style={styles.historyTypeText}>
                    {donation.type} • {donation.volume}
                  </Text>
                </View>
              </View>

              <View style={styles.medicalDataContainer}>
                <View style={styles.medicalDataRow}>
                  <View style={styles.medicalDataItem}>
                    <Text style={styles.medicalLabel}>Cân nặng</Text>
                    <Text style={styles.medicalValue}>
                      {donation.medicalData.weight}
                    </Text>
                  </View>
                  <View style={styles.medicalDataItem}>
                    <Text style={styles.medicalLabel}>Huyết áp</Text>
                    <Text style={styles.medicalValue}>
                      {donation.medicalData.bloodPressure}
                    </Text>
                  </View>
                  <View style={styles.medicalDataItem}>
                    <Text style={styles.medicalLabel}>Nhịp tim</Text>
                    <Text style={styles.medicalValue}>
                      {donation.medicalData.heartRate}
                    </Text>
                  </View>
                </View>

                <View style={styles.notesContainer}>
                  <Text style={styles.notesLabel}>Ghi chú:</Text>
                  <Text style={styles.notesText}>
                    {donation.medicalData.notes}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
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
    marginBottom: 16,
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    paddingTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#636E72',
  },
  noteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#636E72',
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  historyDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  historyType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyTypeText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#FF6B6B',
  },
  medicalDataContainer: {
    padding: 16,
  },
  medicalDataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  medicalDataItem: {
    alignItems: 'center',
  },
  medicalLabel: {
    fontSize: 12,
    color: '#636E72',
    marginBottom: 4,
  },
  medicalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  notesContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    paddingTop: 16,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#636E72',
    lineHeight: 20,
  },
}); 