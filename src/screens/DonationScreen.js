import React, { useState } from "react";
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

export default function DonationScreen({ navigation }) {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [note, setNote] = useState("");

  const timeSlots = [
    "08:00 - 09:00",
    "09:00 - 10:00",
    "10:00 - 11:00",
    "13:00 - 14:00",
    "14:00 - 15:00",
    "15:00 - 16:00",
  ];

  const handleSubmit = () => {
    // Handle donation registration
    console.log({ selectedDate, selectedTime, note });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
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

        {/* Time Slots */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chọn giờ</Text>
          <View style={styles.timeSlotGrid}>
            {timeSlots.map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.timeSlot,
                  selectedTime === time && styles.selectedTimeSlot,
                ]}
                onPress={() => setSelectedTime(time)}
              >
                <Text
                  style={[
                    styles.timeSlotText,
                    selectedTime === time && styles.selectedTimeSlotText,
                  ]}
                >
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Note Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ghi chú</Text>
          <TextInput
            style={styles.noteInput}
            multiline
            numberOfLines={4}
            placeholder="Thêm ghi chú về tình trạng sức khỏe hoặc yêu cầu đặc biệt..."
            value={note}
            onChangeText={setNote}
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
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Đăng ký hiến máu</Text>
        </TouchableOpacity>
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
  timeSlotGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  timeSlot: {
    width: "48%",
    padding: 16,
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  selectedTimeSlot: {
    backgroundColor: "#FF6B6B",
    borderColor: "#FF6B6B",
  },
  timeSlotText: {
    color: "#2D3436",
    fontSize: 16,
  },
  selectedTimeSlotText: {
    color: "#FFF",
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
