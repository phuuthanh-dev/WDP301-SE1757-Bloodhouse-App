import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import bloodComponentAPI from "@/apis/bloodComponent";

export default function SelectBloodComponentModal({
  visible,
  onClose,
  onSelect,
  currentComponentId,
  requestId,
}) {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedComponent, setSelectedComponent] = useState(currentComponentId);

  useEffect(() => {
    if (visible) {
      fetchComponents();
      setSelectedComponent(currentComponentId);
    }
  }, [visible, currentComponentId]);

  const fetchComponents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await bloodComponentAPI.HandleBloodComponent();
      setComponents(response.data);
    } catch (error) {
      setError("Không thể tải danh sách thành phần máu");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (selectedComponent) {
      onSelect(requestId, selectedComponent);
      onClose();
    }
  };

  const handleCancel = () => {
    setSelectedComponent(currentComponentId);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chọn thành phần máu</Text>
            <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#2D3436" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF6B6B" />
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <MaterialIcons name="error" size={24} color="#FF4757" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={fetchComponents}
              >
                <Text style={styles.retryText}>Thử lại</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.componentList}>
                {components.map((component) => (
                  <TouchableOpacity
                    key={component._id}
                    style={[
                      styles.componentItem,
                      selectedComponent === component._id &&
                        styles.selectedComponent,
                    ]}
                    onPress={() => setSelectedComponent(component._id)}
                  >
                    <MaterialIcons
                      name={
                        selectedComponent === component._id
                          ? "radio-button-checked"
                          : "radio-button-unchecked"
                      }
                      size={24}
                      color={
                        selectedComponent === component._id ? "#FF6B6B" : "#636E72"
                      }
                    />
                    <Text
                      style={[
                        styles.componentText,
                        selectedComponent === component._id &&
                          styles.selectedComponentText,
                      ]}
                    >
                      {component.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={handleCancel}
                >
                  <Text style={styles.cancelButtonText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.saveButton,
                    !selectedComponent && styles.disabledButton,
                  ]}
                  onPress={handleSave}
                  disabled={!selectedComponent}
                >
                  <Text style={styles.saveButtonText}>Lưu</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    width: "90%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
  closeButton: {
    padding: 4,
  },
  loadingContainer: {
    padding: 32,
    alignItems: "center",
  },
  errorContainer: {
    padding: 32,
    alignItems: "center",
  },
  errorText: {
    marginTop: 8,
    color: "#FF4757",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#FF475720",
    borderRadius: 8,
  },
  retryText: {
    color: "#FF4757",
    fontWeight: "500",
  },
  componentList: {
    padding: 16,
  },
  componentItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#F8F9FA",
  },
  selectedComponent: {
    backgroundColor: "#FF6B6B20",
  },
  componentText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#2D3436",
  },
  selectedComponentText: {
    color: "#FF6B6B",
    fontWeight: "500",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E9ECEF",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F1F2F6",
  },
  saveButton: {
    backgroundColor: "#FF6B6B",
  },
  disabledButton: {
    backgroundColor: "#FFB1B1",
    opacity: 0.7,
  },
  cancelButtonText: {
    color: "#636E72",
    fontSize: 16,
    fontWeight: "500",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
}); 