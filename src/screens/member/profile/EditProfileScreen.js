import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Modal,
  Platform,
  SafeAreaView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import userAPI from "@/apis/userAPI";
import { formatDate } from "@/utils/formatHelpers";
import bloodGroupAPI from "@/apis/bloodGroup";

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function EditProfileScreen({ navigation }) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    bloodId: "",
    address: "",
    yob: "",
    avatar: null,
  });
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showBloodTypeModal, setShowBloodTypeModal] = useState(false);
  const [bloodGroups, setBloodGroups] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tempDate, setTempDate] = useState(null);

  useEffect(() => {
    fetchUserInfo();
    fetchBloodGroups();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS !== "web") {
      const { status: cameraStatus } =
        await ImagePicker.requestCameraPermissionsAsync();
      const { status: libraryStatus } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (cameraStatus !== "granted" || libraryStatus !== "granted") {
        Alert.alert(
          "Cần quyền truy cập",
          "Vui lòng cấp quyền truy cập camera và thư viện ảnh"
        );
      }
    }
  };

  const fetchBloodGroups = async () => {
    try {
      const response = await bloodGroupAPI.HandleBloodGroup("/");
      if (response.status === 200) {
        setBloodGroups(response.data);
      }
    } catch (error) {
      console.error("Error fetching blood groups:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách nhóm máu");
    }
  };
  const fetchUserInfo = async () => {
    try {
      const response = await userAPI.HandleUser("/me");
      const userData = response.data;
      setFormData({
        fullName: userData.fullName || "",
        email: userData.email || "",
        phone: userData.phone || "",
        bloodId: userData.bloodId || "",
        address: userData.address || "",
        yob: userData.yob ? formatDate(userData.yob) : "",
        avatar: userData.avatar || null,
      });
    } catch (error) {
      console.error("Error fetching user info:", error);
      Alert.alert("Lỗi", "Không thể tải thông tin người dùng");
    }
  };

  const handleSave = async () => {
    if (!formData.bloodId) {
      Alert.alert("Thông báo", "Vui lòng chọn nhóm máu");
      return;
    }

    setLoading(true);
    try {
      await userAPI.HandleUser("/update", {
        method: "PUT",
        data: {
          fullName: formData.fullName,
          phone: formData.phone,
          bloodId: formData.bloodId._id,
          address: formData.address,
          yob: formData.yob,
        },
      });
      Alert.alert("Thành công", "Cập nhật thông tin thành công", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Lỗi", "Không thể cập nhật thông tin");
    } finally {
      setLoading(false);
    }
  };

  const handleImagePick = async (type) => {
    try {
      let result;
      if (type === "camera") {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.5,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.5,
        });
      }

      if (!result.canceled) {
        setFormData({ ...formData, avatar: result.assets[0].uri });
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Lỗi", "Không thể chọn ảnh");
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      "Chọn ảnh đại diện",
      "Bạn muốn chọn ảnh từ đâu?",
      [
        {
          text: "Chụp ảnh mới",
          onPress: () => handleImagePick("camera"),
        },
        {
          text: "Chọn từ thư viện",
          onPress: () => handleImagePick("library"),
        },
        {
          text: "Hủy",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

  const handleDateChange = (event, date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (date) {
      setTempDate(date);
    }
  };

  const handleConfirmDate = () => {
    if (tempDate) {
      setSelectedDate(tempDate);
      setFormData({ ...formData, yob: formatDate(tempDate) });
    }
    setShowDatePicker(false);
  };

  const handleCancelDate = () => {
    setTempDate(null);
    setShowDatePicker(false);
  };

  const renderInput = (
    label,
    key,
    placeholder,
    keyboardType = "default",
    onPress = null
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={onPress}
        disabled={!onPress}
      >
        <TextInput
          style={[styles.textInput, !onPress && { flex: 1 }]}
          value={formData[key]}
          onChangeText={(text) => setFormData({ ...formData, [key]: text })}
          placeholder={placeholder}
          keyboardType={keyboardType}
          editable={!onPress && key !== "email"}
        />
        {onPress && (
          <MaterialIcons name="calendar-today" size={24} color="#95A5A6" />
        )}
      </TouchableOpacity>
    </View>
  );

  const renderBloodTypeSelector = () => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>Nhóm máu</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowBloodTypeModal(true)}
      >
        <Text style={[styles.textInput, { flex: 1 }]}>
          {formData.bloodId?.name || "Chọn nhóm máu"}
        </Text>
        <MaterialIcons name="arrow-drop-down" size={24} color="#95A5A6" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chỉnh sửa hồ sơ</Text>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? "Đang lưu..." : "Lưu"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <Image
            source={{
              uri: formData.avatar || "https://example.com/avatar.jpg",
            }}
            style={styles.avatar}
          />
          <TouchableOpacity
            style={styles.changeAvatarButton}
            onPress={showImagePickerOptions}
          >
            <Text style={styles.changeAvatarText}>Thay đổi ảnh đại diện</Text>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        {renderInput("Họ và tên", "fullName", "Nhập họ và tên")}
        {renderInput("Email", "email", "Nhập email", "email-address")}
        {renderInput(
          "Số điện thoại",
          "phone",
          "Nhập số điện thoại",
          "phone-pad"
        )}
        {renderBloodTypeSelector()}
        {renderInput("Địa chỉ", "address", "Nhập địa chỉ")}
        {renderInput("Ngày sinh", "yob", "DD/MM/YYYY", "default", () =>
          setShowDatePicker(true)
        )}
      </ScrollView>

      {/* Blood Type Modal */}
      <Modal
        visible={showBloodTypeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBloodTypeModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowBloodTypeModal(false)}>
                <MaterialIcons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <View style={styles.bloodTypeList}>
              {bloodGroups.map((group) => (
                <TouchableOpacity
                  key={group._id}
                  style={[
                    styles.bloodTypeItem,
                    formData.bloodId?._id === group._id &&
                      styles.bloodTypeItemSelected,
                  ]}
                  onPress={() => {
                    setFormData({ ...formData, bloodId: group });
                    setShowBloodTypeModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.bloodTypeItemText,
                      formData.bloodId?._id === group._id &&
                        styles.bloodTypeItemTextSelected,
                    ]}
                  >
                    {group.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <Modal
          visible={showDatePicker}
          transparent
          animationType="fade"
          onRequestClose={handleCancelDate}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Chọn ngày sinh</Text>
                <TouchableOpacity onPress={handleCancelDate}>
                  <MaterialIcons name="close" size={24} color="#000" />
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate || selectedDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleDateChange}
                maximumDate={new Date()}
                minimumDate={new Date(1900, 0, 1)}
              />
              {Platform.OS === "ios" && (
                <View style={styles.datePickerButtons}>
                  <TouchableOpacity
                    style={[styles.datePickerButton, styles.cancelButton]}
                    onPress={handleCancelDate}
                  >
                    <Text style={styles.cancelButtonText}>Hủy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.datePickerButton, styles.confirmButton]}
                    onPress={handleConfirmDate}
                  >
                    <Text style={styles.confirmButtonText}>Xác nhận</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D3436",
  },
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    color: "#FF6B6B",
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  changeAvatarButton: {
    padding: 8,
  },
  changeAvatarText: {
    color: "#FF6B6B",
    fontSize: 16,
    fontWeight: "500",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#2D3436",
    marginBottom: 8,
    fontWeight: "500",
  },
  textInput: {
    fontSize: 16,
    color: "#2D3436",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    flexDirection: "row",
    alignItems: "center",
  },
  bloodTypeList: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  bloodTypeItem: {
    width: "25%",
    padding: 4,
  },
  bloodTypeItemSelected: {
    backgroundColor: "#FF6B6B",
    borderRadius: 8,
  },
  bloodTypeItemText: {
    fontSize: 16,
    color: "#2D3436",
    textAlign: "center",
    padding: 12,
  },
  bloodTypeItemTextSelected: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D3436",
  },
  datePickerButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E9ECEF",
  },
  datePickerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: "#E9ECEF",
  },
  confirmButton: {
    backgroundColor: "#FF6B6B",
  },
  cancelButtonText: {
    color: "#2D3436",
    fontSize: 16,
    fontWeight: "500",
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
});
