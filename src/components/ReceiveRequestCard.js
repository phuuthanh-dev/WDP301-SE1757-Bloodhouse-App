import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { formatDateTime } from "@/utils/formatHelpers";
import {
  getStatusReceiveBloodColor,
  getStatusReceiveBloodName,
} from "@/constants/receiveBloodStatus";
import { useState } from "react";
import ApproveBloodRequestModal from "./ApproveBloodRequestModal";

export default function ReceiveRequestCard({
  request,
  handleReject,
  onViewDetails,
  onApproveSuccess,
  onDistributionSuccess,
}) {
  const [showApproveModal, setShowApproveModal] = useState(false);

  const renderCampaignStatus = () => {
    if (request.hasCampaign) {
      return (
        <View style={styles.infoRow}>
          <MaterialIcons name="campaign" size={16} color="#1E90FF" />
          <Text style={[styles.infoText, { color: "#1E90FF" }]}>
            Đã tạo chiến dịch khẩn cấp
          </Text>
        </View>
      );
    }
    return null;
  };

  const renderFulfillStatus = () => {
    if (request.isFullfill) {
      return (
        <View style={styles.infoRow}>
          <MaterialIcons name="check-circle" size={16} color="#2ED573" />
          <Text style={[styles.infoText, { color: "#2ED573" }]}>
            Đã đủ số lượng yêu cầu
          </Text>
        </View>
      );
    }
    return null;
  };

  return (
    <>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.name}>
              Người gửi yêu cầu: {request.userId.fullName}
            </Text>
            <View style={styles.bloodTypeContainer}>
              <MaterialIcons name="water-drop" size={16} color="#FF6B6B" />
              <Text style={styles.bloodType}>
                {request.groupId.name} ({request.quantity} đơn vị)
              </Text>
            </View>
            <View style={styles.bloodTypeContainer}>
              <MaterialIcons name="bloodtype" size={16} color="#FF6B6B" />
              <Text style={styles.bloodType}>{request?.componentId?.name}</Text>
            </View>
          </View>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  getStatusReceiveBloodColor(request.status) + "20",
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusReceiveBloodColor(request.status) },
              ]}
            >
              {getStatusReceiveBloodName(request.status)}
            </Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          {request.isUrgent && (
            <View style={styles.infoRow}>
              <MaterialIcons
                name={request.isUrgent ? "error" : "info"}
                size={16}
                color={request.isUrgent ? "#FF6B6B" : "#636E72"}
              />
              <Text
                style={[styles.infoText, request.isUrgent && styles.urgentText]}
              >
                {request.isUrgent && "Khẩn cấp"}
              </Text>
            </View>
          )}

          {renderCampaignStatus()}
          {renderFulfillStatus()}

          <View style={styles.infoRow}>
            <MaterialIcons name="event" size={16} color="#636E72" />
            <Text style={styles.infoText}>
              Thời gian yêu cầu: {formatDateTime(request.preferredDate)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons name="person" size={16} color="#636E72" />
            <Text style={styles.infoText}>
              Tên bệnh nhân: {request.patientName}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons name="phone" size={16} color="#636E72" />
            <Text style={styles.infoText}>
              Số điện thoại: {request.patientPhone}
            </Text>
          </View>

          {request.note && (
            <View style={styles.infoRow}>
              <MaterialIcons name="notes" size={16} color="#636E72" />
              <Text style={styles.infoText} numberOfLines={2}>
                Ghi chú: {request.note}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.viewButton]}
            onPress={() => onViewDetails(request)}
          >
            <MaterialIcons name="visibility" size={16} color="#636E72" />
            <Text style={[styles.actionText, { color: "#636E72" }]}>
              Xem chi tiết
            </Text>
          </TouchableOpacity>

          {request.status === "pending_approval" && !request.hasCampaign && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.approveButton]}
                onPress={() => setShowApproveModal(true)}
              >
                <MaterialIcons name="check-circle" size={16} color="#2ED573" />
                <Text style={[styles.actionText, { color: "#2ED573" }]}>
                  Duyệt
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                onPress={handleReject}
              >
                <MaterialIcons name="cancel" size={16} color="#FF4757" />
                <Text style={[styles.actionText, { color: "#FF4757" }]}>
                  Từ chối
                </Text>
              </TouchableOpacity>
            </>
          )}

          {request.status === "approved" && !request.hasCampaign && !request.isFullfill && (
            <TouchableOpacity
              style={[styles.button, styles.startButton]}
              onPress={() => onDistributionSuccess(request._id)}
            >
              <MaterialIcons name="play-arrow" size={20} color="#2ED573" />
              <Text style={[styles.buttonText, styles.startButtonText]}>
                Bắt đầu phân phối
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ApproveBloodRequestModal
        visible={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        request={request}
        onApproveSuccess={onApproveSuccess}
      />
    </>
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
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#FFFFFF",
    opacity: 0.9,
  },
  searchContainer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F2F6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: "#2D3436",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: "#F1F2F6",
  },
  activeTabButton: {
    backgroundColor: "#FF6B6B20",
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
    color: "#95A5A6",
  },
  activeTabText: {
    color: "#FF6B6B",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  headerLeft: {
    flex: 1,
  },
  avatarNameContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  nameBloodContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D3436",
    marginBottom: 4,
  },
  bloodTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  bloodType: {
    marginLeft: 4,
    fontSize: 14,
    color: "#FF6B6B",
    fontWeight: "500",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  cardContent: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#636E72",
    flex: 1,
  },
  cardActions: {
    flexDirection: "row",
    padding: 12,
    justifyContent: "flex-end",
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewButton: {
    backgroundColor: "#F1F2F6",
  },
  approveButton: {
    backgroundColor: "#2ED57320",
  },
  rejectButton: {
    backgroundColor: "#FF475720",
  },
  actionText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "500",
  },
  urgentText: {
    color: "#FF6B6B",
    fontWeight: "500",
  },
  startButton: {
    backgroundColor: "#2ED57320",
  },
  completeButton: {
    backgroundColor: "#2ED573",
  },
  buttonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
  },
  startButtonText: {
    color: "#2ED573",
  },
  completeButtonText: {
    color: "#FFFFFF",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8,
  },
});
