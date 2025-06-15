import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Text,
  Platform,
  Modal,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import Timeline from "react-native-timeline-flatlist";
import { MaterialIcons } from "@expo/vector-icons";
import {
  DONATION_STATUS,
  getStatusDonationColor,
  getStatusDonationName,
} from "@/constants/donationStatus";
import processDonationLogAPI from "@/apis/processDonationLogAPI";
import { formatDateTime } from "@/utils/formatHelpers";
import Toast from "react-native-toast-message";

const DetailModal = ({ visible, onClose, title, children, icon }) => (
  <Modal
    animationType="fade"
    transparent={true}
    visible={visible}
    onRequestClose={onClose}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <View style={styles.modalTitleContainer}>
            <View style={styles.modalTitleRow}>
              <MaterialIcons
                name={icon}
                size={24}
                color="#FF6B6B"
                style={styles.modalTitleIcon}
              />
              <Text style={styles.modalTitle}>{title}</Text>
            </View>
            <View style={styles.modalDivider} />
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <View style={styles.closeButtonCircle}>
              <MaterialIcons name="close" size={20} color="#FF6B6B" />
            </View>
          </TouchableOpacity>
        </View>
        <ScrollView
          style={styles.modalBody}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.modalBodyContent}>{children}</View>
        </ScrollView>
      </View>
    </View>
  </Modal>
);

const HealthCheckDetail = ({ healthCheck }) => (
  <View>
    <View style={styles.detailRow}>
      <MaterialIcons
        name="favorite"
        size={20}
        color="#FF6B6B"
        style={styles.detailIcon}
      />
      <Text style={styles.detailLabel}>Huyết áp:</Text>
      <Text style={styles.detailValue}>
        {healthCheck.bloodPressure || "Chưa có"}
      </Text>
    </View>
    <View style={styles.detailRow}>
      <MaterialIcons
        name="opacity"
        size={20}
        color="#FF6B6B"
        style={styles.detailIcon}
      />
      <Text style={styles.detailLabel}>Hemoglobin:</Text>
      <Text style={styles.detailValue}>
        {healthCheck.hemoglobin ? `${healthCheck.hemoglobin} g/dL` : "Chưa có"}
      </Text>
    </View>
    <View style={styles.detailRow}>
      <MaterialIcons
        name="fitness-center"
        size={20}
        color="#FF6B6B"
        style={styles.detailIcon}
      />
      <Text style={styles.detailLabel}>Cân nặng:</Text>
      <Text style={styles.detailValue}>
        {healthCheck.weight ? `${healthCheck.weight} kg` : "Chưa có"}
      </Text>
    </View>
    <View style={styles.detailRow}>
      <MaterialIcons
        name="timer"
        size={20}
        color="#FF6B6B"
        style={styles.detailIcon}
      />
      <Text style={styles.detailLabel}>Nhịp tim:</Text>
      <Text style={styles.detailValue}>
        {healthCheck.pulse ? `${healthCheck.pulse} bpm` : "Chưa có"}
      </Text>
    </View>
    <View style={styles.detailRow}>
      <MaterialIcons
        name="thermostat"
        size={20}
        color="#FF6B6B"
        style={styles.detailIcon}
      />
      <Text style={styles.detailLabel}>Nhiệt độ:</Text>
      <Text style={styles.detailValue}>
        {healthCheck.temperature ? `${healthCheck.temperature}°C` : "Chưa có"}
      </Text>
    </View>
    {healthCheck.notes && (
      <View style={styles.detailRow}>
        <MaterialIcons
          name="note"
          size={20}
          color="#FF6B6B"
          style={styles.detailIcon}
        />
        <Text style={styles.detailLabel}>Ghi chú:</Text>
        <Text style={styles.detailValue}>{healthCheck.notes}</Text>
      </View>
    )}
  </View>
);

const StatusLogDetail = ({ statusLog }) => (
  <View>
    <View style={styles.detailRow}>
      <MaterialIcons
        name="schedule"
        size={20}
        color="#FF6B6B"
        style={styles.detailIcon}
      />
      <Text style={styles.detailLabel}>Giai đoạn:</Text>
      <Text style={styles.detailValue}>
        {statusLog.phase === "resting" ? "Đang nghỉ ngơi" : "Kiểm tra sau nghỉ"}
      </Text>
    </View>
    <View style={styles.detailRow}>
      <MaterialIcons
        name="access-time"
        size={20}
        color="#FF6B6B"
        style={styles.detailIcon}
      />
      <Text style={styles.detailLabel}>Thời gian:</Text>
      <Text style={styles.detailValue}>
        {formatDateTime(statusLog.recordedAt)}
      </Text>
    </View>
    {statusLog.notes && (
      <View style={styles.detailRow}>
        <MaterialIcons
          name="note"
          size={20}
          color="#FF6B6B"
          style={styles.detailIcon}
        />
        <Text style={styles.detailLabel}>Ghi chú:</Text>
        <Text style={styles.detailValue}>{statusLog.notes}</Text>
      </View>
    )}
    {statusLog.status && (
      <View style={styles.detailRow}>
        <MaterialIcons
          name="check-circle"
          size={20}
          color="#FF6B6B"
          style={styles.detailIcon}
        />
        <Text style={styles.detailLabel}>Trạng thái:</Text>
        <Text style={styles.detailValue}>
          {statusLog.status === "stable" ? "Ổn định" : statusLog.status}
        </Text>
      </View>
    )}
  </View>
);

const TimelineDetail = ({ data, currentStatus, timelineData }) => {
  const [healthCheckModalVisible, setHealthCheckModalVisible] = useState(false);
  const [statusLogModalVisible, setStatusLogModalVisible] = useState(false);

  const getStatusTitle = (status) => {
    // Check if registered exists for pending_approval
    const hasRegistered = timelineData?.some((item) => item.status === DONATION_STATUS.REGISTERED);
    
    // Check if checked_in exists for registered
    const hasCheckedIn = timelineData?.some((item) => item.status === DONATION_STATUS.CHECKED_IN);
    
    // Check if waiting_donation exists for in_consult
    const hasWaitingDonation = timelineData?.some((item) => item.status === DONATION_STATUS.WAITING_DONATION);
    
    // Check if donating exists for waiting_donation
    const hasDonating = timelineData?.some((item) => item.status === DONATION_STATUS.DONATING);
    
    // Check if donated exists for donating
    const hasDonated = timelineData?.some((item) => item.status === DONATION_STATUS.DONATED);
    
    // Check if post_rest_check exists for resting
    const hasPostRestCheck = timelineData?.some((item) => item.status === DONATION_STATUS.POST_REST_CHECK);

    switch (status) {
      case DONATION_STATUS.PENDING_APPROVAL:
        return hasRegistered ? "Đã phê duyệt" : "Chờ phê duyệt";
      
      case DONATION_STATUS.REGISTERED:
        return hasCheckedIn ? "Đã check-in" : "Đã đăng ký";
      
      case DONATION_STATUS.CHECKED_IN:
        return "Đã điểm danh";
      
      case DONATION_STATUS.IN_CONSULT:
        return hasWaitingDonation ? "Đã khám sức khỏe" : "Đang khám sức khỏe";
      
      case DONATION_STATUS.WAITING_DONATION:
        return hasDonating ? "Đã vào phòng hiến" : "Chờ hiến máu";
      
      case DONATION_STATUS.DONATING:
        return hasDonated ? "Đã hiến máu xong" : "Đang hiến máu";
      
      case DONATION_STATUS.DONATED:
        return "Đã hiến máu";
      
      case DONATION_STATUS.RESTING:
        return hasPostRestCheck ? "Đã nghỉ ngơi" : "Đang nghỉ ngơi";
      
      case DONATION_STATUS.POST_REST_CHECK:
        return "Kiểm tra sau nghỉ";
      
      case DONATION_STATUS.COMPLETED:
        return "Hoàn thành";
      
      default:
        return getStatusDonationName(status);
    }
  };

  const isPendingApproval = () => {
    return (
      currentStatus === DONATION_STATUS.PENDING_APPROVAL &&
      timelineData?.some((item) => item.status === DONATION_STATUS.REGISTERED)
    );
  };

  const isInConsultation = () => {
    return (
      currentStatus === DONATION_STATUS.IN_CONSULT &&
      !timelineData?.some((item) => item.status === DONATION_STATUS.WAITING_DONATION)
    );
  };

  const isWaitingForDonation = () => {
    return (
      currentStatus === DONATION_STATUS.WAITING_DONATION &&
      !timelineData?.some((item) => item.status === DONATION_STATUS.DONATING)
    );
  };

  const isDonating = () => {
    return (
      currentStatus === DONATION_STATUS.DONATING &&
      !timelineData?.some((item) => item.status === DONATION_STATUS.DONATED)
    );
  };

  const isResting = () => {
    return (
      currentStatus === DONATION_STATUS.RESTING &&
      !timelineData?.some((item) => item.status === DONATION_STATUS.POST_REST_CHECK)
    );
  };

  const isPastStatus = (status) => {
    const statusOrder = [
      "pending_approval",
      "registered",
      "checked_in",
      "in_consult",
      "waiting_donation",
      "donating",
      "donated",
      "resting",
      "post_rest_check",
      "completed",
    ];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const statusIndex = statusOrder.indexOf(status);
    return statusIndex <= currentIndex;
  };

  const getStatusColor = (status) => {
    if (isPendingApproval() && status === "pending_approval") {
      return "#FFC107"; // Yellow for pending approval
    }
    if (isInConsultation() && status === "in_consult") {
      return "#FFC107"; // Yellow for active consultation
    }
    if (isWaitingForDonation() && status === "waiting_donation") {
      return "#FFC107"; // Yellow for waiting donation without donating status
    }
    if (isDonating() && status === "donating") {
      return "#FFC107"; // Yellow for donating without donated status
    }
    if (isResting() && status === "resting") {
      return "#FFC107"; // Yellow for resting without post_rest_check status
    }
    if (
      status === "pending_approval" &&
      !timelineData?.some((item) => item.status === "registered")
    ) {
      return "#FFC107"; // Yellow for registered when no pending_approval exists
    }
    if (
      status === "waiting_donation" &&
      !timelineData?.some((item) => item.status === "donating")
    ) {
      return "#FFC107"; // Yellow for waiting donation when no donating exists
    }
    if (
      status === "donating" &&
      !timelineData?.some((item) => item.status === "donated")
    ) {
      return "#FFC107"; // Yellow for donating when no donated exists
    }
    if (
      status === "resting" &&
      !timelineData?.some((item) => item.status === "post_rest_check")
    ) {
      return "#FFC107"; // Yellow for resting when no post_rest_check exists
    }
    return isPastStatus(status) ? "#4CAF50" : "#9E9E9E";
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending_approval: "hourglass-empty",
      registered: "how-to-reg",
      checked_in: "qr-code-scanner",
      in_consult: "medical-services",
      waiting_donation: "people",
      donating: "volunteer-activism",
      donated: "favorite",
      resting: "bed",
      post_rest_check: "healing",
      completed: "check-circle",
    };
    return icons[status] || "circle";
  };

  return (
    <View style={styles.detailContainer}>
      <View style={styles.timelineHeader}>
        <View style={styles.titleRow}>
          <MaterialIcons
            name={getStatusIcon(data.status)}
            size={24}
            color={getStatusColor(data.status)}
            style={styles.titleIcon}
          />
          <Text style={[styles.title, { color: getStatusColor(data.status) }]}>
            {getStatusTitle(data.status)}
          </Text>
        </View>
      </View>
      <Text
        style={[
          styles.description,
          {
            color:
              getStatusColor(data.status) === "#9E9E9E" ? "#9E9E9E" : "#2D3436",
          },
        ]}
      >
        {data.description}
      </Text>
      {data.notes && (
        <View style={styles.notesContainer}>
          <MaterialIcons
            name="note"
            size={16}
            color={getStatusColor(data.status)}
          />
          <Text
            style={[
              styles.notes,
              {
                color:
                  getStatusColor(data.status) === "#9E9E9E"
                    ? "#9E9E9E"
                    : "#2D3436",
              },
            ]}
          >
            Ghi chú: {data.notes}
          </Text>
        </View>
      )}

      {data.status === "registered" && data.registration && (
        <View style={styles.registrationContainer}>
          <MaterialIcons
            name="event"
            size={16}
            color={getStatusColor(data.status)}
          />
          <Text
            style={[
              styles.notes,
              {
                color:
                  getStatusColor(data.status) === "#9E9E9E"
                    ? "#9E9E9E"
                    : "#2D3436",
              },
            ]}
          >
            Lịch hiến máu: {formatDateTime(data.registration.preferredDate)}
          </Text>
        </View>
      )}

      {data.status === "in_consult" &&
        (data.healthCheck.status === "completed" ||
          data.healthCheck.status === "donated") && (
          <TouchableOpacity
            style={styles.detailButton}
            onPress={() => setHealthCheckModalVisible(true)}
          >
            <Text style={styles.detailButtonText}>
              Xem thông tin khám sức khỏe
            </Text>
          </TouchableOpacity>
        )}

      {data.status === "post_rest_check" && data.statusLog && (
        <TouchableOpacity
          style={styles.detailButton}
          onPress={() => setStatusLogModalVisible(true)}
        >
          <Text style={styles.detailButtonText}>Xem thông tin theo dõi</Text>
        </TouchableOpacity>
      )}

      <DetailModal
        visible={healthCheckModalVisible}
        onClose={() => setHealthCheckModalVisible(false)}
        title="Thông tin khám sức khỏe"
        icon="local-hospital"
      >
        <HealthCheckDetail healthCheck={data.healthCheck} />
      </DetailModal>

      <DetailModal
        visible={statusLogModalVisible}
        onClose={() => setStatusLogModalVisible(false)}
        title="Thông tin theo dõi"
        icon="assignment"
      >
        <StatusLogDetail statusLog={data.statusLog} />
      </DetailModal>
    </View>
  );
};

export default function DonationTimeline({ route, navigation }) {
  const { currentStatus, registrationId } = route.params;
  const [timelineData, setTimelineData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTimelineData();
  }, [registrationId]);

  const fetchTimelineData = async () => {
    try {
      setIsLoading(true);
      const response = await processDonationLogAPI.HandleProcessDonationLog(
        `/timeline/${registrationId}`
      );
      if (response.status === 200) {
        const data = response.data;
        const hasDonating = data.some((d) => d.status === DONATION_STATUS.DONATING);
        const hasDonated = data.some((d) => d.status === DONATION_STATUS.DONATED);
        const hasPostRestCheck = data.some(
          (d) => d.status === DONATION_STATUS.POST_REST_CHECK
        );
        const hasRegistered = data.some((d) => d.status === DONATION_STATUS.REGISTERED);
        const hasCheckedIn = data.some((d) => d.status === DONATION_STATUS.CHECKED_IN);
        const hasWaitingDonation = data.some((d) => d.status === DONATION_STATUS.WAITING_DONATION);

        const transformedData = data.map((item) => {
          const isInConsult =
            currentStatus === DONATION_STATUS.IN_CONSULT &&
            !data.some((d) => d.status === DONATION_STATUS.WAITING_DONATION);

          const isWaiting = item.status === DONATION_STATUS.WAITING_DONATION && !hasDonating;
          const isDonating = item.status === DONATION_STATUS.DONATING && !hasDonated;
          const isResting = item.status === DONATION_STATUS.RESTING && !hasPostRestCheck;

          // Determine if this status should be yellow (in progress)
          const isInProgress = 
            // Pending approval is yellow if no registered status exists
            (item.status === DONATION_STATUS.PENDING_APPROVAL && !hasRegistered) ||
            // Registered is yellow if no checked_in status exists
            (item.status === DONATION_STATUS.REGISTERED && !hasCheckedIn) ||
            // In consult is yellow if no waiting_donation status exists
            (item.status === DONATION_STATUS.IN_CONSULT && !hasWaitingDonation) ||
            // Waiting donation is yellow if no donating status exists
            (item.status === DONATION_STATUS.WAITING_DONATION && !hasDonating) ||
            // Donating is yellow if no donated status exists
            (item.status === DONATION_STATUS.DONATING && !hasDonated) ||
            // Resting is yellow if no post_rest_check status exists
            (item.status === DONATION_STATUS.RESTING && !hasPostRestCheck);

          // Determine if this status should be green (completed)
          const isCompleted = 
            // Pending approval is green if registered exists
            (item.status === DONATION_STATUS.PENDING_APPROVAL && hasRegistered) ||
            // Registered is green if checked_in exists
            (item.status === DONATION_STATUS.REGISTERED && hasCheckedIn) ||
            // In consult is green if waiting_donation exists
            (item.status === DONATION_STATUS.IN_CONSULT && hasWaitingDonation) ||
            // Waiting donation is green if donating exists
            (item.status === DONATION_STATUS.WAITING_DONATION && hasDonating) ||
            // Donating is green if donated exists
            (item.status === DONATION_STATUS.DONATING && hasDonated) ||
            // Resting is green if post_rest_check exists
            (item.status === DONATION_STATUS.RESTING && hasPostRestCheck) ||
            // These statuses are always green when they appear
            [
              DONATION_STATUS.CHECKED_IN,
              DONATION_STATUS.DONATED,
              DONATION_STATUS.POST_REST_CHECK,
              DONATION_STATUS.COMPLETED
            ].includes(item.status);

          return {
            time: formatDateTime(item.timestamp),
            title: item.status === DONATION_STATUS.COMPLETED ? "Hoàn thành" : null,
            description: item.description,
            status: item.status,
            notes: item.notes,
            circleColor: isInProgress ? "#FFC107" : isCompleted ? "#4CAF50" : "#9E9E9E",
            lineColor: isCompleted ? "#4CAF50" : "#E0E0E0", // Green for completed, grey for others
            healthCheck: item.healthCheck,
            statusLog: item.statusLog,
            registration: item.registration,
          };
        });

        // Sort by timestamp
        transformedData.sort((a, b) => new Date(a.time) - new Date(b.time));
        setTimelineData(transformedData);
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể tải dữ liệu. Vui lòng thử lại sau.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isPastStatus = (status) => {
    const statusOrder = [
      "pending_approval",
      "registered",
      "checked_in",
      "in_consult",
      "waiting_donation",
      "donating",
      "donated",
      "resting",
      "post_rest_check",
      "completed",
    ];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const statusIndex = statusOrder.indexOf(status);
    return statusIndex <= currentIndex;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.headerText}>Tiến trình hiến máu</Text>
          <Text style={styles.subtitle}>
            Theo dõi quá trình hiến máu của bạn
          </Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
        </View>
      ) : (
        <Timeline
          data={timelineData}
          circleSize={20}
          renderDetail={(rowData) => (
            <TimelineDetail
              data={rowData}
              currentStatus={currentStatus}
              timelineData={timelineData}
            />
          )}
          showTime={true}
          columnFormat="two-column"
          lineWidth={2}
          timeContainerStyle={styles.timeContainer}
          timeStyle={styles.time}
          options={{
            style: styles.timeline,
            showTime: true,
          }}
          innerCircle="dot"
          // renderCircle={(rowData, sectionID) => (
          //   <View
          //     style={{
          //       position: "absolute",
          //       top: 0,
          //       left: "47%",
          //       width: 20,
          //       height: 20,
          //       borderRadius: 10,
          //       backgroundColor: getStatusDonationColor(rowData.status),
          //       zIndex: 1,
          //     }}
          //   />
          // )}
        />
      )}
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
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    marginLeft: 16,
    marginRight: 8,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  subtitle: {
    fontSize: 14,
    color: "white",
    opacity: 0.9,
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  timeline: {
    padding: 16,
  },
  timeContainer: {
    minWidth: 52,
    marginTop: 5,
  },
  time: {
    textAlign: "center",
    backgroundColor: "#ff9797",
    color: "white",
    padding: 5,
    borderRadius: 13,
    overflow: "hidden",
  },
  detailContainer: {
    flex: 1,
    padding: 12,
    backgroundColor: "white",
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  timelineHeader: {
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  titleIcon: {
    marginRight: 8,
  },
  modalTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  modalTitleIcon: {
    marginRight: 8,
  },
  notesContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  notes: {
    fontSize: 14,
    fontStyle: "italic",
    marginLeft: 4,
  },
  detailIcon: {
    marginRight: 8,
    width: 20,
  },
  buttonIcon: {
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  completedTitle: {
    color: "#4CAF50",
  },
  pendingTitle: {
    color: "#9E9E9E",
  },
  description: {
    fontSize: 14,
    marginBottom: 8,
  },
  completedDescription: {
    color: "#2D3436",
  },
  pendingDescription: {
    color: "#9E9E9E",
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 16,
    backgroundColor: "#F8F9FA",
    padding: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  detailLabel: {
    width: 100,
    fontSize: 14,
    color: "#636E72",
    fontWeight: "500",
  },
  detailButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  detailButtonText: {
    color: "white",
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    width: "100%",
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  modalTitleContainer: {
    flex: 1,
    marginRight: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2D3436",
    marginBottom: 8,
  },
  modalDivider: {
    height: 3,
    width: 40,
    backgroundColor: "#FF6B6B",
    borderRadius: 2,
  },
  closeButton: {
    marginTop: 2,
  },
  closeButtonCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFF0F0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFE5E5",
  },
  modalBody: {
    maxHeight: "100%",
  },
  modalBodyContent: {
    padding: 20,
    paddingTop: 5,
  },
  registrationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    backgroundColor: "#F8F9FA",
    padding: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});
 