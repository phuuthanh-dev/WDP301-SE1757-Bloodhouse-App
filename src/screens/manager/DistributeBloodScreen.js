import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Image,
  FlatList,
  Modal,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import bloodUnitAPI from "@/apis/bloodUnit";
import { useFacility } from "@/contexts/FacilityContext";
import { formatDateTime } from "@/utils/formatHelpers";
import {
  TextInput,
  Button,
  Divider,
  Portal,
  Dialog,
  PaperProvider,
  RadioButton,
} from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";
import facilityStaffAPI from "@/apis/facilityStaffAPI";
import bloodRequestAPI from "@/apis/bloodRequestAPI";

export default function DistributeBloodScreen({ route, navigation }) {
  const { request } = route.params;
  const { facilityId } = useFacility();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [availableUnits, setAvailableUnits] = useState([]);
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [selectedQuantities, setSelectedQuantities] = useState({});
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [showTransporterModal, setShowTransporterModal] = useState(false);
  const [currentUnit, setCurrentUnit] = useState(null);
  const [quantityInput, setQuantityInput] = useState("");
  const [transporters, setTransporters] = useState([]);
  const [selectedTransporter, setSelectedTransporter] = useState(null);
  const [metadata, setMetadata] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [showTransporterDropdown, setShowTransporterDropdown] = useState(false);
  const [selectedTransporterData, setSelectedTransporterData] = useState(null);
  const [transporterNote, setTransporterNote] = useState("");
  const [scheduledDeliveryDate, setScheduledDeliveryDate] = useState(
    new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    fetchAvailableUnits();
  }, [metadata.page]);

  const fetchAvailableUnits = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await bloodUnitAPI.HandleBloodUnit(
        `/facility/${facilityId}?bloodGroupId=${request.groupId._id}&componentId=${request.componentId._id}&status=available&page=${metadata.page}&limit=${metadata.limit}`
      );
      setAvailableUnits(response.data.data);
      setMetadata(response.data.metadata);
    } catch (error) {
      setError("Không thể tải danh sách đơn vị máu khả dụng");
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể tải danh sách đơn vị máu khả dụng",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchAvailableUnits();
  }, []);

  const getTotalSelectedQuantity = () => {
    return Object.values(selectedQuantities).reduce((sum, qty) => sum + qty, 0);
  };

  const toggleUnitSelection = (unit) => {
    if (selectedUnits.includes(unit._id)) {
      setSelectedUnits(selectedUnits.filter((id) => id !== unit._id));
      const newQuantities = { ...selectedQuantities };
      delete newQuantities[unit._id];
      setSelectedQuantities(newQuantities);
    } else {
      setCurrentUnit(unit);
      setQuantityInput(unit?.remainingQuantity?.toString());
      setShowQuantityModal(true);
    }
  };

  const handleQuantityConfirm = () => {
    const quantity = parseInt(quantityInput);
    if (quantity > 0 && quantity <= currentUnit.remainingQuantity) {
      setSelectedUnits([...selectedUnits, currentUnit._id]);
      setSelectedQuantities({
        ...selectedQuantities,
        [currentUnit._id]: quantity,
      });
      setShowQuantityModal(false);
    } else {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Số lượng không hợp lệ",
      });
    }
  };

  const fetchTransporters = async () => {
    try {
      const response = await facilityStaffAPI.HandleFacilityStaff(
        `/facility/${facilityId}?position=TRANSPORTER`
      );
      setTransporters(response.data.result);
      if (response.data.result.length > 0) {
        setSelectedTransporter(response.data.result[0]._id);
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể tải danh sách người vận chuyển",
      });
    }
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || scheduledDeliveryDate;
    setShowDatePicker(Platform.OS === "ios");
    setScheduledDeliveryDate(currentDate);
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(Platform.OS === "ios");
    const currentTime = selectedTime || scheduledDeliveryDate;
    setScheduledDeliveryDate(currentTime);
  };

  const handleDistribute = async () => {
    if (getTotalSelectedQuantity() >= request.quantity) {
      try {
        const body = {
          facilityId,
          transporterId: selectedTransporter,
          note: transporterNote,
          scheduledDeliveryDate: scheduledDeliveryDate.toISOString(),
          bloodUnits: selectedUnits.map((unitId) => ({
            unitId,
            quantity: selectedQuantities[unitId],
          })),
        };
        setLoading(true);
        const response = await bloodRequestAPI.HandleBloodRequest(
          `/${request._id}/assign-blood-units`,
          body,
          "post"
        );
        if (response.status === 200) {
          Toast.show({
            type: "success",
            text1: "Thành công",
            text2: `${response.message}`,
          });
          navigation.navigate("TabNavigatorManager", {
            screen: "Phân phối",
          });
        }
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: "Không thể phân phối máu",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const renderBloodUnitCard = (unit) => (
    <TouchableOpacity
      key={unit._id}
      style={[
        styles.unitCard,
        selectedUnits.includes(unit._id) && styles.selectedUnit,
      ]}
      onPress={() => toggleUnitSelection(unit)}
      disabled={
        (!selectedUnits.includes(unit._id) &&
          getTotalSelectedQuantity() >= request.quantity) ||
        unit.remainingQuantity === 0
      }
    >
      <View style={styles.unitHeader}>
        <MaterialIcons
          name={
            selectedUnits.includes(unit._id)
              ? "check-box"
              : "check-box-outline-blank"
          }
          size={24}
          color={selectedUnits.includes(unit._id) ? "#FF6B6B" : "#636E72"}
        />
        <Text style={styles.unitId}>Mã đơn vị: {unit.code}</Text>
      </View>
      <Divider style={styles.divider} />
      <View style={styles.unitInfo}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Người hiến:</Text>
          <Text style={styles.value}>{unit.donationId.userId.fullName}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Số lượng đã chọn:</Text>
          <Text
            style={[
              styles.value,
              selectedQuantities[unit._id] && styles.selectedQuantityText,
            ]}
          >
            {selectedQuantities[unit._id]
              ? `${selectedQuantities[unit._id]} ml`
              : "Chưa chọn"}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Số lượng còn lại:</Text>
          <Text style={styles.value}>{unit.remainingQuantity} ml</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Nhóm máu:</Text>
          <Text style={styles.value}>{unit.bloodGroupId.name}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Thành phần máu:</Text>
          <Text style={styles.value}>{unit.componentId.name}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Ngày hiến:</Text>
          <Text style={styles.value}>
            {formatDateTime(unit.donationId.donationDate)}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Hạn sử dụng:</Text>
          <Text style={styles.value}>{formatDateTime(unit.expiresAt)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Xử lý bởi:</Text>
          <Text style={styles.value}>
            {unit.processedBy.userId.fullName} ({unit.processedBy.position})
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Kết quả xét nghiệm:</Text>
          <View style={styles.testResults}>
            {Object.entries(unit.testResults).map(
              ([test, result]) =>
                test !== "notes" && (
                  <View key={test} style={styles.testResult}>
                    <Text style={styles.testName}>
                      {test.charAt(0).toUpperCase() + test.slice(1)}:
                    </Text>
                    <Text
                      style={[
                        styles.testValue,
                        {
                          color: result === "negative" ? "#2ED573" : "#FF4757",
                        },
                      ]}
                    >
                      {result}
                    </Text>
                  </View>
                )
            )}
          </View>
        </View>
        {unit.testResults.notes && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Ghi chú xét nghiệm:</Text>
            <Text style={styles.value}>{unit.testResults.notes}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderTransporterItem = ({ item }) => (
    <TouchableOpacity
      style={styles.transporterItem}
      onPress={() => {
        setSelectedTransporter(item._id);
        setSelectedTransporterData(item);
        setShowTransporterDropdown(false);
      }}
    >
      <Image
        source={{ uri: item.userId.avatar }}
        style={styles.transporterAvatar}
      />
      <View style={styles.transporterInfo}>
        <Text style={styles.transporterName}>{item.userId.fullName}</Text>
        <Text style={styles.transporterPhone}>{item.userId.phone}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <PaperProvider>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Phân phối máu</Text>
        </View>

        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin yêu cầu</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Nhóm máu:</Text>
                <Text style={styles.value}>{request.groupId.name}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Thành phần máu:</Text>
                <Text style={styles.value}>{request.componentId.name}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Số lượng yêu cầu:</Text>
                <Text style={styles.value}>{request.quantity} đơn vị</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Đơn vị máu khả dụng</Text>
              <Text style={styles.subtitle}>
                Đã chọn: {getTotalSelectedQuantity()}/{request.quantity}ml
              </Text>
            </View>

            {loading && !refreshing ? (
              <ActivityIndicator size="large" color="#FF6B6B" />
            ) : error ? (
              <View style={styles.errorContainer}>
                <MaterialIcons name="error" size={24} color="#FF4757" />
                <Text style={styles.errorText}>{error}</Text>
                <Button mode="contained" onPress={fetchAvailableUnits}>
                  Thử lại
                </Button>
              </View>
            ) : (
              <>
                {availableUnits.map(renderBloodUnitCard)}
                <View style={styles.pagination}>
                  <Button
                    mode="outlined"
                    onPress={() =>
                      setMetadata((prev) => ({ ...prev, page: prev.page - 1 }))
                    }
                    disabled={metadata.page === 1}
                  >
                    Trang trước
                  </Button>
                  <Text style={styles.pageInfo}>
                    Trang {metadata.page}/{metadata.totalPages}
                  </Text>
                  <Button
                    mode="outlined"
                    onPress={() =>
                      setMetadata((prev) => ({ ...prev, page: prev.page + 1 }))
                    }
                    disabled={metadata.page === metadata.totalPages}
                  >
                    Trang sau
                  </Button>
                </View>
              </>
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            mode="contained"
            onPress={() => {
              fetchTransporters();
              setShowTransporterModal(true);
            }}
            disabled={getTotalSelectedQuantity() < request.quantity}
            style={[
              styles.distributeButton,
              getTotalSelectedQuantity() < request.quantity &&
                styles.disabledButton,
            ]}
          >
            Phân phối
          </Button>
        </View>

        <Portal>
          <Dialog
            visible={showTransporterModal}
            onDismiss={() => {
              setShowTransporterModal(false);
              Keyboard.dismiss();
            }}
          >
            <Dialog.Title>Chọn người vận chuyển</Dialog.Title>
            <Dialog.Content>
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View>
                  <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => setShowTransporterDropdown(true)}
                  >
                    {selectedTransporterData ? (
                      <View style={styles.selectedTransporter}>
                        <Image
                          source={{
                            uri: selectedTransporterData.userId.avatar,
                          }}
                          style={styles.transporterAvatar}
                        />
                        <View style={styles.transporterInfo}>
                          <Text style={styles.transporterName}>
                            {selectedTransporterData.userId.fullName}
                          </Text>
                          <Text style={styles.transporterPhone}>
                            {selectedTransporterData.userId.phone}
                          </Text>
                        </View>
                      </View>
                    ) : (
                      <Text style={styles.dropdownPlaceholder}>
                        Chọn người vận chuyển
                      </Text>
                    )}
                    <MaterialIcons
                      name="arrow-drop-down"
                      size={24}
                      color="#636E72"
                    />
                  </TouchableOpacity>

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
                          {scheduledDeliveryDate.toLocaleDateString("vi-VN", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
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
                          {scheduledDeliveryDate.toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {showDatePicker && (
                    <View style={styles.pickerContainer}>
                      <DateTimePicker
                        value={scheduledDeliveryDate}
                        mode="date"
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        onChange={onDateChange}
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
                        value={scheduledDeliveryDate}
                        mode="time"
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        onChange={onTimeChange}
                        minuteInterval={15}
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

                  <TextInput
                    mode="outlined"
                    label="Ghi chú cho người vận chuyển"
                    value={transporterNote}
                    onChangeText={setTransporterNote}
                    multiline
                    numberOfLines={3}
                    style={[styles.noteInput, { marginBottom: 60 }]} // Add extra margin to prevent keyboard overlap
                    placeholder="Nhập ghi chú cho người vận chuyển (nếu có)"
                  />

                  <Modal
                    visible={showTransporterDropdown}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setShowTransporterDropdown(false)}
                  >
                    <TouchableOpacity
                      style={styles.modalOverlay}
                      activeOpacity={1}
                      onPress={() => setShowTransporterDropdown(false)}
                    >
                      <View style={styles.dropdownModal}>
                        <FlatList
                          data={transporters}
                          renderItem={renderTransporterItem}
                          keyExtractor={(item) => item._id}
                          ItemSeparatorComponent={() => <Divider />}
                        />
                      </View>
                    </TouchableOpacity>
                  </Modal>
                </View>
              </TouchableWithoutFeedback>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setShowTransporterModal(false)}>
                Hủy
              </Button>
              <Button
                onPress={() => {
                  setShowTransporterModal(false);
                  setShowConfirmDialog(true);
                }}
                disabled={!selectedTransporter}
              >
                Tiếp tục
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>

        <Portal>
          <Dialog
            visible={showConfirmDialog}
            onDismiss={() => setShowConfirmDialog(false)}
          >
            <Dialog.Title>Xác nhận phân phối</Dialog.Title>
            <Dialog.Content>
              <Text style={styles.confirmText}>
                Bạn có chắc chắn muốn phân phối {getTotalSelectedQuantity()}ml
                máu cho yêu cầu này?
              </Text>
              {transporterNote && (
                <View style={styles.notePreview}>
                  <Text style={styles.noteLabel}>Ghi chú:</Text>
                  <Text style={styles.noteText}>{transporterNote}</Text>
                </View>
              )}
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setShowConfirmDialog(false)}>Hủy</Button>
              <Button onPress={handleDistribute}>Xác nhận</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>

        <Portal>
          <Dialog
            visible={showQuantityModal}
            onDismiss={() => {
              setShowQuantityModal(false);
              Keyboard.dismiss();
            }}
          >
            <Dialog.Title>Chọn số lượng máu</Dialog.Title>
            <Dialog.Content>
              <Text style={styles.modalText}>
                Số lượng còn lại: {currentUnit?.remainingQuantity}ml
              </Text>
              <TextInput
                mode="outlined"
                label="Số lượng (ml)"
                value={quantityInput}
                onChangeText={setQuantityInput}
                keyboardType="numeric"
                style={styles.quantityInput}
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setShowQuantityModal(false)}>Hủy</Button>
              <Button onPress={handleQuantityConfirm}>Xác nhận</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </PaperProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  selectedQuantityText: {
    color: "#FF6B6B",
    fontWeight: "bold",
    fontSize: 16,
  },
  header: {
    backgroundColor: "#FF6B6B",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2D3436",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: "#636E72",
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  label: {
    flex: 1,
    fontSize: 14,
    color: "#636E72",
  },
  value: {
    flex: 2,
    fontSize: 14,
    color: "#2D3436",
    fontWeight: "500",
  },
  unitCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  selectedUnit: {
    backgroundColor: "#FF6B6B10",
    borderColor: "#FF6B6B",
    borderWidth: 1,
  },
  unitHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  unitId: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: "500",
    color: "#2D3436",
  },
  divider: {
    marginVertical: 8,
  },
  unitInfo: {
    marginTop: 8,
  },
  testResults: {
    flex: 2,
  },
  testResult: {
    flexDirection: "row",
    marginBottom: 4,
  },
  testName: {
    fontSize: 14,
    color: "#2D3436",
    marginRight: 8,
  },
  testValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  noteInput: {
    marginTop: 16,
    backgroundColor: "#FFFFFF",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  pageInfo: {
    fontSize: 14,
    color: "#636E72",
  },
  footer: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    elevation: 8,
  },
  distributeButton: {
    backgroundColor: "#FF6B6B",
  },
  disabledButton: {
    backgroundColor: "#FFB1B1",
  },
  errorContainer: {
    alignItems: "center",
    padding: 24,
  },
  errorText: {
    color: "#FF4757",
    marginVertical: 8,
    textAlign: "center",
  },
  modalText: {
    marginBottom: 16,
    fontSize: 16,
    color: "#2D3436",
  },
  quantityInput: {
    backgroundColor: "#FFFFFF",
    marginBottom: 8,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#E4E9F2",
    marginBottom: 16,
  },
  dropdownPlaceholder: {
    color: "#636E72",
    fontSize: 16,
  },
  selectedTransporter: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    padding: 20,
  },
  dropdownModal: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    maxHeight: 300,
  },
  transporterItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  transporterInfo: {
    marginLeft: 12,
    flex: 1,
  },
  transporterAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  transporterName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2D3436",
  },
  transporterPhone: {
    fontSize: 14,
    color: "#636E72",
  },
  confirmText: {
    fontSize: 16,
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
  notePreview: {
    marginBottom: 16,
  },
  noteLabel: {
    fontSize: 14,
    color: "#636E72",
    marginBottom: 8,
  },
  noteText: {
    fontSize: 14,
    color: "#2D3436",
  },
});
