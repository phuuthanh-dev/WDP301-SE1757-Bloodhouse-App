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

export default function ScannerScreen({ route, navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [flashMode, setFlashMode] = useState('off');
  
  const mode = route.params?.mode || 'donor'; // 'donor', 'gift', or 'blood'
  const giftId = route.params?.giftId;
  const giftName = route.params?.giftName;

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
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
      default:
        Alert.alert('Lỗi', 'Chế độ quét không hợp lệ');
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
            navigation.goBack();
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
            navigation.goBack();
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
            navigation.goBack();
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
          onPress={() => navigation.goBack()}
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
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {mode === 'donor'
            ? 'Quét Mã Người Hiến'
            : mode === 'gift'
            ? 'Quét Mã Phát Quà'
            : 'Quét Mã Đơn Vị Máu'}
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
        
        <View style={styles.guideContainer}>
          <Text style={styles.guideText}>
            {mode === 'donor'
              ? 'Đặt mã định danh người hiến vào khung hình'
              : mode === 'gift'
              ? 'Đặt mã định danh người nhận quà vào khung hình'
              : 'Đặt mã đơn vị máu vào khung hình'}
          </Text>
        </View>

        {scanned && (
          <TouchableOpacity
            style={styles.rescanButton}
            onPress={() => setScanned(false)}
          >
            <MaterialIcons name="refresh" size={24} color="#FFFFFF" />
            <Text style={styles.rescanText}>Quét lại</Text>
          </TouchableOpacity>
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
}); 