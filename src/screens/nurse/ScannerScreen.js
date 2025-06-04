import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import bloodDonationRegistrationAPI from '@/apis/bloodDonationRegistration';
import { toast } from 'sonner-native';

export default function ScannerScreen({ route, navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [flashMode, setFlashMode] = useState('off');
  const [processing, setProcessing] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const mode = route.params?.mode || 'donor'; // 'donor', 'gift', 'blood', or 'checkin'
  const giftId = route.params?.giftId;
  const giftName = route.params?.giftName;
  const registrationId = route.params?.registrationId;
  const fromTab = route.params?.fromTab || false; // Kiểm tra xem có được gọi từ tab không

  // Request camera permission khi component mount
  useEffect(() => {
    const requestPermission = async () => {
      try {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
      } catch (error) {
        console.error('Camera permission error:', error);
        setHasPermission(false);
      }
    };

    requestPermission();
  }, []);

  // Handle screen focus/blur để reset camera states
  useFocusEffect(
    React.useCallback(() => {
      // Khi screen focus
      
      // Reset scanner states
      setScanned(false);
      setProcessing(false);
      
      // Delay nhỏ để đảm bảo camera được mount đúng cách
      const timer = setTimeout(() => {
        setIsFocused(true);
      }, 100);
      
      // Cleanup khi screen blur
      return () => {
        clearTimeout(timer);
        setIsFocused(false);
        setScanned(false);
        setProcessing(false);
      };
    }, [])
  );

  // Helper function để handle navigation sau khi hoàn thành
  const handleNavigationAfterSuccess = () => {
    if (fromTab) {
      // Nếu từ tab, navigate về DonorList với refresh
      navigation.navigate('DonorList', { refresh: true });
    } else {
      // Nếu từ screen khác, goBack
      navigation.goBack();
    }
  };

  // Retry camera permission
  const retryCameraPermission = async () => {
    try {
      setHasPermission(null); // Set loading state
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      
      if (status === 'granted') {
        // Reset focus state để trigger camera remount
        setIsFocused(false);
        setTimeout(() => {
          setIsFocused(true);
        }, 100);
      }
    } catch (error) {
      console.error('Retry camera permission error:', error);
      setHasPermission(false);
    }
  };

  const handleBarCodeScanned = ({ type, data }) => {
    if (processing) return; // Prevent multiple scans
    setScanned(true);
    
    switch (mode) {
      case 'donor':
        handleDonorScan(data);
        break;
      case 'gift':
        handleGiftScan(data);
        break;
      case 'blood':
        handleBloodScan(data);
        break;
      case 'checkin':
        handleCheckInScan(data);
        break;
      default:
        Alert.alert('Lỗi', 'Chế độ quét không hợp lệ');
    }
  };

  const handleCheckInScan = async (qrData) => {
    try {
      setProcessing(true);
      
      // Parse QR code data
      let parsedData;
      try {
        parsedData = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;
      } catch (error) {
        throw new Error('QR code không đúng định dạng');
      }

      // Validate QR data structure
      if (!parsedData.registrationId) {
        throw new Error('QR code không chứa thông tin đăng ký hiến máu');
      }

      // Show confirmation dialog with better styling
      Alert.alert(
        ' Xác nhận Check-in',
        `Bạn có muốn check-in cho đăng ký hiến máu?`,
        [
          {
            text: 'Hủy bỏ',
            style: 'cancel',
            onPress: () => {
              setScanned(false);
              setProcessing(false);
            },
          },
          {
            text: ' Xác nhận',
            style: 'default',
            onPress: async () => {
              try {
                // Call check-in API
                const response = await bloodDonationRegistrationAPI.HandleBloodDonationRegistration(
                  '/check-in',
                  { qrData: qrData },
                  'post'
                );

                if (response.success || response.data) {
                  // Show success alert first
                  Alert.alert(
                    ' Check-in Thành Công!',
                    'Người hiến máu đã được check-in thành công.\nHệ thống sẽ cập nhật trạng thái ngay lập tức.',
                    [
                      {
                        text: ' Hoàn tất',
                        style: 'default',
                        onPress: () => {
                          toast.success('✅ Check-in thành công!');
                          handleNavigationAfterSuccess();
                        },
                      },
                    ]
                  );
                } else {
                  throw new Error(response.message || 'Không thể thực hiện check-in');
                }
              } catch (error) {
                console.error('Check-in error:', error);
                
                // Show detailed error dialog
                Alert.alert(
                  '❌ Check-in Thất Bại',
                  `Không thể thực hiện check-in:\n\n${error.message || 'Có lỗi xảy ra khi kết nối với máy chủ'}\n\nVui lòng thử lại hoặc liên hệ quản trị viên.`,
                  [
                    {
                      text: '🔙 Quay lại',
                      style: 'cancel',
                      onPress: () => handleNavigationAfterSuccess(),
                    },
                    {
                      text: '🔄 Thử lại',
                      style: 'default',
                      onPress: () => {
                        setScanned(false);
                        setProcessing(false);
                      },
                    },
                  ]
                );
                
                // Also show toast for immediate feedback
                toast.error(`❌ ${error.message || 'Check-in thất bại'}`);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('QR scan error:', error);
      
      Alert.alert(
        '⚠️ Lỗi Quét QR Code',
        `Không thể đọc mã QR:\n\n${error.message}\n\nVui lòng đảm bảo QR code rõ nét và đúng định dạng.`,
        [
          {
            text: '🔙 Quay lại',
            style: 'cancel',
            onPress: () => handleNavigationAfterSuccess(),
          },
          {
            text: '📷 Quét lại',
            style: 'default',
            onPress: () => {
              setScanned(false);
              setProcessing(false);
            },
          },
        ]
      );
      
      // Show toast for immediate feedback
      toast.error(`⚠️ ${error.message || 'QR code không hợp lệ'}`);
    }
  };

  const handleDonorScan = (data) => {
    // TODO: Validate donor ID format
    Alert.alert(
      'Xác nhận',
      `Đã quét mã người hiến: ${data}`,
      [
        {
          text: 'Hủy',
          style: 'cancel',
          onPress: () => setScanned(false),
        },
        {
          text: 'Xác nhận',
          onPress: () => {
            // TODO: Navigate to donor details or update status
            handleNavigationAfterSuccess();
          },
        },
      ]
    );
  };

  const handleGiftScan = (data) => {
    if (!giftId) {
      Alert.alert('Lỗi', 'Không có thông tin quà tặng');
      return;
    }

    Alert.alert(
      'Xác nhận phát quà',
      `Phát ${giftName} cho người hiến có mã: ${data}`,
      [
        {
          text: 'Hủy',
          style: 'cancel',
          onPress: () => setScanned(false),
        },
        {
          text: 'Xác nhận',
          onPress: () => {
            // TODO: Update gift distribution record
            handleNavigationAfterSuccess();
          },
        },
      ]
    );
  };

  const handleBloodScan = (data) => {
    Alert.alert(
      'Xác nhận',
      `Đã quét mã đơn vị máu: ${data}`,
      [
        {
          text: 'Hủy',
          style: 'cancel',
          onPress: () => setScanned(false),
        },
        {
          text: 'Xác nhận',
          onPress: () => {
            // TODO: Update blood unit tracking
            handleNavigationAfterSuccess();
          },
        },
      ]
    );
  };

  const toggleFlash = () => {
    setFlashMode(
      flashMode === 'torch'
        ? 'off'
        : 'torch'
    );
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Đang yêu cầu quyền truy cập camera...</Text>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Không có quyền truy cập camera</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleNavigationAfterSuccess()}
        >
          <Text style={styles.buttonText}>Quay lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => handleNavigationAfterSuccess()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {fromTab 
            ? 'Quét Mã Check-in' 
            : mode === 'donor'
            ? 'Quét Mã Người Hiến'
            : mode === 'gift'
            ? 'Quét Mã Phát Quà'
            : mode === 'blood'
            ? 'Quét Mã Đơn Vị Máu'
            : 'Quét Mã Check-in'}
        </Text>
        <TouchableOpacity style={styles.flashButton} onPress={toggleFlash}>
          <MaterialIcons
            name={flashMode === 'torch' ? 'flash-on' : 'flash-off'}
            size={24}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.scannerContainer}>
        {hasPermission && isFocused ? (
          <>
            <CameraView
              style={StyleSheet.absoluteFillObject}
              enableTorch={flashMode === 'torch'}
              barcodeScannerSettings={{
                barcodeTypes: ['qr', 'code128', 'code39'],
              }}
              onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            />
            <View style={styles.overlay}>
              <View style={styles.scanArea} />
            </View>
          </>
        ) : (
          <View style={styles.cameraPlaceholder}>
            <MaterialIcons 
              name={hasPermission === false ? "camera-off" : "camera-alt"} 
              size={64} 
              color={hasPermission === false ? "#FF6B6B" : "#FFFFFF"} 
            />
            <Text style={styles.placeholderText}>
              {hasPermission === false 
                ? 'Không có quyền truy cập camera'
                : !isFocused 
                ? 'Đang khởi tạo camera...'
                : 'Đang tải camera...'}
            </Text>
            {hasPermission === false && (
              <TouchableOpacity 
                style={styles.retryButton} 
                onPress={retryCameraPermission}
              >
                <MaterialIcons name="refresh" size={20} color="#FFFFFF" />
                <Text style={styles.retryButtonText}>Thử lại</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        
        <View style={styles.guideContainer}>
          <Text style={styles.guideText}>
            {processing 
              ? '🔄 Đang xử lý check-in...'
              : !hasPermission 
              ? 'Vui lòng cấp quyền truy cập camera'
              : !isFocused
              ? 'Đang khởi tạo camera...'
              : mode === 'donor'
              ? 'Đặt mã định danh người hiến vào khung hình'
              : mode === 'gift'
              ? 'Đặt mã định danh người nhận quà vào khung hình'
              : mode === 'blood'
              ? 'Đặt mã đơn vị máu vào khung hình'
              : 'Đặt mã đăng ký vào khung hình'}
          </Text>
        </View>

        {scanned && !processing && hasPermission && isFocused && (
          <TouchableOpacity
            style={styles.rescanButton}
            onPress={() => setScanned(false)}
          >
            <MaterialIcons name="refresh" size={24} color="#FFFFFF" />
            <Text style={styles.rescanText}>Quét lại</Text>
          </TouchableOpacity>
        )}

        {processing && (
          <View style={styles.processingContainer}>
            <View style={styles.processingCard}>
              <MaterialIcons name="hourglass-empty" size={32} color="#FF6B6B" />
              <Text style={styles.processingText}>Đang xử lý check-in...</Text>
              <Text style={styles.processingSubText}>Vui lòng đợi trong giây lát</Text>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  flashButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerContainer: {
    flex: 1,
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#FF6B6B',
    backgroundColor: 'transparent',
  },
  guideContainer: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  guideText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  rescanButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  rescanText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  button: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  processingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  processingCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  processingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  processingSubText: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
  },
  cameraPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
  },
  placeholderText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
}); 