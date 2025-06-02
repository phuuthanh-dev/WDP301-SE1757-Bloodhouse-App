import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  Platform,
  Image,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import bloodRequestAPI from "@/apis/bloodRequestAPI";
import Header from "@/components/Header";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useSelector } from "react-redux";
import { authSelector } from "@/redux/reducers/authReducer";
import bloodRequestSupportAPI from "@/apis/bloodRequestSupportAPI";
import RequestSupportRegistrationModal from "@/components/RequestSupportRegistrationModal";

export default function SupportRequestsScreen({ navigation }) {
  const [requests, setRequests] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const { user } = useSelector(authSelector);
  const [contactInfo, setContactInfo] = useState({
    phone: "",
    email: "",
    note: "",
  });

  const fetchSupportRequests = async () => {
    try {
      const response = await bloodRequestAPI.HandleBloodRequest(
        "/need-support"
      );
      setRequests(response.data);
    } catch (error) {
      console.error("Error fetching support requests:", error);
    }
  };

  useEffect(() => {
    fetchSupportRequests();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchSupportRequests().finally(() => setRefreshing(false));
  }, []);

  const handleOpenModal = (request) => {
    setSelectedRequest(request);
    setContactInfo({
      phone: user.phone || "",
      email: user.email || "",
      note: "",
    });
    setModalVisible(true);
  };

  const handleRegister = async () => {
    try {
      setRegistering(true);
      setModalVisible(false);

      const registrationData = {
        requestId: selectedRequest._id,
        phone: contactInfo.phone,
        email: contactInfo.email,
        note: contactInfo.note || "Đăng ký từ ứng dụng di động",
      };

      const response = await bloodRequestSupportAPI.HandleBloodRequestSupport(
        "",
        registrationData,
        "post"
      );

      if (response.status === 201 || response.status === 200) {
        Alert.alert(
          "Đăng ký thành công",
          "Cảm ơn bạn đã đăng ký tham gia chiến dịch hiến máu. Chúng tôi sẽ liên hệ với bạn sớm nhất.",
          [{ text: "Đóng" }]
        );
        fetchSupportRequests();
      }
    } catch (error) {
      let errorMessage = "Không thể đăng ký tham gia chiến dịch";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      Alert.alert("Lỗi", errorMessage);
    } finally {
      setRegistering(false);
      setSelectedRequest(null);
    }
  };

  const renderRequestItem = ({ item }) => {
    const isRequester = item.userId?._id === user._id;

    return (
    <View style={styles.requestCard}>
      <View style={styles.cardHeader}>
        {item.facilityId?.image && (
          <Image
            source={{ uri: item.facility.image }}
            style={styles.facilityImage}
            resizeMode="cover"
          />
        )}
        <View style={styles.cardTitleContainer}>
          <View style={styles.bloodTypeContainer}>
            <Text style={styles.bloodType}>{item.groupId?.name || "N/A"}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: item.isUrgent ? "#FF5252" : "#4CAF50" },
              ]}
            >
              <Text style={styles.statusText}>
                {item.isUrgent ? "Khẩn cấp" : "Thường"}
              </Text>
            </View>
          </View>
          <Text style={styles.date}>
            Ngày tạo:{" "}
            {format(new Date(item.createdAt), "dd/MM/yyyy HH:mm", {
              locale: vi,
            })}
          </Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <MaterialIcons name="person" size={20} color="#FF6B6B" />
            <Text style={styles.infoText}>Bệnh nhân: {item.patientName}</Text>
          </View>

          <View style={styles.infoItem}>
            <MaterialIcons name="phone" size={20} color="#FF6B6B" />
            <Text style={styles.infoText}>SĐT: {item.patientPhone}</Text>
          </View>

          <View style={styles.infoItem}>
            <MaterialIcons name="opacity" size={20} color="#FF6B6B" />
            <Text style={styles.infoText}>
              Thành phần: {item.componentId?.name || "N/A"}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <MaterialIcons name="event" size={20} color="#FF6B6B" />
            <Text style={styles.infoText}>
              Ngày mong muốn:{" "}
              {item.preferredDate
                ? format(new Date(item.preferredDate), "dd/MM/yyyy", {
                    locale: vi,
                  })
                : "Chưa xác định"}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <MaterialIcons name="location-on" size={20} color="#1E90FF" />
            <Text style={styles.infoText} numberOfLines={2}>
              {item.address}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <MaterialIcons name="medical-services" size={20} color="#FF6B6B" />
            <Text style={styles.infoText}>
              Số lượng: {item.quantity} đơn vị
            </Text>
          </View>
        </View>

        {isRequester && (
          <View style={styles.registrationStats}>
            <View style={styles.statItem}>
              <MaterialIcons name="people" size={24} color="#4CAF50" />
              <View>
                <Text style={styles.statNumber}>{item.numberRegistered || 0}</Text>
                <Text style={styles.statLabel}>Đã đăng ký</Text>
              </View>
            </View>
            {item.numberPending > 0 && (
              <View style={styles.statItem}>
                <MaterialIcons name="pending" size={24} color="#FFA000" />
                <View>
                  <Text style={styles.statNumber}>{item.numberPending}</Text>
                  <Text style={styles.statLabel}>Chờ duyệt</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {item.note && (
          <View style={styles.noteContainer}>
            <MaterialIcons name="note" size={20} color="#636E72" />
            <Text style={styles.noteText} numberOfLines={2}>
              {item.note}
            </Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.detailButton]}
            onPress={() =>
              navigation.navigate("SupportRequestDetail", {
                request: item,
              })
            }
          >
            <MaterialIcons name="info" size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>Xem chi tiết</Text>
          </TouchableOpacity>

          {!isRequester && (
            !item.isRegistered ? (
              <TouchableOpacity
                style={[styles.button, styles.registerButton]}
                onPress={() => handleOpenModal(item)}
              >
                <MaterialIcons
                  name="volunteer-activism"
                  size={20}
                  color="#FFFFFF"
                />
                <Text style={styles.buttonText}>Đăng ký hỗ trợ</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.button, styles.alreadyRegisteredButton]}
                disabled
              >
                <MaterialIcons
                  name="check-circle"
                  size={20}
                  color="#FFFFFF"
                />
                <Text style={styles.buttonText}>Đã đăng ký</Text>
              </TouchableOpacity>
            )
          )}
        </View>
      </View>
    </View>
  )};

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Yêu cầu cần hỗ trợ" showBackButton rightComponent />

      <FlatList
        data={requests}
        renderItem={renderRequestItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons
              name="volunteer-activism"
              size={64}
              color="#95A5A6"
            />
            <Text style={styles.emptyText}>Không có yêu cầu hỗ trợ nào</Text>
          </View>
        }
      />

      <RequestSupportRegistrationModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setSelectedRequest(null);
        }}
        onSubmit={handleRegister}
        contactInfo={contactInfo}
        setContactInfo={setContactInfo}
        loading={registering}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    paddingTop: Platform.OS === "android" ? 40 : 0,
  },
  listContainer: {
    padding: 16,
  },
  requestCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#E3E8F0",
  },
  cardHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E3E8F0",
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  facilityImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#E3E8F0",
  },
  cardTitleContainer: {
    flex: 1,
    gap: 8,
  },
  bloodTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  bloodType: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A237E",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  date: {
    fontSize: 14,
    color: "#95A5A6",
  },
  cardContent: {
    padding: 16,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "47%",
    backgroundColor: "#EEF2F7",
    padding: 12,
    borderRadius: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#1A237E",
    fontWeight: "500",
  },
  noteContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E3E8F0",
    gap: 12,
    backgroundColor: "#EEF2F7",
    padding: 16,
    borderRadius: 12,
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    color: "#5C6BC0",
    fontStyle: "italic",
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  detailButton: {
    backgroundColor: "#1E88E5",
  },
  registerButton: {
    backgroundColor: "#4CAF50",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: "#95A5A6",
    marginTop: 16,
    textAlign: "center",
  },
  alreadyRegisteredButton: {
    backgroundColor: "#FFC107",
  },
  registrationStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E3E8F0',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A237E',
  },
  statLabel: {
    fontSize: 12,
    color: '#5C6BC0',
  },
});
