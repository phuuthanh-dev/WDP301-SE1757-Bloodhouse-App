import React, { useState } from 'react';
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

const todayAppointments = [
  {
    id: '1',
    name: 'Nguyễn Văn A',
    time: '09:00',
    status: 'Đang Chờ',
    bloodType: 'A+',
    age: 28,
    gender: 'Nam',
  },
  {
    id: '2',
    name: 'Trần Thị B',
    time: '09:30',
    status: 'Đang Khám',
    bloodType: 'O+',
    age: 35,
    gender: 'Nữ',
  },
  {
    id: '3',
    name: 'Lê Văn C',
    time: '10:00',
    status: 'Hoàn Thành',
    bloodType: 'B+',
    age: 42,
    gender: 'Nam',
  },
];

const getStatusColor = (status) => {
  switch (status) {
    case 'Đang Chờ':
      return '#FFA502';
    case 'Đang Khám':
      return '#1E90FF';
    case 'Hoàn Thành':
      return '#2ED573';
    default:
      return '#95A5A6';
  }
};

export default function DoctorDashboardScreen({ navigation }) {
  const renderAppointmentCard = (appointment) => (
    <TouchableOpacity
      key={appointment.id}
      style={styles.card}
      onPress={() => navigation.navigate('DonorExamination', { id: appointment.id })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.appointmentTime}>{appointment.time}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(appointment.status) + '20' },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(appointment.status) },
              ]}
            >
              {appointment.status}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.donorName}>{appointment.name}</Text>
        <View style={styles.donorInfo}>
          <View style={styles.infoItem}>
            <MaterialIcons name="opacity" size={16} color="#FF6B6B" />
            <Text style={styles.infoText}>{appointment.bloodType}</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialIcons name="person" size={16} color="#636E72" />
            <Text style={styles.infoText}>
              {appointment.age} tuổi • {appointment.gender}
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.startButton}
        onPress={() => navigation.navigate('DonorExamination', { id: appointment.id })}
      >
        <Text style={styles.startButtonText}>
          {appointment.status === 'Đang Chờ'
            ? 'Bắt Đầu Khám'
            : appointment.status === 'Đang Khám'
            ? 'Tiếp Tục'
            : 'Xem Chi Tiết'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Xin chào,</Text>
          <Text style={styles.doctorName}>BS. Nguyễn Văn X</Text>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <MaterialIcons name="person" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>12</Text>
          <Text style={styles.statLabel}>Lịch Hẹn Hôm Nay</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>5</Text>
          <Text style={styles.statLabel}>Đang Chờ</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>7</Text>
          <Text style={styles.statLabel}>Hoàn Thành</Text>
        </View>
      </View>

      {/* Appointments List */}
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Danh Sách Khám Hôm Nay</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AppointmentList')}>
          <Text style={styles.viewAllText}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {todayAppointments.map(renderAppointmentCard)}
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
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  welcomeText: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  doctorName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#636E72',
    textAlign: 'center',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  viewAllText: {
    fontSize: 14,
    color: '#FF6B6B',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  card: {
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appointmentTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3436',
    marginRight: 12,
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
  donorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 8,
  },
  donorInfo: {
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
  startButton: {
    margin: 16,
    padding: 12,
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 