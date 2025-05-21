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
} from "react-native";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";
import DropDown from "react-native-paper-dropdown";
import { authSelector } from "@/redux/reducers/authReducer";
import { useSelector } from "react-redux";
import bloodGroupAPI from "@/apis/bloodGroup";
import { toast } from "sonner-native";
import bloodDonationRegistrationAPI from "@/apis/bloodDonationRegistration";
import { Provider as PaperProvider } from "react-native-paper";

export default function DonationScreen({ navigation, route }) {
  const { user } = useSelector(authSelector);
  const { facilityId } = route.params;
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("08:00");
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [bloodGroupId, setBloodGroupId] = useState("");
  const [showBloodGroupDropdown, setShowBloodGroupDropdown] = useState(false);
  const [expectedQuantity, setExpectedQuantity] = useState("250");
  const [showQuantityDropdown, setShowQuantityDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [bloodGroups, setBloodGroups] = useState([]);

  useEffect(() => {
    const getBloodGroup = async () => {
      const response = await bloodGroupAPI.HandleBloodGroup();
      setBloodGroups(response.data);
    };
    getBloodGroup();
  }, []);

  const quantities = [
    { label: "250ml", value: "250" },
    { label: "350ml", value: "350" },
    { label: "450ml", value: "450" },
  ];

  const times = Array.from({ length: 17 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8;
    const minute = i % 2 === 0 ? "00" : "30";
    const time = `${hour.toString().padStart(2, "0")}:${minute}`;
    return { label: time, value: time };
  });

  const handleSubmit = async () => {
    if (!selectedDate) {
      alert("Vui lòng chọn ngày");
      return;
    }
    if (!selectedTime) {
      alert("Vui lòng chọn giờ");
      return;
    }
    if (!bloodGroupId) {
      alert("Vui lòng chọn nhóm máu");
      return;
    }
    // Combine date and time into preferredDate
    const preferredDate = new Date(selectedDate + "T" + selectedTime + ":00");

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
          routes: [
            { name: "TabNavigatorMember" },
            { name: "DonationHistory" },
          ],
        });
        
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <PaperProvider>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Đăng ký hiến máu</Text>
            <Text style={styles.subtitle}>Chọn thời gian phù hợp với bạn</Text>
          </View>

          {/* Calendar */}
          <View style={styles.calendarContainer}>
            <Calendar
              onDayPress={(day) => setSelectedDate(day.dateString)}
              markedDates={{
                [selectedDate]: { selected: true, selectedColor: "#FF6B6B" },
              }}
              theme={{
                todayTextColor: "#FF6B6B",
                selectedDayBackgroundColor: "#FF6B6B",
                arrowColor: "#FF6B6B",
              }}
              minDate={new Date().toISOString().split("T")[0]}
            />
          </View>

          {/* Time Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chọn giờ</Text>
            <DropDown
              label="Chọn thời gian"
              mode="outlined"
              visible={showTimeDropdown}
              showDropDown={() => setShowTimeDropdown(true)}
              onDismiss={() => setShowTimeDropdown(false)}
              value={selectedTime}
              setValue={setSelectedTime}
              list={times}
              dropDownContainerMaxHeight={300}
              activeColor="#FF6B6B"
            />
          </View>

          {/* Blood Group Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nhóm máu</Text>
            <DropDown
              label="Chọn nhóm máu"
              mode="outlined"
              visible={showBloodGroupDropdown}
              showDropDown={() => setShowBloodGroupDropdown(true)}
              onDismiss={() => setShowBloodGroupDropdown(false)}
              value={bloodGroupId}
              setValue={setBloodGroupId}
              list={bloodGroups.map((group) => ({
                label: group.name,
                value: group._id,
              }))}
              activeColor="#FF6B6B"
            />
          </View>

          {/* Expected Quantity */}
          <View style={styles.section}>
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

          {/* Note Section */}
          <View style={styles.section}>
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

          {/* Health Requirements */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Điều kiện sức khỏe</Text>
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
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: loading ? "#ccc" : "#FF6B6B" },
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? "Đang đăng ký..." : "Đăng ký hiến máu"}
            </Text>
          </TouchableOpacity>
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
    padding: 20,
    backgroundColor: "#FF6B6B",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#FFF",
    opacity: 0.9,
  },
  calendarContainer: {
    backgroundColor: "#FFF",
    margin: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  dropdown: {
    marginTop: 8,
    backgroundColor: "#FFF",
    borderRadius: 12,
  },
  noteInput: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    textAlignVertical: "top",
    minHeight: 120,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  requirementsList: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  requirementText: {
    marginLeft: 16,
    flex: 1,
  },
  requirementTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2D3436",
    marginBottom: 4,
  },
  requirementDescription: {
    fontSize: 14,
    color: "#636E72",
  },
  submitButton: {
    backgroundColor: "#FF6B6B",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
