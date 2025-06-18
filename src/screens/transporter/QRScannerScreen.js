import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Dimensions,
  ActivityIndicator,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Camera, CameraView } from "expo-camera";
import { useFocusEffect } from "@react-navigation/native";
import Header from "@/components/Header";
import bloodDeliveryAPI from "@/apis/bloodDeliveryAPI";
import { useFacility } from "@/contexts/FacilityContext";
import Toast from "react-native-toast-message";

const QRScannerScreen = ({ navigation, route }) => {
  const {
    mode,
    expectedDeliveryId,
    expectedType,
    expectedRequestId,
    expectedFacilityId,
    expectedRecipientId,
  } = route.params || {};
  const { facilityId } = useFacility();
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [flashMode, setFlashMode] = useState("off");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  // Refs for controlling scan state
  const isScanning = useRef(false);
  const processingRef = useRef(false);

  useEffect(() => {
    const requestPermission = async () => {
      try {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === "granted");
      } catch (error) {
        console.error("Camera permission error:", error);
        setHasPermission(false);
      }
    };

    requestPermission();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      // Reset scanner states when screen focuses
      setScanned(false);
      setIsProcessing(false);
      isScanning.current = false;
      processingRef.current = false;
      
      // Small delay to ensure proper camera mounting
      const timer = setTimeout(() => {
        setIsFocused(true);
      }, 100);
      
      // Cleanup when screen blurs
      return () => {
        clearTimeout(timer);
        setIsFocused(false);
        setScanned(false);
        setIsProcessing(false);
        isScanning.current = false;
        processingRef.current = false;
      };
    }, [])
  );

  const handleDeliveryVerification = async (qrData) => {
    try {
      const { deliveryId, facilityId, recipientId, requestId, type } = qrData;
      
      // Validate QR code format and content
      console.log(expectedRequestId, qrData.requestId);
      if (mode === "delivery_verification") {
        if (qrData.type !== expectedType) {
          throw new Error("Loại QR không hợp lệ");
        }
        if (qrData.requestId !== expectedRequestId) {
          throw new Error("Mã yêu cầu máu không hợp lệ");
        }
        if (qrData.facilityId !== expectedFacilityId) {
          throw new Error("Mã cơ sở không hợp lệ");
        }
        if (qrData.recipientId !== expectedRecipientId) {
          throw new Error("Mã người nhận không hợp lệ");
        }
        if (qrData.deliveryId !== expectedDeliveryId) {
          throw new Error("Mã đơn giao hàng không hợp lệ");
        }
      }

      // Call API to complete delivery
      const response = await bloodDeliveryAPI.HandleBloodDelivery(
        `/${deliveryId}/complete`,
        {
          facilityId,
          recipientId,
          requestId,
          type,
        },
        "put"
      );

      if (response.status === 200) {
        Toast.show({
          type: "success",
          text1: "Thành công",
          text2: "Xác nhận giao hàng thành công!",
        });
        navigation.navigate("TabNavigatorTransporter", {
          screen: "DeliveryList"
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: error.message || "Không thể xác nhận giao hàng. Vui lòng thử lại sau.",
      });
      setScanned(false);
      isScanning.current = false;
    }
  };

  const handleBarCodeScanned = async ({ type, data }) => {
    // Check both ref and state to prevent multiple scans
    if (isScanning.current || processingRef.current) {
      return;
    }
    
    try {
      // Set both ref and state
      isScanning.current = true;
      processingRef.current = true;
      setScanned(true);
      setIsProcessing(true);

      let qrData;
      try {
        qrData = JSON.parse(data);
      } catch (error) {
        throw new Error("Mã QR không hợp lệ");
      }

      await handleDeliveryVerification(qrData);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: error.message || "Mã QR không hợp lệ. Vui lòng thử lại.",
      });
      setScanned(false);
      isScanning.current = false;
    } finally {
      setIsProcessing(false);
      processingRef.current = false;
    }
  };

  const resetScanner = () => {
    setScanned(false);
    isScanning.current = false;
    processingRef.current = false;
    setIsProcessing(false);
  };

  const toggleFlash = () => {
    setFlashMode(flashMode === "off" ? "torch" : "off");
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Quét mã QR" showBackButton />
        <View style={styles.messageContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={styles.message}>
            Đang yêu cầu quyền truy cập camera...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Quét mã QR" showBackButton />
        <View style={styles.messageContainer}>
          <MaterialIcons name="camera-off" size={64} color="#FF6B6B" />
          <Text style={styles.message}>Không có quyền truy cập camera</Text>
          <Text style={styles.subMessage}>
            Ứng dụng cần quyền camera để quét mã QR
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Quét mã QR" showBackButton />
      <View style={styles.cameraContainer}>
        {hasPermission && isFocused ? (
          <>
            <CameraView
              style={styles.camera}
              barCodeScannerSettings={{
                barCodeTypes: ["qr"],
              }}
              onBarcodeScanned={(!isScanning.current && !processingRef.current) ? handleBarCodeScanned : undefined}
              flash={flashMode}
            />

            {/* Overlay with absolute positioning */}
            <View style={[styles.overlay, StyleSheet.absoluteFill]}>
              <View style={styles.unfocusedContainer}></View>
              <View style={styles.middleContainer}>
                <View style={styles.unfocusedContainer}></View>
                <View style={styles.focusedContainer}>
                  {/* Scanner frame corners */}
                  <View style={[styles.cornerTopLeft, styles.corner]} />
                  <View style={[styles.cornerTopRight, styles.corner]} />
                  <View style={[styles.cornerBottomLeft, styles.corner]} />
                  <View style={[styles.cornerBottomRight, styles.corner]} />
                </View>
                <View style={styles.unfocusedContainer}></View>
              </View>
              <View style={styles.unfocusedContainer}></View>
            </View>
          </>
        ) : (
          <View style={styles.cameraPlaceholder}>
            <MaterialIcons 
              name="camera-alt" 
              size={64} 
              color="#FFFFFF" 
            />
            <Text style={styles.placeholderText}>
              Đang khởi tạo camera...
            </Text>
          </View>
        )}

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlButton} onPress={toggleFlash}>
            <MaterialIcons
              name={flashMode === "torch" ? "flash-on" : "flash-off"}
              size={24}
              color="white"
            />
          </TouchableOpacity>

          {scanned && !isProcessing && (
            <TouchableOpacity
              style={styles.controlButton}
              onPress={resetScanner}
            >
              <MaterialIcons name="refresh" size={24} color="white" />
            </TouchableOpacity>
          )}
        </View>

        {/* Guide Text */}
        <View style={styles.guideContainer}>
          {isProcessing ? (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="small" color="white" />
              <Text style={styles.processingText}>Đang xử lý...</Text>
            </View>
          ) : (
            <Text style={styles.guideText}>
              {scanned ? "Nhấn nút làm mới để quét lại" : "Đặt mã QR vào khung hình để quét"}
            </Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const CORNER_SIZE = 40;
const { width } = Dimensions.get("window");
const FRAME_SIZE = width * 0.7;
const CORNER_BORDER_WIDTH = 4;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingTop: Platform.OS === "android" ? 40 : 0,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  messageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    gap: 16,
  },
  message: {
    fontSize: 16,
    color: "white",
    textAlign: "center",
    marginBottom: 8,
  },
  subMessage: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  overlay: {
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  unfocusedContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  middleContainer: {
    flexDirection: "row",
    height: FRAME_SIZE,
  },
  focusedContainer: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
  },
  corner: {
    position: "absolute",
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: "#FF6B6B",
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderLeftWidth: CORNER_BORDER_WIDTH,
    borderTopWidth: CORNER_BORDER_WIDTH,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderRightWidth: CORNER_BORDER_WIDTH,
    borderTopWidth: CORNER_BORDER_WIDTH,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderLeftWidth: CORNER_BORDER_WIDTH,
    borderBottomWidth: CORNER_BORDER_WIDTH,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderRightWidth: CORNER_BORDER_WIDTH,
    borderBottomWidth: CORNER_BORDER_WIDTH,
  },
  controls: {
    position: "absolute",
    top: 20,
    right: 20,
    gap: 10,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  guideContainer: {
    position: "absolute",
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  guideText: {
    color: "white",
    fontSize: 14,
    textAlign: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  processingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
    gap: 8,
  },
  processingText: {
    color: "white",
    fontSize: 14,
  },
  cameraPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    marginTop: 16,
  },
});

export default QRScannerScreen;
