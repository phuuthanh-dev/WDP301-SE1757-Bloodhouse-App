import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Platform,
  Modal,
  Dimensions,
  Alert,
} from "react-native";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import DropDown from "react-native-paper-dropdown";
import { authSelector } from "@/redux/reducers/authReducer";
import { useSelector } from "react-redux";
import bloodGroupAPI from "@/apis/bloodGroup";
import { toast } from "sonner-native";
import bloodDonationRegistrationAPI from "@/apis/bloodDonationRegistration";
import { Provider as PaperProvider } from "react-native-paper";
import facilityAPI from "@/apis/facilityAPI";
import userAPI from "@/apis/userAPI";

const termsAndConditions = [
  "1. Tôi xác nhận rằng tất cả thông tin cung cấp là chính xác và đầy đủ.",
  "2. Tôi hiểu rằng việc hiến máu là hoàn toàn tự nguyện và không nhận bất kỳ lợi ích vật chất nào.",
  "3. Tôi đồng ý cho phép cơ sở y tế sử dụng máu của tôi cho mục đích y tế.",
  "4. Tôi cam kết đã nghỉ ngơi đầy đủ và không sử dụng chất kích thích trước khi hiến máu.",
  "5. Tôi hiểu rằng có thể từ chối hiến máu nếu không đủ điều kiện sức khỏe.",
  "6. Tôi đồng ý tuân thủ các quy định và hướng dẫn của cơ sở y tế trong quá trình hiến máu.",
];

export default function DonationScreen({ navigation, route }) {
  const { user } = useSelector(authSelector);
  const { facilityId: routeFacilityId } = route.params || {};
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [bloodGroupId, setBloodGroupId] = useState("");
  const [showBloodGroupDropdown, setShowBloodGroupDropdown] = useState(false);
  const [expectedQuantity, setExpectedQuantity] = useState("250");
  const [showQuantityDropdown, setShowQuantityDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [facilities, setFacilities] = useState([]);
  const [facilityId, setFacilityId] = useState(routeFacilityId || "");
  const [showFacilityDropdown, setShowFacilityDropdown] = useState(false);
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [showTerms, setShowTerms] = useState(false);
  const [isConsent, setIsConsent] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [facilityResponse, userInfoResponse] = await Promise.all([
          !routeFacilityId
            ? facilityAPI.HandleFacility()
            : Promise.resolve(null),
          userAPI.HandleUser("/me"),
        ]);

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
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      }
    };

    fetchData();
  }, [routeFacilityId]);

  const quantities = [
    { label: "250ml", value: "250" },
    { label: "350ml", value: "350" },
    { label: "450ml", value: "450" },
  ];

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

  const handleSubmit = async () => {
    if (!userInfo) {
      toast.error("Không thể tải thông tin người dùng");
      return;
    }

    if (userInfo.profileLevel !== 2) {
      Alert.alert(
        "Yêu cầu xác thực",
        "Bạn cần xác thực thông tin cá nhân ở mức 2 để có thể hiến máu. Bạn có muốn cập nhật ngay?",
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

    if (!isConsent) {
      toast.error("Vui lòng đọc và đồng ý với điều khoản");
      return;
    }

    if (!facilityId) {
      toast.error("Vui lòng chọn cơ sở y tế");
      return;
    }
    if (!selectedDate) {
      toast.error("Vui lòng chọn ngày");
      return;
    }

    // Combine date and time
    const preferredDate = new Date(selectedDate);
    const timeDate = new Date(selectedTime);
    preferredDate.setHours(timeDate.getHours());
    preferredDate.setMinutes(timeDate.getMinutes());

    // Handle donation registration
    setLoading(true);
    try {
      const response =
        await bloodDonationRegistrationAPI.HandleBloodDonationRegistration(
          "",
          {
            userId: user._id,
            facilityId,
            bloodGroupId,
            preferredDate,
            expectedQuantity,
            notes,
          },
          "post"
        );

      if (response.status === 201) {
        toast.success("Đăng ký hiến máu thành công");
        navigation.reset({
          index: 1,
          routes: [{ name: "TabNavigatorMember" }, { name: "DonationHistory" }],
        });
      }
    } catch (error) {
      console.error("Error submitting donation:", error);
      toast.error("Đăng ký thất bại. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const HealthRequirementsModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showHealthModal}
      onRequestClose={() => setShowHealthModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Điều kiện sức khỏe</Text>
            <TouchableOpacity
              onPress={() => setShowHealthModal(false)}
              style={styles.closeButton}
            >
              <MaterialIcons name="close" size={24} color="#2D3436" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            <View style={styles.requirementsList}>
              <RequirementItem
                icon="weight"
                text="Cân nặng trên 45kg"
                description="Đảm bảo sức khỏe người hiến máu"
              />
              <RequirementItem
                icon="calendar-alt"
                text="Độ tuổi 18-60"
                description="Trong độ tuổi cho phép"
              />
              <RequirementItem
                icon="heartbeat"
                text="Sức khỏe tốt"
                description="Không mắc bệnh mãn tính"
              />
              <RequirementItem
                icon="clock"
                text="Nhịn ăn trước 4 giờ"
                description="Đảm bảo kết quả xét nghiệm"
              />
              <RequirementItem
                icon="user-shield"
                text="Không có bệnh truyền nhiễm"
                description="HIV, viêm gan B, C, giang mai"
              />
              <RequirementItem
                icon="bed"
                text="Nghỉ ngơi đầy đủ"
                description="Ngủ ít nhất 6 tiếng đêm trước"
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderProfileLevelWarning = () => {
    if (!userInfo || userInfo.profileLevel !== 2) {
      return (
        <View style={styles.warningContainer}>
          <MaterialIcons name="warning" size={24} color="#FFA000" />
          <Text style={styles.warningText}>
            Bạn cần xác thực thông tin cá nhân ở mức 2 để có thể hiến máu.{" "}
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
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
              <Text style={styles.title}>Đăng ký hiến máu</Text>
              <TouchableOpacity onPress={() => setShowHealthModal(true)}>
                <Text style={styles.healthRequirementsLink}>
                  Xem điều kiện sức khỏe
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.bloodTypeContainer}>
              <Text style={styles.bloodTypeLabel}>Nhóm máu</Text>
              <Text style={styles.bloodTypeValue}>
                {userInfo?.bloodId?.name || "Chưa có"}
              </Text>
            </View>
          </View>

          {renderProfileLevelWarning()}

          {/* Main Content */}
          <View style={styles.mainContent}>
            {/* Facility Selection */}
            {!routeFacilityId && (
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Chọn cơ sở y tế</Text>
                <DropDown
                  label="Chọn cơ sở"
                  mode="outlined"
                  visible={showFacilityDropdown}
                  showDropDown={() => setShowFacilityDropdown(true)}
                  onDismiss={() => setShowFacilityDropdown(false)}
                  value={facilityId}
                  setValue={setFacilityId}
                  list={facilities}
                  activeColor="#FF6B6B"
                />
              </View>
            )}

            {/* Date and Time Selection */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Thời gian hiến máu</Text>
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
                </View>
              )}
            </View>

            {/* Expected Quantity */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Lượng máu dự kiến hiến</Text>
              <DropDown
                label="Chọn lượng máu"
                mode="outlined"
                visible={showQuantityDropdown}
                showDropDown={() => setShowQuantityDropdown(true)}
                onDismiss={() => setShowQuantityDropdown(false)}
                value={expectedQuantity}
                setValue={setExpectedQuantity}
                list={quantities}
                activeColor="#FF6B6B"
              />
            </View>

            {/* Notes */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Ghi chú</Text>
              <TextInput
                style={styles.noteInput}
                multiline
                numberOfLines={4}
                placeholder="Thêm ghi chú về tình trạng sức khỏe hoặc yêu cầu đặc biệt..."
                value={notes}
                onChangeText={setNotes}
              />
            </View>

            {/* Terms and Conditions Section */}
            <View style={styles.formSection}>
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
                {
                  backgroundColor:
                    !isConsent ||
                    loading ||
                    !userInfo ||
                    userInfo.profileLevel !== 2
                      ? "#ccc"
                      : "#FF6B6B",
                },
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
                {loading ? "Đang đăng ký..." : "Đăng ký hiến máu"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Health Requirements Modal */}
          <HealthRequirementsModal />

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
      </ScrollView>
    </SafeAreaView>
  );
}

const RequirementItem = ({ icon, text, description }) => (
  <View style={styles.requirementItem}>
    <FontAwesome5 name={icon} size={20} color="#FF6B6B" />
    <View style={styles.requirementText}>
      <Text style={styles.requirementTitle}>{text}</Text>
      <Text style={styles.requirementDescription}>{description}</Text>
    </View>
  </View>
);

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
    paddingVertical: 16,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
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
    color: "#FFF",
    marginBottom: 4,
  },
  healthRequirementsLink: {
    color: "#FFF",
    opacity: 0.9,
    fontSize: 14,
    marginTop: 4,
    textDecorationLine: "underline",
  },
  bloodTypeContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    minWidth: 80,
  },
  bloodTypeLabel: {
    color: "#FFF",
    fontSize: 12,
    opacity: 0.9,
  },
  bloodTypeValue: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  mainContent: {
    padding: 16,
  },
  formSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D3436",
    marginBottom: 16,
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
    fontSize: 14,
    color: "#2D3436",
    flex: 1,
  },
  noteInput: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    textAlignVertical: "top",
    minHeight: 120,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    fontSize: 14,
  },
  submitButton: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
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
  requirementsList: {
    gap: 16,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 12,
    gap: 16,
  },
  requirementText: {
    flex: 1,
  },
  requirementTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3436",
    marginBottom: 4,
  },
  requirementDescription: {
    fontSize: 14,
    color: "#636E72",
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
  warningContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
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
  submitButtonDisabled: {
    opacity: 0.7,
    backgroundColor: "#ccc",
  },
});
