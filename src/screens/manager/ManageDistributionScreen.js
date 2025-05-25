import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
  RefreshControl,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useFacility } from "@/contexts/FacilityContext";
import bloodRequestAPI from "@/apis/bloodRequestAPI";
import ReceiveRequestCard from "@/components/ReceiveRequestCard";

export default function ManageDistributionScreen({ navigation }) {
  const { facilityId } = useFacility();
  const [assignedRequests, setAssignedRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignedRequests();
  }, []);

  const fetchAssignedRequests = async () => {
    try {
      setLoading(true);
      const response = await bloodRequestAPI.HandleBloodRequest(
        `/facility/${facilityId}?status=approved`
      );
      if (response.status === 200) {
        setAssignedRequests(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching assigned requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartDistribution = async (requestId) => {
    try {
      const response = await bloodRequestAPI.HandleBloodRequest(
        `/${requestId}`,
        {
          status: "distributing",
        },
        "put"
      );
      if (response.status === 200) {
        // Refresh the list
        fetchAssignedRequests();
      }
    } catch (error) {
      console.error("Error starting distribution:", error);
    }
  };

  const handleCompleteDistribution = async (requestId) => {
    try {
      const response = await bloodRequestAPI.HandleBloodRequest(
        `/${requestId}`,
        {
          status: "completed",
        },
        "put"
      );
      if (response.status === 200) {
        // Refresh the list
        fetchAssignedRequests();
      }
    } catch (error) {
      console.error("Error completing distribution:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Phân phối máu</Text>
        <Text style={styles.subtitle}>
          Quản lý phân phối máu cho các yêu cầu đã được duyệt
        </Text>
      </View>

      {/* Request List */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchAssignedRequests}
          />
        }
      >
        {assignedRequests.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="info" size={48} color="#95A5A6" />
            <Text style={styles.emptyText}>
              Chưa có yêu cầu nào cần phân phối
            </Text>
          </View>
        ) : (
          assignedRequests.map((request) => (
            <View key={request._id} style={styles.requestCard}>
              <ReceiveRequestCard
                request={request}
                onViewDetails={() =>
                  navigation.navigate("ReceiveRequestDetailScreen", { request })
                }
                onDistributionSuccess={handleCompleteDistribution}
              />
              {/* <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.completeButton]}
                  onPress={() => handleCompleteDistribution(request._id)}
                >
                  <MaterialIcons name="check" size={20} color="#FFFFFF" />
                  <Text style={[styles.buttonText, styles.completeButtonText]}>
                    Hoàn thành
                  </Text>
                </TouchableOpacity>
              </View> */}
            </View>
          ))
        )}
      </ScrollView>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#95A5A6",
    textAlign: "center",
  },
  requestCard: {
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderTopWidth: 1,
    borderTopColor: "#E9ECEF",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8,
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
});
