import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, StyleSheet, Platform, Alert, Image, TextInput } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import healthCheckAPI from '@/apis/healthCheckAPI';
import facilityStaffAPI from '@/apis/facilityStaffAPI';
import bloodDonationRegistrationAPI from '@/apis/bloodDonationRegistration';
import { useSelector } from 'react-redux';
import { authSelector } from '@/redux/reducers/authReducer';
import { useFacility } from '@/contexts/FacilityContext';

const HealthCheckCreateFromDonorScreen = ({ navigation, route }) => {
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [note, setNote] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registrationData, setRegistrationData] = useState(null);
  const { user } = useSelector(authSelector);
  const { facilityId, facilityName } = useFacility();
  
  // Get registrationId from route params
  const registrationId = route?.params?.registrationId;

  // Fetch doctors from facility staff API
  const fetchDoctors = async () => {
    try {
      if (!facilityId) {
        Alert.alert('Lỗi', 'Không tìm thấy thông tin cơ sở y tế');
        return;
      }

      const response = await facilityStaffAPI.HandleFacilityStaff(
        `/facility/${facilityId}?position=DOCTOR`,
        null,
        'get'
      );

      if (response.data && response.data.result) {
        const doctorList = response.data.result.map(staff => ({
          id: staff._id,
          name: staff.userId?.fullName || 'N/A',
          avatar: staff.userId?.avatar || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 10)}`,
          email: staff.userId?.email || '',
          phone: staff.userId?.phone || '',
          position: staff.position,
        }));
        
        setDoctors(doctorList);
        if (doctorList.length > 0) {
          setSelectedDoctor(doctorList[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách bác sĩ');
    }
  };

  // Fetch registration data
  const fetchRegistrationData = async () => {
    try {
      if (!registrationId) return;

      const response = await bloodDonationRegistrationAPI.HandleBloodDonationRegistration(
        `/${registrationId}`,
        null,
        'get'
      );

      if (response.data) {
        setRegistrationData(response.data);
      }
    } catch (error) {
      console.error('Error fetching registration data:', error);
      const errorMessage = error.response?.data?.message || 'Không thể tải thông tin đăng ký';
      Alert.alert('Lỗi', errorMessage);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchDoctors(),
        fetchRegistrationData()
      ]);
      setLoading(false);
    };

    loadData();
  }, [registrationId, facilityId]);

  const handleCreate = async () => {
    if (!selectedDoctor) {
      Alert.alert('Lỗi', 'Vui lòng chọn bác sĩ');
      return;
    }

    if (!registrationId) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin đăng ký');
      return;
    }

    if (!registrationData?.userId?._id) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin người hiến máu');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const healthCheckData = {
        registrationId,
        userId: registrationData.userId._id,
        doctorId: selectedDoctor,
        notes: note.trim() || undefined
      };
      
      console.log('Creating health check with data:', healthCheckData);
      
      const response = await healthCheckAPI.HandleHealthCheck(
        '',
        healthCheckData,
        'post'
      );
      
      if (response.data) {
        Alert.alert(
          'Thành công', 
          'Đã tạo phiếu khám sức khoẻ thành công!', 
          [
            { 
              text: 'OK', 
              onPress: () => {
                navigation.navigate('TabNavigatorNurse', {
                  screen: 'HealthChecks',
                  params: {
                    screen: 'HealthChecks',
                  },
                });
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error creating health check:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi tạo phiếu khám';
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get patient info from registration data
  const getPatientInfo = () => {
    if (!registrationData) {
      return {
        name: 'Đang tải...',
        dob: 'Đang tải...',
        gender: 'Đang tải...',
        bloodType: 'Đang tải...',
        phone: 'Đang tải...',
      };
    }

    const userInfo = registrationData.userId;
    return {
      name: userInfo?.fullName || 'N/A',
      dob: userInfo?.yob ? new Date(userInfo.yob).toLocaleDateString('vi-VN') : 'N/A',
      gender: userInfo?.sex === 'male' ? 'Nam' : userInfo?.sex === 'female' ? 'Nữ' : 'N/A',
      bloodType: registrationData.bloodGroupId?.name || registrationData.bloodGroupId?.type || 'N/A',
      phone: userInfo?.phone || 'N/A',
    };
  };

  // Get nurse info from auth context
  const getNurseInfo = () => {
    return {
      name: user?.fullName || 'Y tá',
      facility: facilityName || 'Cơ sở y tế',
    };
  };

  const patientInfo = getPatientInfo();
  const nurseInfo = getNurseInfo();

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack?.()}>
              <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Đang tải...</Text>
          </View>
          <View style={styles.headerRight} />
        </View>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text>Đang tải dữ liệu...</Text>
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
          <Text style={styles.nurseName}>{nurseInfo.name}</Text>
          <Text style={styles.facilityName}>{nurseInfo.facility}</Text>
          <Text style={styles.headerTitle}>Tạo khám sức khoẻ</Text>
        </View>
        <View style={styles.headerRight} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Thông tin bệnh nhân */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin người hiến máu</Text>
          {registrationId && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Mã đăng ký:</Text>
              <Text style={[styles.infoValue, { color: '#FF6B6B', fontWeight: 'bold' }]}>{registrationData.code}</Text>
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
          {doctors.length === 0 ? (
            <View style={styles.emptyDoctors}>
              <Text style={styles.emptyDoctorsText}>Không có bác sĩ nào trong cơ sở</Text>
            </View>
          ) : (
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
                            <View style={{overflow: 'hidden', borderRadius: 26}}>
                              <Image source={{ uri: doctor.avatar }} alt={doctor.name} style={{width: 52, height: 52, objectFit: 'cover'}} />
                            </View>
                          </View>
                        </View>
                      </View>
                    </View>
                    {/* Position Badge */}
                    <View style={styles.positionBadge}>
                      <Text style={styles.positionText}>BS</Text>
                    </View>
                  </View>
                  
                  <View style={styles.doctorInfo}>
                    <Text style={styles.doctorNameCard} numberOfLines={2}>{doctor.name}</Text>
                    {doctor.phone && (
                      <View style={styles.contactRow}>
                        <MaterialCommunityIcons name="phone" size={12} color="#636E72" />
                        <Text style={styles.doctorContact} numberOfLines={2}>
                          {doctor.phone}
                        </Text>
                      </View>
                    )}
                    {doctor.email && (
                      <View style={styles.contactRow}>
                        <MaterialCommunityIcons name="email" size={12} color="#636E72" />
                        <Text style={styles.doctorEmail} numberOfLines={2}>
                          {doctor.email}
                        </Text>
                      </View>
                    )}
                  </View>
                  
                  {selectedDoctor === doctor.id && (
                    <View style={styles.selectedIndicator}>
                      <MaterialIcons name="check-circle" size={16} color="#FF6B6B" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
        
        {/* Ghi chú của y tá */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ghi chú của y tá (nếu có)</Text>
          <View style={styles.noteInputWrap}>
            <TextInput
              style={styles.noteInput}
              placeholder="Nhập ghi chú cho bác sĩ hoặc người hiến máu..."
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
          style={[styles.submitButton, (isSubmitting || doctors.length === 0) && styles.submitButtonDisabled]}
          onPress={handleCreate}
          disabled={isSubmitting || doctors.length === 0}
        >
          <MaterialIcons name="check" size={20} color="#FFFFFF" />
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Đang tạo...' : doctors.length === 0 ? 'Không có bác sĩ' : 'Tạo phiếu khám'}
          </Text>
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
    paddingBottom: 10,
    paddingHorizontal: 16,
  },
  headerLeft: {
    width: 36,
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {
    width: 36,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nurseName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  facilityName: {
    color: '#fff',
    fontSize: 11,
    marginBottom: 1,
  },
  headerTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 1,
  },
  scrollContent: {
    padding: 12,
    paddingBottom: 24,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  infoLabel: {
    color: '#636E72',
    fontSize: 12,
    width: 80,
  },
  infoValue: {
    color: '#2D3436',
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  emptyDoctors: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyDoctorsText: {
    color: '#636E72',
    fontSize: 12,
    fontStyle: 'italic',
  },
  doctorList: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 3,
  },
  doctorCard: {
    width: 160,
    height: 180,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    alignItems: 'flex-start',
    padding: 12,
    marginRight: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    position: 'relative',
  },
  doctorCardSelected: {
    backgroundColor: '#FFEAEA',
    borderColor: '#FF6B6B',
    borderWidth: 2,
  },
  doctorAvatarWrap: {
    marginBottom: 8,
    alignSelf: 'center',
    position: 'relative',
  },
  doctorAvatarBorder: {
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: 28,
    padding: 2,
  },
  doctorAvatarShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  doctorAvatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doctorAvatarInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doctorNameCard: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2D3436',
    textAlign: 'center',
    marginBottom: 4,
    lineHeight: 16,
  },
  doctorCount: {
    fontSize: 10,
    color: '#636E72',
    textAlign: 'center',
    marginBottom: 2,
  },
  footer: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  submitButton: {
    backgroundColor: '#FF6B6B',
    height: 48,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  noteInputWrap: {
    marginTop: 3,
  },
  noteInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 10,
    minHeight: 50,
    fontSize: 13,
    color: '#2D3436',
  },
  positionBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  positionText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  doctorInfo: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  doctorContact: {
    fontSize: 11,
    color: '#636E72',
    textAlign: 'center',
    marginLeft: 4,
    flex: 1,
  },
  doctorEmail: {
    fontSize: 10,
    color: '#636E72',
    textAlign: 'center',
    fontStyle: 'italic',
    marginLeft: 4,
    flex: 1,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
});

export default HealthCheckCreateFromDonorScreen;