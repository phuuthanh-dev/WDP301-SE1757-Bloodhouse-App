import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  Image,
  SafeAreaView,
  Modal,
  ActivityIndicator,
  FlatList,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import { useSelector } from "react-redux";
import { authSelector } from "@/redux/reducers/authReducer";
import {
  TextInput as PaperInput,
  Provider as PaperProvider,
} from "react-native-paper";
import DropDown from "react-native-paper-dropdown";
import DateTimePicker from "@react-native-community/datetimepicker";
import bloodGroupAPI from "@/apis/bloodGroup";
import bloodComponentAPI from "@/apis/bloodComponent";
import facilityAPI from "@/apis/facilityAPI";
import userAPI from "@/apis/userAPI";
import axios from "axios";
import { useDebouncedCallback } from "use-debounce";
import bloodRequestAPI from "@/apis/bloodRequestAPI";

const MEDICAL_CONDITIONS = [
  { label: "Tai nạn giao thông", value: "Tai nạn giao thông" },
  { label: "Thiếu máu mãn tính", value: "Thiếu máu mãn tính" },
  { label: "Bệnh tan máu bẩm sinh (Thalassemia)", value: "Thalassemia" },
  { label: "Suy tủy xương", value: "Suy tủy xương" },
  { label: "Sau phẫu thuật tim mạch", value: "Sau phẫu thuật tim mạch" },
  { label: "Xuất huyết sau sinh", value: "Xuất huyết sau sinh" },
  {
    label: "Bệnh nhân ung thư cần truyền máu",
    value: "Ung thư cần truyền máu",
  },
  { label: "Suy thận mạn cần lọc máu", value: "Suy thận mạn" },
  {
    label: "Thiếu máu cấp (xuất huyết, chấn thương...)",
    value: "Thiếu máu cấp",
  },
  { label: "Trẻ sơ sinh thiếu máu nặng", value: "Thiếu máu sơ sinh" },
  { label: "Truyền máu trong ghép tạng", value: "Ghép tạng" },
  { label: "Khác", value: "Khác" },
];

export default function ReceiveRequestScreen({ navigation, route }) {
  const { facilityId: routeFacilityId } = route.params || {};
  const { user } = useSelector(authSelector);
  const [groups, setGroups] = useState([]);
  const [components, setComponents] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [showFacilityDropdown, setShowFacilityDropdown] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isConsent, setIsConsent] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [formData, setFormData] = useState({
    patientName: user?.fullName || "",
    patientPhone: user?.phone || "",
    address: "",
    groupId: "",
    componentId: "",
    quantity: "",
    note: "",
    latitude: 0,
    longitude: 0,
    isUrgent: false,
    medicalDocumentUrl: null,
    reason: "",
    facilityId: routeFacilityId || "",
  });
  const [debouncedTxtSearch, setDebouncedTxtSearch] = useState("");
  const [txtSearch, setTxtSearch] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showOtherReason, setShowOtherReason] = useState(false);
  const [showReasonDropdown, setShowReasonDropdown] = useState(false);
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const [showComponentDropdown, setShowComponentDropdown] = useState(false);
  const [errors, setErrors] = useState({
    patientName: "",
    patientPhone: "",
    reason: "",
    groupId: "",
    componentId: "",
    quantity: "",
    address: "",
    facilityId: "",
    medicalDocumentUrl: "",
  });

  const termsAndConditions = [
    "1. Tôi xác nhận rằng tất cả thông tin cung cấp là chính xác và đầy đủ.",
    "2. Tôi hiểu rằng việc hiến máu là hoàn toàn tự nguyện và không nhận bất kỳ lợi ích vật chất nào.",
    "3. Tôi đồng ý cho phép cơ sở y tế sử dụng máu của tôi cho mục đích y tế.",
    "4. Tôi cam kết đã nghỉ ngơi đầy đủ và không sử dụng chất kích thích trước khi hiến máu.",
    "5. Tôi hiểu rằng có thể từ chối hiến máu nếu không đủ điều kiện sức khỏe.",
    "6. Tôi đồng ý tuân thủ các quy định và hướng dẫn của cơ sở y tế trong quá trình hiến máu.",
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          bloodGroupResponse,
          bloodComponentResponse,
          facilityResponse,
          userInfoResponse,
        ] = await Promise.all([
          bloodGroupAPI.HandleBloodGroup(),
          bloodComponentAPI.HandleBloodComponent(),
          !routeFacilityId
            ? facilityAPI.HandleFacility()
            : Promise.resolve(null),
          userAPI.HandleUser("/me"),
        ]);

        // Add "Không rõ" option to blood groups and components
        const componentsWithUnknown = [
          ...bloodComponentResponse.data,
          { _id: "", name: "Không rõ" },
        ];

        setGroups(
          bloodGroupResponse.data.map((group) => ({
            label: group.name,
            value: group._id,
          }))
        );

        setComponents(
          componentsWithUnknown.map((component) => ({
            label: component.name,
            value: component._id,
          }))
        );

        if (facilityResponse) {
          setFacilities(
            facilityResponse.data.result.map((facility) => ({
              label: `${facility.name}`,
              value: facility._id,
            }))
          );
        }

        if (userInfoResponse) {
          setUserInfo(userInfoResponse.data);
          setFormData((prev) => ({
            ...prev,
            patientName: userInfoResponse.data?.fullName || "",
            patientPhone: userInfoResponse.data?.phone || "",
          }));
        }
      } catch (error) {
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
      handleFormChange("medicalDocumentUrl", result.assets[0].uri);
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
      handleFormChange("medicalDocumentUrl", result.assets[0].uri);
    }
  };

  const validateField = (fieldName, value) => {
    switch (fieldName) {
      case "patientName":
        if (!value.trim()) {
          return "Vui lòng nhập tên bệnh nhân";
        }
        if (value.trim().length < 2) {
          return "Tên bệnh nhân phải có ít nhất 2 ký tự";
        }
        break;
      case "patientPhone":
        if (!value.trim()) {
          return "Vui lòng nhập số điện thoại";
        }
        if (!/^[0-9]{10}$/.test(value.trim())) {
          return "Số điện thoại không hợp lệ (phải có 10 chữ số)";
        }
        break;
      case "reason":
        if (!value) {
          return "Vui lòng chọn lý do cần máu";
        }
        break;
      case "groupId":
        if (!value) {
          return "Vui lòng chọn nhóm máu";
        }
        break;
      case "quantity":
        if (!value) {
          return "Vui lòng nhập số đơn vị cần";
        }
        if (isNaN(value) || parseInt(value) <= 0) {
          return "Số đơn vị phải là số dương";
        }
        break;
      case "address":
        if (!value.trim()) {
          return "Vui lòng nhập địa chỉ";
        }
        break;
      case "facilityId":
        if (!routeFacilityId && !value) {
          return "Vui lòng chọn cơ sở y tế";
        }
        break;
      case "medicalDocumentUrl":
        if (!value) {
          return "Vui lòng chọn tài liệu yêu cầu";
        }
        break;
      default:
        return "";
    }
    return "";
  };

  const validateAllFields = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(formData).forEach((fieldName) => {
      if (fieldName in errors) {
        const error = validateField(fieldName, formData[fieldName]);
        if (error) {
          newErrors[fieldName] = error;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  // Update form data handler
  const handleFormChange = (fieldName, value) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    // Clear error when user starts typing/selecting
    setErrors((prev) => ({ ...prev, [fieldName]: "" }));
  };

  // Update validateForm function
  const validateForm = () => {
    if (!isConsent) {
      Alert.alert(
        "Chưa đồng ý điều khoản",
        "Vui lòng đọc và đồng ý với điều khoản trước khi gửi yêu cầu"
      );
      return false;
    }

    return true;
  };

  const debouncedTxtSearchChange = useDebouncedCallback((text) => {
    setDebouncedTxtSearch(text);
    searchAddress(text);
  }, 1000);

  const handleTxtSearch = (text) => {
    setTxtSearch(text);
    debouncedTxtSearchChange(text);
  };

  const handleSubmit = async () => {
    if (!validateAllFields()) return;
    if (!userInfo) {
      Alert.alert("Lỗi", "Không thể tải thông tin người dùng");
      return;
    }

    if (userInfo.profileLevel !== 2) {
      Alert.alert(
        "Yêu cầu xác thực",
        "Bạn cần xác thực thông tin cá nhân ở mức 2 để có thể yêu cầu nhận máu. Bạn có muốn cập nhật ngay?",
        [
          {
            text: "Để sau",
            style: "cancel",
          },
          {
            text: "Cập nhật ngay",
            onPress: () =>
              navigation.navigate("TabNavigatorMember", {
                screen: "Hồ sơ",
              }),
          },
        ]
      );
      return;
    }

    if (!validateForm()) return;

    setLoading(true);
    try {
      // Create form data for multipart/form-data
      const formDataToSend = new FormData();

      formDataToSend.append(
        "preferredDate",
        selectedDate.toISOString().split("T")[0] +
          "T" +
          selectedTime.toISOString().split("T")[1]
      );

      // Append each field to FormData
      Object.keys(formData).forEach((key) => {
        if (key !== "medicalDocumentUrl") {
          formDataToSend.append(key, formData[key]);
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

      const response = await bloodRequestAPI.HandleBloodRequestFormData(
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
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể gửi yêu cầu. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event, selected) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (selected) {
      setSelectedDate(selected);
    }
  };

  const handleTimeChange = (event, selected) => {
    if (Platform.OS === "android") {
      setShowTimePicker(false);
    }

    if (selected) {
      setSelectedTime(selected);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderProfileLevelWarning = () => {
    if (!userInfo || userInfo.profileLevel !== 2) {
      return (
        <View style={styles.warningContainer}>
          <MaterialIcons name="warning" size={24} color="#FFA000" />
          <Text style={styles.warningText}>
            Bạn cần xác thực thông tin cá nhân ở mức 2 để có thể yêu cầu nhận
            máu.{" "}
            <Text
              style={styles.warningLink}
              onPress={() =>
                navigation.navigate("TabNavigatorMember", {
                  screen: "Hồ sơ",
                })
              }
            >
              Cập nhật ngay
            </Text>
          </Text>
        </View>
      );
    }
    return null;
  };

  // Search address function
  const searchAddress = async (text) => {
    if (!text) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setIsSearching(true);
    try {
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(text)}`;
      const response = await axios.get(url, {
        headers: {
          Accept: "application/json",
        },
      });
      const data = response.data.features;
      if (data && data.length > 0) {
        setAddressSuggestions(data);
        setShowSuggestions(true);
        handleFormChange("address", data[0].properties.name);
        handleFormChange("latitude", data[0].geometry.coordinates[1]);
        handleFormChange("longitude", data[0].geometry.coordinates[0]);
      } else {
        setAddressSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tìm kiếm địa chỉ. Vui lòng thử lại sau.");
    } finally {
      setIsSearching(false);
    }
  };

  // Handle address selection
  const handleSelectAddress = async (item) => {
    setFormData((prev) => ({
      ...prev,
      address: item.properties.name,
      latitude: parseFloat(item.geometry.coordinates[1]),
      longitude: parseFloat(item.geometry.coordinates[0]),
    }));
    setTxtSearch(item.properties.name);
    setShowSuggestions(false);
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

        {renderProfileLevelWarning()}

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
                    setValue={(value) => handleFormChange("facilityId", value)}
                    list={facilities}
                    activeColor="#FF6B6B"
                  />
                  {errors.facilityId ? (
                    <Text style={styles.errorText}>{errors.facilityId}</Text>
                  ) : null}
                </View>
              )}

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Tên bệnh nhân *</Text>
                <TextInput
                  style={[
                    styles.input,
                    errors.patientName && styles.inputError,
                  ]}
                  value={formData.patientName}
                  onChangeText={(text) => handleFormChange("patientName", text)}
                  placeholder="Nhập tên bệnh nhân"
                />
                {errors.patientName ? (
                  <Text style={styles.errorText}>{errors.patientName}</Text>
                ) : null}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Số điện thoại *</Text>
                <TextInput
                  style={[
                    styles.input,
                    errors.patientPhone && styles.inputError,
                  ]}
                  value={formData.patientPhone}
                  onChangeText={(text) =>
                    handleFormChange("patientPhone", text)
                  }
                  placeholder="Nhập số điện thoại"
                  keyboardType="phone-pad"
                />
                {errors.patientPhone ? (
                  <Text style={styles.errorText}>{errors.patientPhone}</Text>
                ) : null}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Lý do cần máu *</Text>
                <DropDown
                  label="Chọn lý do"
                  mode="outlined"
                  visible={showReasonDropdown}
                  showDropDown={() => setShowReasonDropdown(true)}
                  onDismiss={() => setShowReasonDropdown(false)}
                  value={formData.reason}
                  setValue={(value) => {
                    handleFormChange("reason", value);
                    setShowOtherReason(value === "Khác");
                  }}
                  list={MEDICAL_CONDITIONS}
                  activeColor="#FF6B6B"
                  style={errors.reason ? styles.dropdownError : null}
                />
                {errors.reason ? (
                  <Text style={styles.errorText}>{errors.reason}</Text>
                ) : null}
                {showOtherReason && (
                  <>
                    <TextInput
                      style={[
                        styles.input,
                        { marginTop: 8 },
                        errors.reason && styles.inputError,
                      ]}
                      value={formData.reason}
                      onChangeText={(text) => handleFormChange("reason", text)}
                      placeholder="Nhập lý do cụ thể"
                      multiline
                      numberOfLines={2}
                    />
                    {errors.reason ? (
                      <Text style={styles.errorText}>{errors.reason}</Text>
                    ) : null}
                  </>
                )}
              </View>

              <View style={styles.twoColumnContainer}>
                <View style={styles.columnContainer}>
                  <Text style={styles.label}>Nhóm máu cần *</Text>
                  <DropDown
                    label="Chọn nhóm máu"
                    mode="outlined"
                    visible={showGroupDropdown}
                    showDropDown={() => setShowGroupDropdown(true)}
                    onDismiss={() => setShowGroupDropdown(false)}
                    value={formData.groupId}
                    setValue={(value) => handleFormChange("groupId", value)}
                    list={groups}
                    activeColor="#FF6B6B"
                  />
                  {errors.groupId ? (
                    <Text style={styles.errorText}>{errors.groupId}</Text>
                  ) : null}
                </View>

                <View style={styles.columnContainer}>
                  <Text style={styles.label}>Thành phần máu cần *</Text>
                  <DropDown
                    label="Chọn thành phần"
                    mode="outlined"
                    visible={showComponentDropdown}
                    showDropDown={() => setShowComponentDropdown(true)}
                    onDismiss={() => setShowComponentDropdown(false)}
                    value={formData.componentId}
                    setValue={(value) => handleFormChange("componentId", value)}
                    list={components}
                    activeColor="#FF6B6B"
                  />
                  {errors.componentId ? (
                    <Text style={styles.errorText}>{errors.componentId}</Text>
                  ) : null}
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Số đơn vị cần *</Text>
                <TextInput
                  style={[styles.input, errors.quantity && styles.inputError]}
                  value={formData.quantity}
                  onChangeText={(text) => handleFormChange("quantity", text)}
                  placeholder="Nhập số đơn vị máu cần"
                  keyboardType="numeric"
                />
                {errors.quantity ? (
                  <Text style={styles.errorText}>{errors.quantity}</Text>
                ) : null}
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

              {/* Date and Time Selection */}
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>
                  Thời gian kỳ vọng nhận máu
                </Text>
                <View style={styles.dateTimeContainer}>
                  <View style={styles.datePickerWrapper}>
                    <Text style={styles.inputLabel}>Ngày</Text>
                    <TouchableOpacity
                      style={styles.datePickerButton}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <MaterialIcons
                        name="calendar-today"
                        size={24}
                        color="#FF6B6B"
                      />
                      <Text style={styles.dateText}>
                        {formatDate(selectedDate)}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.timePickerWrapper}>
                    <Text style={styles.inputLabel}>Giờ</Text>
                    <TouchableOpacity
                      style={styles.datePickerButton}
                      onPress={() => setShowTimePicker(true)}
                    >
                      <MaterialIcons
                        name="access-time"
                        size={24}
                        color="#FF6B6B"
                      />
                      <Text style={styles.dateText}>
                        {formatTime(selectedTime)}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {showDatePicker && (
                  <View style={styles.pickerContainer}>
                    <DateTimePicker
                      value={selectedDate}
                      mode="date"
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      onChange={handleDateChange}
                      minimumDate={new Date()}
                    />
                    {Platform.OS === "ios" && (
                      <View style={styles.pickerButtons}>
                        <TouchableOpacity
                          style={[styles.pickerButton, styles.cancelButton]}
                          onPress={() => setShowDatePicker(false)}
                        >
                          <Text style={styles.cancelButtonText}>Hủy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.pickerButton, styles.confirmButton]}
                          onPress={() => setShowDatePicker(false)}
                        >
                          <Text style={styles.confirmButtonText}>Xác nhận</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}

                {showTimePicker && (
                  <View style={styles.pickerContainer}>
                    <DateTimePicker
                      value={selectedTime}
                      mode="time"
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      onChange={handleTimeChange}
                      minuteInterval={30}
                    />
                    {Platform.OS === "ios" && (
                      <View style={styles.pickerButtons}>
                        <TouchableOpacity
                          style={[styles.pickerButton, styles.cancelButton]}
                          onPress={() => setShowTimePicker(false)}
                        >
                          <Text style={styles.cancelButtonText}>Hủy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.pickerButton, styles.confirmButton]}
                          onPress={() => setShowTimePicker(false)}
                        >
                          <Text style={styles.confirmButtonText}>Xác nhận</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}
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
              {errors.medicalDocumentUrl ? (
                <Text style={styles.errorText}>
                  {errors.medicalDocumentUrl}
                </Text>
              ) : null}
            </View>

            {/* Contact Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Thông tin cơ sở điều trị</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Địa chỉ cơ sở điều trị *</Text>
                <TextInput
                  style={[styles.input, errors.address && styles.inputError]}
                  value={txtSearch}
                  onChangeText={handleTxtSearch}
                  placeholder="Nhập địa chỉ"
                />
                {errors.address ? (
                  <Text style={styles.errorText}>{errors.address}</Text>
                ) : null}
                {isSearching && (
                  <ActivityIndicator
                    style={styles.searchingIndicator}
                    color="#FF6B6B"
                  />
                )}
                {showSuggestions && addressSuggestions.length > 0 && (
                  <View style={styles.suggestionsContainer}>
                    <ScrollView
                      style={styles.suggestionsList}
                      nestedScrollEnabled={true}
                      keyboardShouldPersistTaps="handled"
                    >
                      {addressSuggestions.map((item) => (
                        <TouchableOpacity
                          key={item.properties.osm_id.toString()}
                          style={styles.suggestionItem}
                          onPress={() => handleSelectAddress(item)}
                        >
                          <MaterialIcons
                            name="location-on"
                            size={20}
                            color="#FF6B6B"
                          />
                          <Text style={styles.suggestionText}>
                            {item.properties.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
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
                (!isConsent ||
                  loading ||
                  !userInfo ||
                  userInfo.profileLevel !== 2) &&
                  styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={
                !isConsent ||
                loading ||
                !userInfo ||
                userInfo.profileLevel !== 2
              }
            >
              <Text style={styles.submitButtonText}>
                {loading ? "Đang gửi yêu cầu..." : "Gửi yêu cầu"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Terms Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={showTerms}
          onRequestClose={() => setShowTerms(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Điều khoản và điều kiện</Text>
                <TouchableOpacity
                  onPress={() => setShowTerms(false)}
                  style={styles.closeButton}
                >
                  <MaterialIcons name="close" size={24} color="#2D3436" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalBody}>
                <View style={styles.termsList}>
                  {termsAndConditions.map((term, index) => (
                    <View key={index} style={styles.termItem}>
                      <Text style={styles.termText}>{term}</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
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
    marginTop: 16,
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
  bloodTypeGrid: undefined,
  bloodTypeButton: undefined,
  selectedBloodType: undefined,
  bloodTypeText: undefined,
  selectedBloodTypeText: undefined,
  bloodComponentGrid: undefined,
  bloodComponentButton: undefined,
  selectedBloodComponent: undefined,
  bloodComponentText: undefined,
  selectedBloodComponentText: undefined,
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
    gap: 12,
  },
  datePickerWrapper: {
    flex: 1,
  },
  timePickerWrapper: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    color: "#636E72",
    marginBottom: 8,
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  dateText: {
    flex: 1,
    fontSize: 14,
    color: "#2D3436",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: "60%",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2D3436",
  },
  closeButton: {
    padding: 8,
  },
  modalBody: {
    padding: 16,
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
  termsList: {
    gap: 16,
  },
  termItem: {
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 12,
  },
  termText: {
    fontSize: 14,
    color: "#2D3436",
    lineHeight: 20,
  },
  warningContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FFE0B2",
  },
  warningText: {
    flex: 1,
    marginLeft: 12,
    color: "#F57C00",
    fontSize: 14,
  },
  warningLink: {
    color: "#FF6B6B",
    textDecorationLine: "underline",
    fontWeight: "bold",
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
    backgroundColor: "#ccc",
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
  pickerContainer: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginTop: 8,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pickerButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
    gap: 12,
  },
  pickerButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F1F2F6",
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
    color: "#FFF",
    fontSize: 16,
    fontWeight: "500",
  },
  calendarContainer: {
    borderRadius: 12,
    overflow: "hidden",
  },
  addressInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  searchingIndicator: {
    marginRight: 10,
  },
  suggestionsContainer: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    marginTop: 4,
    zIndex: 9999,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    maxHeight: 200,
  },
  suggestionsList: {
    borderRadius: 8,
    maxHeight: 150,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
    backgroundColor: "#FFFFFF",
  },
  suggestionText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#2D3436",
    flex: 1,
  },
  twoColumnContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },
  columnContainer: {
    flex: 1,
  },
  inputError: {
    borderColor: "#FF3B30",
    borderWidth: 1,
  },
  dropdownError: {
    borderColor: "#FF3B30",
    borderWidth: 1,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});
