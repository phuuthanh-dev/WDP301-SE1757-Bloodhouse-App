import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Share,
  StatusBar,
  Platform,
  Image,
  SafeAreaView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import { useSelector } from "react-redux";
import { authSelector } from "@/redux/reducers/authReducer";
import {
  Button,
  Portal,
  Modal,
  TextInput as PaperInput,
  PaperProvider,
} from "react-native-paper";
import { formatDate, formatDateTime } from "@/utils/formatHelpers";
import { Calendar } from "react-native-calendars";

export default function ReceiveRequestScreen({ navigation }) {
  const { user } = useSelector(authSelector);
  const [formData, setFormData] = useState({
    patientName: "",
    bloodType: "",
    bloodComponent: "",
    units: "",
    hospital: "",
    contactName: user?.fullName || "",
    contactPhone: user?.phone || "",
    notes: "",
    location: null,
    isUrgent: false,
    medicalDocumentUrl: null,
    preferredDate: new Date(),
    preferredTime: new Date(),
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const bloodComponents = [
    { id: "WHOLE", label: "Máu toàn phần" },
    { id: "RED_CELLS", label: "Hồng cầu" },
    { id: "PLASMA", label: "Huyết tương" },
    { id: "PLATELETS", label: "Tiểu cầu" },
  ];

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Quyền truy cập",
        "Chúng tôi cần quyền truy cập thư viện ảnh."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setFormData((prev) => ({
        ...prev,
        medicalDocumentUrl: result.assets[0].uri,
      }));
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Quyền truy cập", "Chúng tôi cần quyền truy cập camera.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setFormData((prev) => ({
        ...prev,
        medicalDocumentUrl: result.assets[0].uri,
      }));
    }
  };

  const handleLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Quyền truy cập vị trí",
          "Chúng tôi cần quyền truy cập vị trí để tìm người hiến máu gần bạn."
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setFormData((prev) => ({
        ...prev,
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
      }));
    } catch (error) {
      Alert.alert("Lỗi", "Không thể lấy vị trí của bạn.");
    }
  };

  const validateForm = () => {
    const required = [
      "patientName",
      "bloodType",
      "bloodComponent",
      "units",
      "hospital",
      "contactName",
      "contactPhone",
      "preferredDate",
      "preferredTime",
    ];

    const missing = required.filter((field) => !formData[field]);
    if (missing.length > 0) {
      Alert.alert(
        "Thiếu thông tin",
        "Vui lòng điền đầy đủ thông tin bắt buộc."
      );
      return false;
    }

    if (!formData.location) {
      Alert.alert("Thiếu vị trí", "Vui lòng cho phép truy cập vị trí của bạn.");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // TODO: Implement API call to submit emergency request
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API call
      Alert.alert(
        "Thành công",
        "Yêu cầu khẩn cấp của bạn đã được gửi. Chúng tôi sẽ thông báo ngay khi tìm được người hiến máu phù hợp.",
        [
          {
            text: "OK",
            onPress: () =>
              navigation.navigate("EmergencyStatus", { requestId: "123" }),
          },
        ]
      );
    } catch (error) {
      Alert.alert("Lỗi", "Không thể gửi yêu cầu. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message:
          "Yêu cầu hiến máu khẩn cấp!\nNhóm máu cần: " +
          formData.bloodType +
          "\nBệnh viện: " +
          formData.hospital,
        title: "Yêu cầu hiến máu khẩn cấp",
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <PaperProvider>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.title}>Yêu cầu nhận máu</Text>
            <Text style={styles.subtitle}>
              Điền thông tin chi tiết để chúng tôi có thể tìm người hiến máu phù
              hợp nhanh nhất
            </Text>
          </View>
        </View>

        <ScrollView>

          <View style={styles.form}>
            {/* Patient Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Thông tin bệnh nhân</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Tên bệnh nhân *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.patientName}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, patientName: text }))
                  }
                  placeholder="Nhập tên bệnh nhân"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Nhóm máu cần *</Text>
                <View style={styles.bloodTypeGrid}>
                  {bloodTypes.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.bloodTypeButton,
                        formData.bloodType === type && styles.selectedBloodType,
                      ]}
                      onPress={() =>
                        setFormData((prev) => ({ ...prev, bloodType: type }))
                      }
                    >
                      <Text
                        style={[
                          styles.bloodTypeText,
                          formData.bloodType === type &&
                            styles.selectedBloodTypeText,
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Thành phần máu cần *</Text>
                <View style={styles.bloodComponentGrid}>
                  {bloodComponents.map((component) => (
                    <TouchableOpacity
                      key={component.id}
                      style={[
                        styles.bloodComponentButton,
                        formData.bloodComponent === component.id &&
                          styles.selectedBloodComponent,
                      ]}
                      onPress={() =>
                        setFormData((prev) => ({
                          ...prev,
                          bloodComponent: component.id,
                        }))
                      }
                    >
                      <Text
                        style={[
                          styles.bloodComponentText,
                          formData.bloodComponent === component.id &&
                            styles.selectedBloodComponentText,
                        ]}
                      >
                        {component.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Số đơn vị cần *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.units}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, units: text }))
                  }
                  placeholder="Nhập số đơn vị máu cần"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Bệnh viện/Cơ sở y tế *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.hospital}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, hospital: text }))
                  }
                  placeholder="Nhập tên bệnh viện"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Mức độ khẩn cấp</Text>
                <TouchableOpacity
                  style={[
                    styles.urgencyButton,
                    formData.isUrgent && styles.urgentButton,
                  ]}
                  onPress={() =>
                    setFormData((prev) => ({
                      ...prev,
                      isUrgent: !prev.isUrgent,
                    }))
                  }
                >
                  <MaterialIcons
                    name={formData.isUrgent ? "error" : "info"}
                    size={24}
                    color={formData.isUrgent ? "#FFFFFF" : "#636E72"}
                  />
                  <Text
                    style={[
                      styles.urgencyText,
                      formData.isUrgent && styles.urgentText,
                    ]}
                  >
                    {formData.isUrgent ? "Khẩn cấp" : "Bình thường"}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Thời gian kỳ vọng nhận máu *</Text>
                <View style={styles.dateTimeContainer}>
                  <TouchableOpacity
                    style={[styles.dateTimeButton, { marginRight: 8 }]}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <MaterialIcons
                      name="calendar-today"
                      size={24}
                      color="#636E72"
                    />
                    <Text style={styles.dateTimeButtonText}>
                      {formatDate(formData.preferredDate)}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.dateTimeButton}
                    onPress={() => setShowTimePicker(true)}
                  >
                    <MaterialIcons
                      name="access-time"
                      size={24}
                      color="#636E72"
                    />
                    <Text style={styles.dateTimeButtonText}>
                      {formatDateTime(formData.preferredTime)}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Giấy tờ y tế (không bắt buộc)</Text>
                <View style={styles.documentContainer}>
                  {formData.medicalDocumentUrl ? (
                    <View style={styles.documentPreview}>
                      <Image
                        source={{ uri: formData.medicalDocumentUrl }}
                        style={styles.documentImage}
                      />
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() =>
                          setFormData((prev) => ({
                            ...prev,
                            medicalDocumentUrl: null,
                          }))
                        }
                      >
                        <MaterialIcons name="close" size={20} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.documentActions}>
                      <TouchableOpacity
                        style={styles.documentButton}
                        onPress={pickImage}
                      >
                        <MaterialIcons
                          name="photo-library"
                          size={24}
                          color="#636E72"
                        />
                        <Text style={styles.documentButtonText}>
                          Chọn từ thư viện
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.documentButton}
                        onPress={takePhoto}
                      >
                        <MaterialIcons
                          name="camera-alt"
                          size={24}
                          color="#636E72"
                        />
                        <Text style={styles.documentButtonText}>Chụp ảnh</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Contact Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Tên người liên hệ *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.contactName}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, contactName: text }))
                  }
                  placeholder="Nhập tên người liên hệ"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Số điện thoại *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.contactPhone}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, contactPhone: text }))
                  }
                  placeholder="Nhập số điện thoại"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Ghi chú thêm</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.notes}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, notes: text }))
                  }
                  placeholder="Nhập thông tin thêm nếu cần"
                  multiline
                  numberOfLines={4}
                />
              </View>
            </View>

            {/* Location */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Vị trí</Text>
              <TouchableOpacity
                style={styles.locationButton}
                onPress={handleLocationPermission}
              >
                <MaterialIcons name="location-on" size={24} color="#FF6B6B" />
                <Text style={styles.locationButtonText}>
                  {formData.location
                    ? "Đã lấy vị trí của bạn"
                    : "Cho phép truy cập vị trí"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                loading && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? "Đang gửi yêu cầu..." : "Gửi yêu cầu"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Date Picker Modal */}
        <Portal>
          <Modal
            visible={showDatePicker}
            onDismiss={() => setShowDatePicker(false)}
            contentContainerStyle={styles.modalContainer}
          >
            <View style={styles.calendarContainer}>
              <Calendar
                current={formData.preferredDate}
                minDate={new Date().toISOString()}
                onDayPress={(day) => {
                  setFormData((prev) => ({
                    ...prev,
                    preferredDate: new Date(day.timestamp),
                  }));
                  setShowDatePicker(false);
                }}
                markedDates={{
                  [formData.preferredDate.toISOString().split("T")[0]]: {
                    selected: true,
                    selectedColor: "#FF6B6B",
                  },
                }}
                theme={{
                  todayTextColor: "#FF6B6B",
                  selectedDayBackgroundColor: "#FF6B6B",
                  arrowColor: "#FF6B6B",
                }}
              />
            </View>
          </Modal>
        </Portal>

        {/* Time Picker Modal */}
        <Portal>
          <Modal
            visible={showTimePicker}
            onDismiss={() => setShowTimePicker(false)}
            contentContainerStyle={styles.modalContainer}
          >
            <View style={styles.timePickerContainer}>
              <Text style={styles.timePickerTitle}>Chọn thời gian</Text>
              <View style={styles.timeInputsContainer}>
                <PaperInput
                  mode="outlined"
                  label="Giờ"
                  value={formData.preferredTime.getHours().toString()}
                  keyboardType="number-pad"
                  style={styles.timeInput}
                  onChangeText={(text) => {
                    const hours = Math.min(
                      Math.max(parseInt(text) || 0, 0),
                      23
                    );
                    const newTime = new Date(formData.preferredTime);
                    newTime.setHours(hours);
                    setFormData((prev) => ({
                      ...prev,
                      preferredTime: newTime,
                    }));
                  }}
                />
                <Text style={styles.timeSeparator}>:</Text>
                <PaperInput
                  mode="outlined"
                  label="Phút"
                  value={formData.preferredTime.getMinutes().toString()}
                  keyboardType="number-pad"
                  style={styles.timeInput}
                  onChangeText={(text) => {
                    const minutes = Math.min(
                      Math.max(parseInt(text) || 0, 0),
                      59
                    );
                    const newTime = new Date(formData.preferredTime);
                    newTime.setMinutes(minutes);
                    setFormData((prev) => ({
                      ...prev,
                      preferredTime: newTime,
                    }));
                  }}
                />
              </View>
              <Button
                mode="contained"
                onPress={() => setShowTimePicker(false)}
                style={styles.timeConfirmButton}
              >
                Xác nhận
              </Button>
            </View>
          </Modal>
        </Portal>
      </PaperProvider>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "flex-start",
    marginLeft: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#FFFFFF",
    opacity: 0.9,
  },
  form: {
    padding: 16,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D3436",
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: "#2D3436",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  bloodTypeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  bloodTypeButton: {
    width: "23%",
    margin: "1%",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  selectedBloodType: {
    backgroundColor: "#FF6B6B",
    borderColor: "#FF6B6B",
  },
  bloodTypeText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2D3436",
  },
  selectedBloodTypeText: {
    color: "#FFFFFF",
  },
  bloodComponentGrid: {
    flexDirection: "column",
    marginVertical: 8,
  },
  bloodComponentButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    marginBottom: 8,
    backgroundColor: "#FFFFFF",
  },
  selectedBloodComponent: {
    backgroundColor: "#FF6B6B",
    borderColor: "#FF6B6B",
  },
  bloodComponentText: {
    fontSize: 14,
    color: "#2D3436",
    textAlign: "center",
  },
  selectedBloodComponentText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  urgencyButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  urgentButton: {
    backgroundColor: "#FF6B6B",
    borderColor: "#FF6B6B",
  },
  urgencyText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#636E72",
  },
  urgentText: {
    color: "#FFFFFF",
  },
  dateTimeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  dateTimeButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#636E72",
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    margin: 20,
    borderRadius: 12,
  },
  calendarContainer: {
    borderRadius: 12,
    overflow: "hidden",
  },
  timePickerContainer: {
    padding: 16,
  },
  timePickerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D3436",
    marginBottom: 16,
    textAlign: "center",
  },
  timeInputsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  timeInput: {
    width: 80,
  },
  timeSeparator: {
    fontSize: 24,
    marginHorizontal: 8,
    color: "#2D3436",
  },
  timeConfirmButton: {
    marginTop: 16,
    backgroundColor: "#FF6B6B",
  },
  documentContainer: {
    marginTop: 8,
  },
  documentActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  documentButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E9ECEF",
    marginHorizontal: 4,
  },
  documentButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#636E72",
  },
  documentPreview: {
    position: "relative",
    width: "100%",
    height: 200,
    borderRadius: 8,
    overflow: "hidden",
  },
  documentImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  removeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    padding: 4,
  },
  submitButton: {
    backgroundColor: "#FF6B6B",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3F3",
    padding: 16,
    borderRadius: 8,
  },
  locationButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#FF6B6B",
  },
});
