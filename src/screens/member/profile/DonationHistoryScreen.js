import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  Share,
  RefreshControl,
  SafeAreaView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import bloodDonationRegistrationAPI from "@/apis/bloodDonationRegistration";
import { formatDateTime } from "@/utils/formatHelpers";
import { getStatusColor, getStatusName } from "@/constants/donationStatus";
export default function DonationHistoryScreen({ navigation }) {
  const [donationRegistration, setDonationRegistration] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDonationHistory();
  }, []);

  const fetchDonationHistory = async () => {
    try {
      setLoading(true);
      const response =
        await bloodDonationRegistrationAPI.HandleBloodDonationRegistration(
          "/user"
        );
      setDonationRegistration(response.data.data);
    } catch (error) {
      console.error("Error fetching donation history:", error);
    } finally {
      setLoading(false);
    }
  };
  // Mock data for donation history
  // const donationHistory = [
  //   {
  //     id: 1,
  //     date: '15/02/2024',
  //     location: 'Trung tâm Y tế Quận 5',
  //     bloodType: 'A+',
  //     amount: '350ml',
  //     status: 'completed',
  //     certificate: 'CERT123456',
  //   },
  //   {
  //     id: 2,
  //     date: '10/11/2023',
  //     location: 'Bệnh viện Chợ Rẫy',
  //     bloodType: 'A+',
  //     amount: '350ml',
  //     status: 'completed',
  //     certificate: 'CERT123455',
  //   },
  //   {
  //     id: 3,
  //     date: '05/08/2023',
  //     location: 'Trung tâm Y tế Quận 5',
  //     bloodType: 'A+',
  //     amount: '350ml',
  //     status: 'completed',
  //     certificate: 'CERT123454',
  //   },
  // ];

  const renderDonationCard = (donationRegistration) => (
    (
      <TouchableOpacity
        key={donationRegistration._id}
        style={styles.donationCard}
        onPress={() =>
          navigation.navigate("DonationDetails", { donationRegistration })
        }
      >
        <View style={styles.cardHeader}>
          <View style={styles.dateContainer}>
            <MaterialIcons name="event" size={20} color="#636E72" />
            <Text style={styles.date}>
              {formatDateTime(donationRegistration.preferredDate)}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  getStatusColor(donationRegistration.status) + "20",
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(donationRegistration.status) },
              ]}
            >
              {getStatusName(donationRegistration.status)}
            </Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.infoRow}>
            <MaterialIcons name="warehouse" size={20} color="#636E72" />
            <Text style={styles.infoText}>
              {donationRegistration.facilityId.name}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons name="location-on" size={20} color="#636E72" />
            <Text style={styles.infoText}>
              {donationRegistration.facilityId.address}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons name="opacity" size={20} color="#636E72" />
            <Text style={styles.infoText}>
              Nhóm máu: {donationRegistration.bloodGroupId.name} •{" "}
              {donationRegistration.expectedQuantity}ml
            </Text>
          </View>

          {donationRegistration.status === "completed" && (
            <View style={styles.infoRow}>
              <MaterialIcons name="verified" size={20} color="#636E72" />
              <Text style={styles.infoText}>
                Chứng nhận: {donationRegistration.certificate}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.cardFooter}>
          {donationRegistration.status === "completed" && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                /* Handle certificate download */
              }}
            >
              <MaterialIcons name="file-download" size={20} color="#FF6B6B" />
              <Text style={styles.actionButtonText}>Tải chứng nhận</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionButton, styles.shareButton]}
            onPress={async () => {
              try {
                const result = await Share.share({
                  message:
                    "Tôi vừa hiến máu và muốn chia sẻ điều này! ❤️ #HiếnMáu #GiúpĐỡCộngĐồng",
                  url: "https://your-app-url.com", // optional
                  title: "Chia sẻ hoạt động hiến máu",
                });

                if (result.action === Share.sharedAction) {
                  if (result.activityType) {
                    // shared with activity type of result.activityType
                  } else {
                    // shared
                  }
                } else if (result.action === Share.dismissedAction) {
                  // dismissed
                }
              } catch (error) {
                console.error(error.message);
              }
            }}
          >
            <MaterialIcons name="share" size={20} color="#FF6B6B" />
            <Text style={styles.actionButtonText}>Chia sẻ</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    )
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch sử hiến máu</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{donationRegistration.length}</Text>
          <Text style={styles.statLabel}>Lần hiến máu</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {donationRegistration?.reduce(
              (total, donation) => total + donation.expectedQuantity,
              0
            )}
            ml
          </Text>
          <Text style={styles.statLabel}>Tổng lượng máu</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {donationRegistration?.reduce(
              (total, donation) =>
                donation.status === "completed" ? total + 1 : total,
              0
            )}
          </Text>
          <Text style={styles.statLabel}>Người được cứu</Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchDonationHistory} />
        }
      >
        {donationRegistration.map(renderDonationCard)}
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  placeholder: {
    width: 40,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    padding: 16,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF6B6B",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#636E72",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  donationCard: {
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
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  date: {
    marginLeft: 8,
    fontSize: 16,
    color: "#2D3436",
    fontWeight: "bold",
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
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#636E72",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#E9ECEF",
    padding: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  shareButton: {
    marginLeft: "auto",
  },
  actionButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: "#FF6B6B",
  },
});
