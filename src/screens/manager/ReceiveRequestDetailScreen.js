import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  Linking,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { formatDateTime } from "@/utils/formatHelpers";
import { getStatusReceiveBloodColor, getStatusReceiveBloodName } from "@/constants/receiveBloodStatus";

export default function ReceiveRequestDetailScreen({ route, navigation }) {
  const { request } = route.params;

  const handleOpenMap = () => {
    const scheme = Platform.select({
      ios: "maps:0,0?q=",
      android: "geo:0,0?q=",
    });
    const latLng = `${request.location.coordinates[1]},${request.location.coordinates[0]}`;
    const label = request.address;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });

    Linking.openURL(url);
  };

  const handleCall = () => {
    Linking.openURL(`tel:${request.patientPhone}`);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.title}>Chi tiết yêu cầu nhận máu</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Status Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="info" size={24} color="#FF6B6B" />
            <Text style={styles.sectionTitle}>Trạng thái yêu cầu</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusReceiveBloodColor(request.status) + "20" },
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
          {request.isUrgent && (
            <View style={styles.urgentBadge}>
              <MaterialIcons name="error" size={20} color="#FF6B6B" />
              <Text style={styles.urgentText}>Yêu cầu khẩn cấp</Text>
            </View>
          )}
        </View>

        {/* Blood Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="bloodtype" size={24} color="#FF6B6B" />
            <Text style={styles.sectionTitle}>Thông tin yêu cầu máu</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Nhóm máu:</Text>
            <Text style={styles.value}>{request.groupId.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Thành phần máu:</Text>
            <Text style={styles.value}>{request.componentId.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Số lượng:</Text>
            <Text style={styles.value}>{request.quantity} đơn vị</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Thời gian mong muốn:</Text>
            <Text style={styles.value}>{formatDateTime(request.preferredDate)}</Text>
          </View>
        </View>

        {/* Patient Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="person" size={24} color="#FF6B6B" />
            <Text style={styles.sectionTitle}>Thông tin bệnh nhân</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Tên bệnh nhân:</Text>
            <Text style={styles.value}>{request.patientName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Số điện thoại:</Text>
            <TouchableOpacity onPress={handleCall}>
              <Text style={[styles.value, styles.link]}>{request.patientPhone}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Địa chỉ:</Text>
            <TouchableOpacity onPress={handleOpenMap} style={styles.addressContainer}>
              <Text style={[styles.value, styles.link]} numberOfLines={2}>
                {request.address}
              </Text>
              <MaterialIcons name="location-on" size={20} color="#FF6B6B" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Medical Documents Section */}
        {request.medicalDocumentUrl && request.medicalDocumentUrl.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="description" size={24} color="#FF6B6B" />
              <Text style={styles.sectionTitle}>Giấy tờ y tế</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {request.medicalDocumentUrl.map((url, index) => (
                <Image
                  key={index}
                  source={{ uri: url }}
                  style={styles.documentImage}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Additional Information Section */}
        {request.note && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="notes" size={24} color="#FF6B6B" />
              <Text style={styles.sectionTitle}>Ghi chú thêm</Text>
            </View>
            <Text style={styles.noteText}>{request.note}</Text>
          </View>
        )}

        {/* Staff Information Section */}
        {request.staffId && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="admin-panel-settings" size={24} color="#FF6B6B" />
              <Text style={styles.sectionTitle}>Thông tin xử lý</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Nhân viên xử lý:</Text>
              <Text style={styles.value}>{request.staffId.fullName}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    backgroundColor: "#FF6B6B",
    flexDirection: "row",
    alignItems: "center",
    paddingTop: Platform.OS === "android" ? 40 : 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    marginLeft: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D3436",
    marginLeft: 8,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  urgentBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFE5E5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  urgentText: {
    marginLeft: 4,
    color: "#FF6B6B",
    fontWeight: "500",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  label: {
    width: 140,
    fontSize: 14,
    color: "#636E72",
  },
  value: {
    flex: 1,
    fontSize: 14,
    color: "#2D3436",
    fontWeight: "500",
  },
  link: {
    color: "#FF6B6B",
    textDecorationLine: "underline",
  },
  addressContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  documentImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginRight: 12,
  },
  noteText: {
    fontSize: 14,
    color: "#2D3436",
    lineHeight: 20,
  },
}); 