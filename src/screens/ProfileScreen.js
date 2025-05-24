import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Switch,
  Platform,
  SafeAreaView,
  Alert,
  Modal,
} from "react-native";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import { useFacility } from "@/contexts/FacilityContext";
import userAPI from "@/apis/userAPI";
import { toast } from "sonner-native";
import { USER_ROLE, STAFF_ROLES, getRoleName } from "@/constants/userRole";
import { CameraView, Camera } from "expo-camera";

const VerificationBadge = ({ level }) => {
  const getBadgeStyle = () => {
    return level === 2 
      ? [styles.badge, styles.level2Badge]
      : [styles.badge, styles.level1Badge];
  };

  return (
    <View style={getBadgeStyle()}>
      <MaterialIcons 
        name={level === 2 ? "verified" : "shield"} 
        size={14} 
        color="#FFF" 
      />
      <Text style={styles.badgeText}>Mức {level}</Text>
    </View>
  );
};

export default function ProfileScreen({ navigation }) {
  const { logout } = useAuth();
  const { clearFacilityData, position } = useFacility();
  const [isAvailableToDonate, setIsAvailableToDonate] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const isStaff = STAFF_ROLES.includes(position);
  const [showScanner, setShowScanner] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [flashMode, setFlashMode] = useState("off");

  useEffect(() => {
    const fetchUserInfo = async () => {
      const response = await userAPI.HandleUser("/me");
      setUserInfo(response.data);
    };
    fetchUserInfo();
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const toggleFlash = () => {
    setFlashMode(flashMode === "torch" ? "off" : "torch");
  };

  const handleBarCodeScanned = async ({ type, data }) => {
    try {
      setScanned(true);
      // Parse QR code data
      const idCardData = parseQRCodeData(data);

      setShowScanner(false);

      navigation.navigate("VerifyLevel2Screen", { idCardData });
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xử lý mã QR");
      setScanned(false);
    }
  };

  const parseQRCodeData = (qrData) => {
    try {
      // Example QR format: số CCCD|Họ tên|Ngày sinh|Giới tính|Địa chỉ
      const [idCard, idNumberOld, fullName, yob, sex, address] = qrData.split("|");
      
      return {
        idCard,
        fullName,
        yob,
        sex,
        address,
      };
    } catch (error) {
      console.error("Error parsing QR data:", error);
      throw new Error("Invalid QR code format");
    }
  };

  const handleVerifyLevel2 = () => {
    Alert.alert("Xác thực mức 2", "Vui lòng quét mã QR trên CCCD của bạn", [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Quét mã",
        onPress: () => setShowScanner(true),
      },
    ]);
  };

  const menuItems = [
    // Only show donation history for donors
    ...(!isStaff
      ? [
          {
            icon: "history",
            title: "Lịch sử hiến máu",
            onPress: () => navigation.navigate("DonationHistory"),
          },
        ]
      : []),
    {
      icon: "person",
      title: "Thông tin cá nhân",
      onPress: () => navigation.navigate("EditProfileScreen"),
    },
    {
      icon: "security",
      title: "Bảo mật",
      onPress: () => navigation.navigate("SecurityScreen"),
    },
    {
      icon: "help",
      title: "Trợ giúp & Hỗ trợ",
      onPress: () => navigation.navigate("HelpScreen"),
    },
    {
      icon: "info",
      title: "Về chúng tôi",
      onPress: () => navigation.navigate("AboutScreen"),
    },
  ];

  const handleLogout = async () => {
    Alert.alert(
      "Xác nhận đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất không?",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Đăng xuất",
          style: "destructive",
          onPress: async () => {
            try {
              if (isStaff) {
                await clearFacilityData(); // Clear facility data for staff
              }
              await logout();
              toast.success("Đăng xuất thành công");
              // Navigation will be handled automatically by AppRouters
            } catch (error) {
              console.error("Logout error:", error);
              toast.error("Có lỗi xảy ra khi đăng xuất");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.profileInfo}>
            <Image source={{ uri: userInfo?.avatar }} style={styles.avatar} />
            <View style={styles.nameContainer}>
              <Text style={styles.name}>{userInfo?.fullName}</Text>
              <View style={styles.roleContainer}>
                {isStaff ? (
                  <Text style={styles.roleText}>{getRoleName(position)}</Text>
                ) : userInfo?.bloodGroup ? (
                  <View style={styles.bloodTypeContainer}>
                    <Text style={styles.bloodType}>{userInfo?.bloodGroup}</Text>
                  </View>
                ) : null}
              </View>
              {!isStaff && userInfo?.profileLevel && (
                <View style={styles.badgeContainer}>
                  <VerificationBadge level={userInfo.profileLevel} />
                </View>
              )}
            </View>
          </View>

          {/* Level 2 Verification Button */}
          {userInfo?.status === "active" && userInfo?.profileLevel === 1 && (
            <TouchableOpacity
              style={styles.verifyButton}
              onPress={handleVerifyLevel2}
            >
              <MaterialIcons name="qr-code-scanner" size={20} color="#FFF" />
              <Text style={styles.verifyButtonText}>
                Xác thực mức 2 (Quét QR CCCD)
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Stats Section - Only show for donors */}
        {!isStaff && (
          <TouchableOpacity
            style={styles.statsContainer}
            onPress={() => navigation.navigate("DonationHistory")}
          >
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {userInfo?.totalDonations || 0}
              </Text>
              <Text style={styles.statLabel}>Lần hiến máu</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {userInfo?.lastDonation || "Chưa có"}
              </Text>
              <Text style={styles.statLabel}>Lần hiến gần nhất</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Settings Section - Only show availability for donors */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cài đặt</Text>
          {!isStaff && (
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <MaterialIcons name="favorite" size={24} color="#FF6B6B" />
                <Text style={styles.settingText}>Sẵn sàng hiến máu</Text>
              </View>
              <Switch
                value={userInfo?.isAvailable}
                onValueChange={setIsAvailableToDonate}
                trackColor={{ false: "#E9ECEF", true: "#FF6B6B" }}
                thumbColor="#FFF"
              />
            </View>
          )}
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <MaterialIcons name="notifications" size={24} color="#FF6B6B" />
              <Text style={styles.settingText}>Thông báo</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: "#E9ECEF", true: "#FF6B6B" }}
              thumbColor="#FFF"
            />
          </View>
        </View>

        {/* Menu Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Menu</Text>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuLeft}>
                <MaterialIcons name={item.icon} size={24} color="#FF6B6B" />
                <Text style={styles.menuText}>{item.title}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#95A5A6" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialIcons name="logout" size={24} color="#FF6B6B" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* QR Scanner Modal */}
      <Modal
        visible={showScanner}
        animationType="slide"
        onRequestClose={() => setShowScanner(false)}
      >
        <SafeAreaView style={styles.scannerContainer}>
          <View style={styles.scannerHeader}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setShowScanner(false)}
            >
              <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.scannerTitle}>Quét mã QR CCCD</Text>
            <TouchableOpacity style={styles.flashButton} onPress={toggleFlash}>
              <MaterialIcons
                name={flashMode === "torch" ? "flash-on" : "flash-off"}
                size={24}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>

          {hasPermission === null ? (
            <Text style={styles.guideText}>
              Đang yêu cầu quyền truy cập camera...
            </Text>
          ) : hasPermission === false ? (
            <View style={styles.permissionContainer}>
              <Text style={styles.guideText}>
                Không có quyền truy cập camera
              </Text>
              <TouchableOpacity
                style={styles.button}
                onPress={() => setShowScanner(false)}
              >
                <Text style={styles.buttonText}>Quay lại</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.scannerContainer}>
              <CameraView
                style={StyleSheet.absoluteFillObject}
                enableTorch={flashMode === "torch"}
                barcodeScannerSettings={{
                  barcodeTypes: ["qr"],
                }}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
              />
              <View style={styles.overlay}>
                <View style={styles.scanArea} />
              </View>

              <View style={styles.guideContainer}>
                <Text style={styles.guideText}>
                  Đặt mã QR trên CCCD vào khung hình
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
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    paddingTop: Platform.OS === "android" ? 40 : 0,
  },
  header: {
    backgroundColor: "#FF6B6B",
    padding: 20,
    paddingTop: 40,
  },
  profileInfo: {
    alignItems: "center",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#FFF",
  },
  nameContainer: {
    alignItems: "center",
    marginTop: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
  },
  bloodTypeContainer: {
    backgroundColor: "#FFF",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  bloodType: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF6B6B",
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#E9ECEF",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF6B6B",
  },
  statLabel: {
    fontSize: 14,
    color: "#636E72",
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D3436",
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#2D3436",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#2D3436",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    margin: 16,
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FF6B6B",
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#FF6B6B",
    fontWeight: "bold",
  },
  updateProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
  },
  updateProfileText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
    marginRight: 4,
  },
  roleContainer: {
    marginTop: 8,
  },
  roleText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  verifyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 16,
    alignSelf: "center",
  },
  verifyButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  scannerContainer: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scannerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 20 : 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  scannerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  flashButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: "#FF6B6B",
    backgroundColor: "transparent",
  },
  guideContainer: {
    position: "absolute",
    bottom: 120,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  guideText: {
    color: "#FFFFFF",
    fontSize: 16,
    textAlign: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  rescanButton: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  rescanText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  level1Badge: {
    backgroundColor: '#FFA726',
  },
  level2Badge: {
    backgroundColor: '#4CAF50',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  badgeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 4,
  },
});
