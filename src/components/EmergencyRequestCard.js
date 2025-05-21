import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const getStatusColor = (status) => {
  switch (status) {
    case "pending":
      return "#FFA502";
    case "approved":
      return "#2ED573";
    case "cancelled":
      return "#FF4757";
    case "processing":
      return "#1E90FF";
    default:
      return "#95A5A6";
  }
};

export default function EmergencyRequestCard({
  request,
  handleProcess,
  handleComplete,
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.name}>{request.hospitalName}</Text>
          <View style={styles.bloodTypeContainer}>
            <MaterialIcons name="water-drop" size={16} color="#FF6B6B" />
            <Text style={styles.bloodType}>
              {request.bloodType} ({request.units} units)
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(request.status) + "20" },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: getStatusColor(request.status) },
            ]}
          >
            {request.status}
          </Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <MaterialIcons name="error" size={16} color="#636E72" />
          <Text style={styles.infoText}>{request.reason}</Text>
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons name="event" size={16} color="#636E72" />
          <Text style={styles.infoText}>Required by: {request.requiredBy}</Text>
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons name="person" size={16} color="#636E72" />
          <Text style={styles.infoText}>{request.contact}</Text>
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons name="phone" size={16} color="#636E72" />
          <Text style={styles.infoText}>{request.phone}</Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.processButton]}
          onPress={handleProcess}
        >
          <MaterialIcons name="play-arrow" size={16} color="#1E90FF" />
          <Text style={[styles.actionText, { color: "#1E90FF" }]}>Process</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.completeButton]}
          onPress={handleComplete}
        >
          <MaterialIcons name="check-circle" size={16} color="#2ED573" />
          <Text style={[styles.actionText, { color: "#2ED573" }]}>
            Complete
          </Text>
        </TouchableOpacity>
      </View>
    </View>
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
    alignItems: "center",
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#636E72",
  },
  cardActions: {
    flexDirection: "row",
    padding: 12,
    justifyContent: "flex-end",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  approveButton: {
    backgroundColor: "#2ED57320",
  },
  rejectButton: {
    backgroundColor: "#FF475720",
  },
  processButton: {
    backgroundColor: "#1E90FF20",
  },
  completeButton: {
    backgroundColor: "#2ED57320",
  },
  actionText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "500",
  },
});
