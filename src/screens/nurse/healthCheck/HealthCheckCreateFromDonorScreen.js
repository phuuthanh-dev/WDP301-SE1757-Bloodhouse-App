import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, StyleSheet, Platform, Alert, Image, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

// Mock data
const nurseInfo = {
  name: 'Nguyễn Thị Y Tá',
  facility: 'Bệnh viện Hữu Nghị Việt Đức',
};
const patientInfo = {
  name: 'Nguyễn Văn A',
  dob: '01/01/1990',
  gender: 'Nam',
  bloodType: 'A+',
  phone: '0901234567',
};
const doctors = [
  { id: '1', name: 'BS. Trần Văn B', avatar: 'https://i.pravatar.cc/150?img=3', todayCount: 5 },
  { id: '2', name: 'BS. Lê Thị C', avatar: 'https://i.pravatar.cc/150?img=4', todayCount: 3 },
  { id: '3', name: 'BS. Phạm Văn D', avatar: 'https://i.pravatar.cc/150?img=5', todayCount: 7 },
];

const HealthCheckCreateFromDonorScreen = ({ navigation, route }) => {
  const [selectedDoctor, setSelectedDoctor] = useState(doctors[0]?.id || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [note, setNote] = useState('');
  
  // Get registrationId from route params if coming from CheckIn screen
  const registrationId = route?.params?.registrationId;

  const handleCreate = async () => {
    setIsSubmitting(true);
    // TODO: Call API to create health check, gửi kèm note và registrationId
    const healthCheckData = {
      registrationId,
      doctorId: selectedDoctor,
      note,
      nurseId: 'current_nurse_id', // Get from auth context
      createdAt: new Date().toISOString(),
    };
    
    console.log('Creating health check with data:', healthCheckData);
    
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert('Thành công', 'Đã tạo phiếu khám sức khoẻ!', [
        { text: 'OK', onPress: () => navigation?.goBack?.() },
      ]);
    }, 1000);
  };

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
          <Text style={styles.nurseName}>{nurseInfo.name}</Text>
          <Text style={styles.facilityName}>{nurseInfo.facility}</Text>
          <Text style={styles.headerTitle}>Tạo khám sức khoẻ</Text>
        </View>
        <View style={styles.headerRight} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Thông tin bệnh nhân */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin bệnh nhân</Text>
          {registrationId && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Mã đăng ký:</Text>
              <Text style={[styles.infoValue, { color: '#FF6B6B', fontWeight: 'bold' }]}>{registrationId}</Text>
            </View>
          )}
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Họ tên:</Text><Text style={styles.infoValue}>{patientInfo.name}</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Ngày sinh:</Text><Text style={styles.infoValue}>{patientInfo.dob}</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Giới tính:</Text><Text style={styles.infoValue}>{patientInfo.gender}</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Nhóm máu:</Text><Text style={styles.infoValue}>{patientInfo.bloodType}</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>SĐT:</Text><Text style={styles.infoValue}>{patientInfo.phone}</Text></View>
        </View>
        {/* Danh sách bác sĩ hỗ trợ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chọn bác sĩ hỗ trợ</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.doctorList}>
            {doctors.map((doctor) => (
              <TouchableOpacity
                key={doctor.id}
                style={[styles.doctorCard, selectedDoctor === doctor.id && styles.doctorCardSelected]}
                onPress={() => setSelectedDoctor(doctor.id)}
                activeOpacity={0.85}
              >
                <View style={styles.doctorAvatarWrap}>
                  <View style={[styles.doctorAvatarBorder, selectedDoctor === doctor.id && { borderColor: '#FF6B6B' }]}>
                    <View style={styles.doctorAvatarShadow}>
                      <View style={styles.doctorAvatarCircle}>
                        <View style={styles.doctorAvatarInner}>
                          <View style={{overflow: 'hidden', borderRadius: 32}}>
                            <Image source={{ uri: doctor.avatar }} alt={doctor.name} style={{width: 64, height: 64, objectFit: 'cover'}} />
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
                <Text style={styles.doctorNameCard} numberOfLines={1  }>{doctor.name}</Text>
                <Text style={styles.doctorCount} numberOfLines={1}>SL hôm nay: <Text style={{color:'#FF6B6B', fontWeight:'bold'}}>{doctor.todayCount}</Text></Text>
                {selectedDoctor === doctor.id && (
                  <MaterialIcons name="check-circle" size={20} color="#FF6B6B" style={{ marginTop: 4 }} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        {/* Ghi chú của y tá */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ghi chú của y tá (nếu có)</Text>
          <View style={styles.noteInputWrap}>
            <TextInput
              style={styles.noteInput}
              placeholder="Nhập ghi chú cho bác sĩ hoặc bệnh nhân..."
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>
      </ScrollView>
      {/* Button tạo */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleCreate}
          disabled={isSubmitting}
        >
          <MaterialIcons name="check" size={24} color="#FFFFFF" />
          <Text style={styles.submitButtonText}>{isSubmitting ? 'Đang tạo...' : 'Tạo'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

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
  nurseName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  facilityName: {
    color: '#fff',
    fontSize: 13,
    marginBottom: 2,
  },
  headerTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 2,
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
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    color: '#636E72',
    fontSize: 14,
    width: 90,
  },
  infoValue: {
    color: '#2D3436',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  doctorList: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 4,
  },
  doctorCard: {
    width: 120,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    alignItems: 'center',
    padding: 12,
    marginRight: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  doctorCardSelected: {
    backgroundColor: '#FFEAEA',
    borderColor: '#FF6B6B',
    borderWidth: 1,
  },
  doctorAvatarWrap: {
    marginBottom: 8,
  },
  doctorAvatarBorder: {
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: 32,
    padding: 2,
  },
  doctorAvatarShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  doctorAvatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doctorAvatarInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doctorNameCard: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2D3436',
    textAlign: 'center',
    marginBottom: 2,
    marginTop: 2,
  },
  doctorCount: {
    fontSize: 12,
    color: '#636E72',
    textAlign: 'center',
    marginBottom: 2,
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
  noteInputWrap: {
    marginTop: 4,
  },
  noteInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    minHeight: 60,
    fontSize: 15,
    color: '#2D3436',
  },
});

export default HealthCheckCreateFromDonorScreen;