import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MaterialIcons } from "@expo/vector-icons";
import { formatDateTime } from "@/utils/formatHelpers";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export default function CreateEmergencyCampaignModal({
  visible,
  onClose,
  onSubmit,
  loading,
  request,
}) {
  const [deadline, setDeadline] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [note, setNote] = useState("");

  const handleSubmit = () => {
    if (!deadline) {
      Alert.alert("Lỗi", "Vui lòng chọn thời hạn cho chiến dịch");
      return;
    }

    onSubmit({
      deadline,
      note: note.trim(),
    });
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDeadline(selectedDate);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Tạo chiến dịch khẩn cấp</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#636E72" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Thời gian người bệnh cần máu
              </Text>
              <View style={styles.requestInfoContainer}>
                <Text style={styles.requestInfoText}>
                  {format(new Date(request.preferredDate), "dd/MM/yyyy HH:mm", {
                    locale: vi,
                  })}
                </Text>
              </View>
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Thời hạn chiến dịch</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <MaterialIcons name="event" size={20} color="#FF6B6B" />
                <Text style={styles.dateText}>{formatDateTime(deadline)}</Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={deadline}
                  mode="datetime"
                  is24Hour={true}
                  display="default"
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                />
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ghi chú</Text>
              <TextInput
                style={styles.noteInput}
                placeholder="Nhập ghi chú cho chiến dịch (không bắt buộc)"
                multiline
                numberOfLines={4}
                value={note}
                onChangeText={setNote}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.infoBox}>
              <MaterialIcons name="info" size={20} color="#1E90FF" />
              <Text style={styles.infoText}>
                Hệ thống sẽ tự động thông báo đến những người hiến máu phù hợp
                trong khu vực
              </Text>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                styles.submitButton,
                loading && styles.disabledButton,
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={[styles.buttonText, styles.submitButtonText]}>
                {loading ? "Đang tạo..." : "Tạo chiến dịch"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    width: "90%",
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D3436",
  },
  modalBody: {
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3436",
    marginBottom: 12,
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F2F6",
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  dateText: {
    fontSize: 14,
    color: "#2D3436",
  },
  noteInput: {
    backgroundColor: "#F1F2F6",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#2D3436",
    minHeight: 100,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#EBF8FF",
    padding: 12,
    borderRadius: 8,
    gap: 8,
    alignItems: "flex-start",
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#2D3436",
    lineHeight: 20,
  },
  modalFooter: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E9ECEF",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F1F2F6",
  },
  submitButton: {
    backgroundColor: "#FF6B6B",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#636E72",
  },
  submitButtonText: {
    color: "#FFFFFF",
  },
  disabledButton: {
    opacity: 0.7,
  },
});
