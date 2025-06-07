import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import bloodInventoryAPI from "@/apis/bloodInventoryAPI";
import { useFacility } from "@/contexts/FacilityContext";
import { useNavigation } from "@react-navigation/native";
import bloodRequestAPI from "@/apis/bloodRequestAPI";
import { useSelector } from "react-redux";
import { authSelector } from "@/redux/reducers/authReducer";

export default function ApproveBloodRequestModal({
  visible,
  onClose,
  request,
  handleApproveReceive,
}) {
  const { user } = useSelector(authSelector);
  const { facilityId } = useFacility();
  const navigation = useNavigation();
  const [availableUnits, setAvailableUnits] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      fetchAvailableUnits();
    }
  }, [visible]);

  const fetchAvailableUnits = async () => {
    try {
      setLoading(true);
      const response = await bloodInventoryAPI.HandleBloodInventory(
        `/facility/${facilityId}/available?groupId=${request.groupId._id}&componentId=${request.componentId._id}`
      );
      if (response.status === 200) {
        setAvailableUnits(response.data.totalQuantity || 0);
      }
    } catch (error) {
      console.error("Error fetching available units:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNeedSupport = async () => {
    try {
      const response = await bloodRequestAPI.HandleBloodRequest(
        `/facility/${facilityId}/${request._id}/status`,
        {
          staffId: user._id,
          status: "approved",
          needsSupport: true,
        },
        "patch"
      );
      if (response.status === 200) {
        Alert.alert("Thành công", "Đã đánh dấu cần hỗ trợ");
        onClose();
        navigation.navigate("SupportRequestList");
      }
    } catch (error) {
      console.error("Error marking need support:", error);
    }
  };

  const handleApprove = async () => {
    if (availableUnits < request.quantity) {
      Alert.alert(
        "Không đủ máu",
        `Hiện chỉ có ${availableUnits} đơn vị máu ${request?.componentId?.name} nhóm ${request?.groupId?.name}. Bạn có muốn đánh dấu cần người hỗ trợ không?`,
        [
          {
            text: "Hủy",
            style: "cancel",
          },
          {
            text: "Đánh dấu cần hỗ trợ",
            onPress: () => {
              handleNeedSupport();
            },
          },
        ]
      );
      return;
    }

    handleApproveReceive(request._id);
    onClose();
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
            <Text style={styles.modalTitle}>Duyệt Yêu Cầu Nhận Máu</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#636E72" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Thông tin yêu cầu</Text>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Người yêu cầu:</Text>
                <Text style={styles.value}>{request.userId.fullName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Nhóm máu:</Text>
                <Text style={styles.value}>{request?.groupId?.name}</Text>
              </View>
              {request?.componentId?.name && (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Thành phần máu:</Text>
                  <Text style={styles.value}>
                    {request?.componentId?.name}
                  </Text>
                </View>
              )}
              <View style={styles.infoRow}>
                <Text style={styles.label}>Số lượng yêu cầu:</Text>
                <Text style={styles.value}>{request.quantity} đơn vị</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Kiểm tra tồn kho</Text>
              {loading ? (
                <Text style={styles.loadingText}>
                  Đang kiểm tra tồn kho...
                </Text>
              ) : (
                <>
                  <View style={styles.inventoryInfo}>
                    <Text style={styles.label}>Số đơn vị khả dụng:</Text>
                    <Text
                      style={[
                        styles.value,
                        availableUnits < request.quantity &&
                          styles.warningText,
                      ]}
                    >
                      {availableUnits} đơn vị
                    </Text>
                  </View>
                  {availableUnits < request.quantity && (
                    <View style={styles.warningContainer}>
                      <Text style={styles.warningMessage}>
                        ⚠️ Không đủ đơn vị máu để đáp ứng yêu cầu
                      </Text>
                      <Text style={styles.warningSubtext}>
                        Bạn có thể đánh dấu là đã được duyệt và cần người hỗ
                        trợ.
                      </Text>
                    </View>
                  )}
                </>
              )}
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.approveButton]}
              onPress={handleApprove}
            >
              <Text style={[styles.buttonText, styles.approveButtonText]}>
                {availableUnits < request.quantity
                  ? "Đánh dấu cần hỗ trợ"
                  : "Duyệt yêu cầu"}
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
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: "#636E72",
  },
  value: {
    fontSize: 14,
    color: "#2D3436",
    fontWeight: "500",
  },
  inventoryInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F1F2F6",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  warningText: {
    color: "#FF6B6B",
  },
  warningMessage: {
    color: "#FF6B6B",
    fontSize: 14,
    marginTop: 8,
  },
  loadingText: {
    color: "#636E72",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
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
  approveButton: {
    backgroundColor: "#2ED573",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#636E72",
  },
  approveButtonText: {
    color: "#FFFFFF",
  },
  warningContainer: {
    backgroundColor: "#FFF5F5",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  warningSubtext: {
    color: "#636E72",
    fontSize: 12,
    marginTop: 4,
  },
  disabledButton: {
    opacity: 0.7,
  },
});
