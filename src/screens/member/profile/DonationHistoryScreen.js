import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function DonationHistoryScreen({ navigation }) {
  // Mock data for donation history
  const donationHistory = [
    {
      id: 1,
      date: '15/02/2024',
      location: 'Trung tâm Y tế Quận 5',
      bloodType: 'A+',
      amount: '350ml',
      status: 'completed',
      certificate: 'CERT123456',
    },
    {
      id: 2,
      date: '10/11/2023',
      location: 'Bệnh viện Chợ Rẫy',
      bloodType: 'A+',
      amount: '350ml',
      status: 'completed',
      certificate: 'CERT123455',
    },
    {
      id: 3,
      date: '05/08/2023',
      location: 'Trung tâm Y tế Quận 5',
      bloodType: 'A+',
      amount: '350ml',
      status: 'completed',
      certificate: 'CERT123454',
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#4CAF50';
      case 'pending':
        return '#FFB300';
      case 'cancelled':
        return '#FF6B6B';
      default:
        return '#95A5A6';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Đã hoàn thành';
      case 'pending':
        return 'Đang chờ';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const renderDonationCard = (donation) => (
    <TouchableOpacity
      key={donation.id}
      style={styles.donationCard}
      onPress={() => navigation.navigate('DonationDetails', { donation })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.dateContainer}>
          <MaterialIcons name="event" size={20} color="#636E72" />
          <Text style={styles.date}>{donation.date}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(donation.status) + '20' },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: getStatusColor(donation.status) },
            ]}
          >
            {getStatusText(donation.status)}
          </Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <MaterialIcons name="location-on" size={20} color="#636E72" />
          <Text style={styles.infoText}>{donation.location}</Text>
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons name="opacity" size={20} color="#636E72" />
          <Text style={styles.infoText}>
            Nhóm máu: {donation.bloodType} • {donation.amount}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons name="verified" size={20} color="#636E72" />
          <Text style={styles.infoText}>
            Chứng nhận: {donation.certificate}
          </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {/* Handle certificate download */}}
        >
          <MaterialIcons name="file-download" size={20} color="#FF6B6B" />
          <Text style={styles.actionButtonText}>Tải chứng nhận</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {/* Handle share */}}
        >
          <MaterialIcons name="share" size={20} color="#FF6B6B" />
          <Text style={styles.actionButtonText}>Chia sẻ</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch sử hiến máu</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>3</Text>
          <Text style={styles.statLabel}>Lần hiến máu</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>1,050ml</Text>
          <Text style={styles.statLabel}>Tổng lượng máu</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>3</Text>
          <Text style={styles.statLabel}>Người được cứu</Text>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 32 }}>
        {donationHistory.map(renderDonationCard)}
      </ScrollView>
    </View>
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
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
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
  placeholder: {
    width: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#636E72',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  donationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    marginLeft: 8,
    fontSize: 16,
    color: '#2D3436',
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardContent: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#636E72',
  },
  cardFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    padding: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#FF6B6B',
  },
}); 