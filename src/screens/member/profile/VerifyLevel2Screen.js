import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
  TextInput,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import userAPI from "@/apis/userAPI";
import { toast } from "sonner-native";
import { PaperProvider } from "react-native-paper";
import bloodGroupAPI from "@/apis/bloodGroup";
import { useDispatch } from "react-redux";
import { updateUser } from "@/redux/reducers/authReducer";
import { formatDate } from "@/utils/formatHelpers";

export default function VerifyLevel2Screen({ route, navigation }) {
  const { idCardData } = route.params;
  const dispatch = useDispatch();
  const [bloodGroups, setBloodGroups] = useState([]);
  const [showDropDown, setShowDropDown] = useState(false);
  const [formData, setFormData] = useState({
    idCard: idCardData.idCard || "",
    fullName: idCardData.fullName || "",
    yob: idCardData.yob
      ? formatDate(
          new Date(
            parseInt(idCardData.yob.substring(4)), // Year
            parseInt(idCardData.yob.substring(2, 4)) - 1, // Month (0-11)
            parseInt(idCardData.yob.substring(0, 2)) // Day
          ).toISOString()
        )
      : "",
    sex: idCardData.sex || "",
    address: "",
    phone: "",
    bloodId: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchBloodGroups();
  }, []);

  const fetchBloodGroups = async () => {
    try {
      const response = await bloodGroupAPI.HandleBloodGroup("/");
      if (response.status === 200) {
        setBloodGroups(response.data);
      }
    } catch (error) {
      toast.error("Không thể tải danh sách nhóm máu");
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.phone) {
      toast.error("Vui lòng nhập số điện thoại");
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      toast.error("Số điện thoại không hợp lệ");
    }

    if (!formData.address) {
      toast.error("Vui lòng nhập địa chỉ");
    }

    if (!formData.bloodId) {
      toast.error("Vui lòng chọn nhóm máu");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const [day, month, year] = formData.yob.split("/");
    const parsedYob = new Date(`${year}-${month}-${day}T00:00:00Z`);
    formData.yob = parsedYob.toISOString();

    try {
      const response = await userAPI.HandleUser(
        "/verify-level2",
        formData,
        "post"
      );
      if (response.status === 200) {
        dispatch(updateUser(response.data));
        toast.success("Xác thực thành công");
        navigation.navigate("TabNavigatorMember", {
          screen: "Hồ sơ",
        });
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xác thực");
    }
  };

  const renderInput = (
    label,
    value,
    key,
    editable = false,
    keyboardType = "default"
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          !editable && styles.disabledInput,
          errors[key] && styles.errorInput,
        ]}
        value={value}
        onChangeText={(text) =>
          setFormData((prev) => ({ ...prev, [key]: text }))
        }
        editable={editable}
        keyboardType={keyboardType}
        placeholderTextColor="#95A5A6"
      />
      {errors[key] && <Text style={styles.errorText}>{errors[key]}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <PaperProvider>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Xác thực thông tin</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin CCCD</Text>
            {renderInput("Số CCCD", formData.idCard, "idCard")}
            {renderInput("Họ và tên", formData.fullName, "fullName")}
            {renderInput("Năm sinh", formData.yob, "yob")}
            {renderInput("Giới tính", formData.sex, "sex")}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
            {renderInput(
              "Số điện thoại",
              formData.phone,
              "phone",
              true,
              "phone-pad"
            )}
            {renderInput("Địa chỉ hiện tại", formData.address, "address", true)}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nhóm máu của bạn *</Text>
              <View style={styles.bloodGroupGrid}>
                {bloodGroups.map((group) => (
                  <TouchableOpacity
                    key={group._id}
                    style={[
                      styles.bloodGroupButton,
                      formData.bloodId === group._id &&
                        styles.selectedBloodGroup,
                    ]}
                    onPress={() =>
                      setFormData((prev) => ({
                        ...prev,
                        bloodId: group._id,
                      }))
                    }
                  >
                    <Text
                      style={[
                        styles.bloodGroupText,
                        formData.bloodId === group._id &&
                          styles.selectedBloodGroup,
                      ]}
                    >
                      {group.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Xác nhận thông tin</Text>
          </TouchableOpacity>
        </ScrollView>
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
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
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
    color: "#636E72",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#2D3436",
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  disabledInput: {
    backgroundColor: "#E9ECEF",
    color: "#636E72",
  },
  errorInput: {
    borderColor: "#FF6B6B",
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 12,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: "#FF6B6B",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 32,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
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
  bloodTypeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  bloodGroupGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  bloodGroupButton: {
    width: "23%",
    margin: "1%",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  bloodGroupText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2D3436",
  },
  selectedBloodGroup: {
    backgroundColor: "#FF6B6B",
    borderColor: "#FF6B6B",
    color: "#fff",
  },
});
