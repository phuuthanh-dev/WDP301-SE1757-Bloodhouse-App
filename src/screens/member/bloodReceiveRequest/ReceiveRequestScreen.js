import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
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
  Provider as PaperProvider,
} from "react-native-paper";
import DropDown from "react-native-paper-dropdown";
import { Calendar } from "react-native-calendars";
import bloodGroupAPI from "@/apis/bloodGroup";
import bloodComponentAPI from "@/apis/bloodComponent";
import facilityAPI from "@/apis/facilityAPI";
import bloodRequestAPI from "@/apis/bloodRequestAPI";

export default function ReceiveRequestScreen({ navigation, route }) {
  const { facilityId: routeFacilityId } = route.params || {};
  const { user } = useSelector(authSelector);
  const [groups, setGroups] = useState([]);
  const [components, setComponents] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [showFacilityDropdown, setShowFacilityDropdown] = useState(false);
  const [formData, setFormData] = useState({
    patientName: user?.fullName || "",
    patientPhone: user?.phone || "",
    address: user?.address || "",
    groupId: "",
    componentId: "",
    quantity: "",
    note: "",
    latitude: 0,
    longitude: 0,
    isUrgent: false,
    medicalDocumentUrl: null,
    facilityId: routeFacilityId || "",
  });
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("08:00");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isConsent, setIsConsent] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const termsAndConditions = [
    "1. Tôi xác nhận rằng tất cả thông tin cung cấp là chính xác và đầy đủ.",
    "2. Tôi hiểu rằng việc cung cấp thông tin sai lệch có thể ảnh hưởng đến quá trình nhận máu.",
    "3. Tôi đồng ý cho phép cơ sở y tế sử dụng thông tin cá nhân cho mục đích tìm kiếm người hiến máu phù hợp.",
    "4. Tôi hiểu rằng việc nhận máu phụ thuộc vào tình trạng sẵn có của nhóm máu phù hợp.",
    "5. Tôi đồng ý tuân thủ các quy định và hướng dẫn của cơ sở y tế trong quá trình nhận máu.",
    "6. Tôi hiểu rằng có thể phát sinh các chi phí liên quan đến quá trình xét nghiệm và nhận máu.",
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bloodGroupResponse, bloodComponentResponse, facilityResponse] =
          await Promise.all([
            bloodGroupAPI.HandleBloodGroup(),
            bloodComponentAPI.HandleBloodComponent(),
            !routeFacilityId
              ? facilityAPI.HandleFacility()
              : Promise.resolve(null),
          ]);

        setGroups(bloodGroupResponse.data);
        setComponents(bloodComponentResponse.data);

        if (facilityResponse) {
          setFacilities(
            facilityResponse.data.result.map((facility) => ({
              label: `${facility.name}`,
              value: facility._id,
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        Alert.alert("Lỗi", "Không thể tải dữ liệu. Vui lòng thử lại sau.");
      }
    };
    fetchData();
  }, [routeFacilityId]);

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

  const handleGetLocationPermission = async () => {
    try {
      const locations = await Location.geocodeAsync(formData.address);
      if (locations && locations.length > 0) {
        return locations[0];
      }
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert(
        "Lỗi",
        "Không thể lấy thông tin vị trí. Vui lòng thử lại sau."
      );
      return false;
    }
  };

  const validateForm = () => {
    if (!isConsent) {
      Alert.alert(
        "Chưa đồng ý điều khoản",
        "Vui lòng đọc và đồng ý với điều khoản trước khi gửi yêu cầu"
      );
      return false;
    }

    const required = [
      "patientName",
      "patientPhone",
      "groupId",
      "componentId",
      "quantity",
      "address",
      "facilityId",
    ];

    const missing = required.filter((field) => !formData[field]);
    if (missing.length > 0) {
      Alert.alert(
        "Thiếu thông tin",
        "Vui lòng điền đầy đủ thông tin bắt buộc."
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const location = await handleGetLocationPermission();

      // Create form data for multipart/form-data
      const formDataToSend = new FormData();

      // Append all text fields
      const requestData = {
        ...formData,
        latitude: location.latitude,
        longitude: location.longitude,
        consent: isConsent,
      };

      formDataToSend.append(
        "preferredDate",
        selectedDate + "T" + selectedTime + ":00"
      );

      // Append each field to FormData
      Object.keys(requestData).forEach((key) => {
        if (key !== "medicalDocumentUrl") {
          formDataToSend.append(key, requestData[key]);
        }
      });

      // Append file if exists
      if (formData.medicalDocumentUrl) {
        formDataToSend.append("medicalDocuments", {
          uri: formData.medicalDocumentUrl,
          name: `medical_document.jpg`,
          type: `image/jpeg`,
        });
      }

      const response = await bloodRequestAPI.HandleBloodRequest(
        "",
        formDataToSend,
        "post"
      );

      if (response.status === 201) {
        Alert.alert(
          "Thành công",
          "Yêu cầu nhận máu của bạn đã được gửi. Chúng tôi sẽ thông báo ngay khi có thông tin mới.",
          [
            {
              text: "OK",
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert("Lỗi", "Không thể gửi yêu cầu. Vui lòng thử lại sau.");
      }
    } catch (error) {
      console.error("Error submitting request:", error);
      Alert.alert("Lỗi", "Không thể gửi yêu cầu. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // Add helper functions for time handling
  const getHoursFromTimeString = (timeString) => {
    return timeString.split(":")[0];
  };

  const getMinutesFromTimeString = (timeString) => {
    return timeString.split(":")[1];
  };

  const formatTimeString = (hours, minutes) => {
    const formattedHours = hours.toString().padStart(2, "0");
    const formattedMinutes = minutes.toString().padStart(2, "0");
    return `${formattedHours}:${formattedMinutes}`;
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

              {/* Facility Selection - Only show if facilityId is not provided in route */}
              {!routeFacilityId && (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Chọn cơ sở y tế *</Text>
                  <DropDown
                    label="Chọn cơ sở"
                    mode="outlined"
                    visible={showFacilityDropdown}
                    showDropDown={() => setShowFacilityDropdown(true)}
                    onDismiss={() => setShowFacilityDropdown(false)}
                    value={formData.facilityId}
                    setValue={(value) =>
                      setFormData((prev) => ({ ...prev, facilityId: value }))
                    }
                    list={facilities}
                    activeColor="#FF6B6B"
                  />
                </View>
              )}

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Nhóm máu cần *</Text>
                <View style={styles.bloodTypeGrid}>
                  {groups.map((group) => (
                    <TouchableOpacity
                      key={group._id}
                      style={[
                        styles.bloodTypeButton,
                        formData.groupId === group._id &&
                          styles.selectedBloodType,
                      ]}
                      onPress={() =>
                        setFormData((prev) => ({
                          ...prev,
                          groupId: group._id,
                        }))
                      }
                    >
                      <Text
                        style={[
                          styles.bloodTypeText,
                          formData.groupId === group._id &&
                            styles.selectedBloodTypeText,
                        ]}
                      >
                        {group.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Thành phần máu cần *</Text>
                <View style={styles.bloodComponentGrid}>
                  {components.map((component) => (
                    <TouchableOpacity
                      key={component._id}
                      style={[
                        styles.bloodComponentButton,
                        formData.componentId === component._id &&
                          styles.selectedBloodComponent,
                      ]}
                      onPress={() =>
                        setFormData((prev) => ({
                          ...prev,
                          componentId: component._id,
                        }))
                      }
                    >
                      <Text
                        style={[
                          styles.bloodComponentText,
                          formData.componentId === component._id &&
                            styles.selectedBloodComponentText,
                        ]}
                      >
                        {component.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Số đơn vị cần *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.quantity}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, quantity: text }))
                  }
                  placeholder="Nhập số đơn vị máu cần"
                  keyboardType="numeric"
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
                      {selectedDate}
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
                      {selectedTime}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Giấy tờ y tế</Text>
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
              <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>

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
                <Text style={styles.label}>Số điện thoại *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.patientPhone}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, patientPhone: text }))
                  }
                  placeholder="Nhập số điện thoại"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Địa chỉ *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.address}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, address: text }))
                  }
                  placeholder="Nhập địa chỉ"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Ghi chú thêm</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.note}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, note: text }))
                  }
                  placeholder="Nhập thông tin thêm nếu cần"
                  multiline
                  numberOfLines={4}
                />
              </View>
            </View>

            {/* Terms and Conditions Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Điều khoản và điều kiện</Text>
              <View style={styles.termsContainer}>
                <TouchableOpacity
                  style={styles.viewTermsButton}
                  onPress={() => setShowTerms(true)}
                >
                  <MaterialIcons name="description" size={24} color="#FF6B6B" />
                  <Text style={styles.viewTermsText}>Xem điều khoản</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.consentButton}
                  onPress={() => setIsConsent(!isConsent)}
                >
                  <MaterialIcons
                    name={isConsent ? "check-box" : "check-box-outline-blank"}
                    size={24}
                    color={isConsent ? "#FF6B6B" : "#636E72"}
                  />
                  <Text style={styles.consentText}>
                    Tôi đã đọc và đồng ý với các điều khoản
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!isConsent || loading) && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!isConsent || loading}
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
                minDate={new Date().toISOString().split("T")[0]}
                onDayPress={(day) => {
                  setSelectedDate(day.dateString);
                  setShowDatePicker(false);
                }}
                markedDates={{
                  [selectedDate]: {
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
                  value={getHoursFromTimeString(selectedTime)}
                  keyboardType="number-pad"
                  style={styles.timeInput}
                  onChangeText={(text) => {
                    const hours = Math.min(
                      Math.max(parseInt(text) || 0, 0),
                      23
                    );
                    const minutes = parseInt(
                      getMinutesFromTimeString(selectedTime)
                    );
                    setSelectedTime(formatTimeString(hours, minutes));
                  }}
                />
                <Text style={styles.timeSeparator}>:</Text>
                <PaperInput
                  mode="outlined"
                  label="Phút"
                  value={getMinutesFromTimeString(selectedTime)}
                  keyboardType="number-pad"
                  style={styles.timeInput}
                  onChangeText={(text) => {
                    const minutes = Math.min(
                      Math.max(parseInt(text) || 0, 0),
                      59
                    );
                    const hours = parseInt(
                      getHoursFromTimeString(selectedTime)
                    );
                    setSelectedTime(formatTimeString(hours, minutes));
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

        {/* Terms Modal */}
        <Portal>
          <Modal
            visible={showTerms}
            onDismiss={() => setShowTerms(false)}
            contentContainerStyle={styles.modalContainer}
          >
            <View style={styles.termsModalContent}>
              <Text style={styles.termsModalTitle}>
                Điều khoản và điều kiện
              </Text>
              <ScrollView style={styles.termsScrollView}>
                {termsAndConditions.map((term, index) => (
                  <Text key={index} style={styles.termItem}>
                    {term}
                  </Text>
                ))}
              </ScrollView>
              <Button
                mode="contained"
                onPress={() => setShowTerms(false)}
                style={styles.termsConfirmButton}
              >
                Đã hiểu
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
  termsContainer: {
    marginTop: 8,
    gap: 12,
  },
  viewTermsButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  viewTermsText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#636E72",
    flex: 1,
  },
  consentButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  consentText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#636E72",
    flex: 1,
  },
  termsModalContent: {
    backgroundColor: "white",
    margin: 20,
    borderRadius: 12,
    padding: 20,
    maxHeight: "80%",
  },
  termsModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D3436",
    marginBottom: 16,
    textAlign: "center",
  },
  termsScrollView: {
    maxHeight: 300,
  },
  termItem: {
    marginBottom: 8,
  },
  termsConfirmButton: {
    marginTop: 16,
    backgroundColor: "#FF6B6B",
  },
});
