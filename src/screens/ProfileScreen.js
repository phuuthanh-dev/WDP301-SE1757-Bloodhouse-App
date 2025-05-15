import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Switch,
  Platform,
  SafeAreaView,
} from "react-native";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";

export default function ProfileScreen({ navigation }) {
  const [isAvailableToDonate, setIsAvailableToDonate] = useState(true);
  const [notifications, setNotifications] = useState(true);

  const userInfo = {
    name: "Phùng Hữu Thành",
    bloodType: "A+",
    email: "phuuthanh2002@gmail.com",
    phone: "0909090909",
    lastDonation: "15/01/2024",
    totalDonations: 5,
    avatar:
      "https://scontent.fdad3-3.fna.fbcdn.net/v/t39.30808-6/470178082_1248838163045665_1238041745852048418_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=a5f93a&_nc_ohc=-Bg09IyBXNkQ7kNvwEH2oSI&_nc_oc=Admv-jvwuxmYdG-HS-u0Dy8TWzyc9fwzXCPdTG80F8iuDzcPZw_HhzMDFcrZBMENTTTlJIpV0f4kN4u1ZsMlq_Gl&_nc_zt=23&_nc_ht=scontent.fdad3-3.fna&_nc_gid=qDQNB1CkhGryLz_8HH9rBA&oh=00_AfKbZqwg4v-MpDsLjR9xaWTqA_jo5IlF9173JEwCZtJz-g&oe=682B97B7",
  };

  const donationHistory = [
    {
      id: 1,
      date: "15/01/2024",
      location: "Bệnh viện Chợ Rẫy",
      amount: "350ml",
      status: "Thành công",
    },
    {
      id: 2,
      date: "10/10/2023",
      location: "Viện Huyết học",
      amount: "350ml",
      status: "Thành công",
    },
    // Add more history items
  ];

  const menuItems = [
    {
      icon: "person",
      title: "Thông tin cá nhân",
      onPress: () => navigation.navigate("EditProfile"),
    },
    {
      icon: "security",
      title: "Bảo mật",
      onPress: () => navigation.navigate("Security"),
    },
    {
      icon: "help",
      title: "Trợ giúp & Hỗ trợ",
      onPress: () => navigation.navigate("Help"),
    },
    {
      icon: "info",
      title: "Về chúng tôi",
      onPress: () => navigation.navigate("About"),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.profileInfo}>
            <Image source={{ uri: userInfo.avatar }} style={styles.avatar} />
            <View style={styles.nameContainer}>
              <Text style={styles.name}>{userInfo.name}</Text>
              <View style={styles.bloodTypeContainer}>
                <Text style={styles.bloodType}>{userInfo.bloodType}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userInfo.totalDonations}</Text>
            <Text style={styles.statLabel}>Lần hiến máu</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userInfo.lastDonation}</Text>
            <Text style={styles.statLabel}>Lần hiến gần nhất</Text>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cài đặt</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <MaterialIcons name="favorite" size={24} color="#FF6B6B" />
              <Text style={styles.settingText}>Sẵn sàng hiến máu</Text>
            </View>
            <Switch
              value={isAvailableToDonate}
              onValueChange={setIsAvailableToDonate}
              trackColor={{ false: "#E9ECEF", true: "#FF6B6B" }}
              thumbColor="#FFF"
            />
          </View>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <MaterialIcons name="notifications" size={24} color="#FF6B6B" />
              <Text style={styles.settingText}>Thông báo</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: "#E9ECEF", true: "#FF6B6B" }}
              thumbColor="#FFF"
            />
          </View>
        </View>

        {/* Menu Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Menu</Text>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuLeft}>
                <MaterialIcons name={item.icon} size={24} color="#FF6B6B" />
                <Text style={styles.menuText}>{item.title}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#95A5A6" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Donation History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lịch sử hiến máu</Text>
          {donationHistory.map((donation) => (
            <View key={donation.id} style={styles.historyItem}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyDate}>{donation.date}</Text>
                <Text style={styles.historyStatus}>{donation.status}</Text>
              </View>
              <Text style={styles.historyLocation}>{donation.location}</Text>
              <Text style={styles.historyAmount}>
                Lượng máu: {donation.amount}
              </Text>
            </View>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton}>
          <MaterialIcons name="logout" size={24} color="#FF6B6B" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
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
    paddingTop: 40,
  },
  profileInfo: {
    alignItems: "center",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#FFF",
  },
  nameContainer: {
    alignItems: "center",
    marginTop: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
  },
  bloodTypeContainer: {
    backgroundColor: "#FFF",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  bloodType: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF6B6B",
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#E9ECEF",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF6B6B",
  },
  statLabel: {
    fontSize: 14,
    color: "#636E72",
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D3436",
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#2D3436",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#2D3436",
  },
  historyItem: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  historyDate: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2D3436",
  },
  historyStatus: {
    color: "#4CAF50",
    fontWeight: "bold",
  },
  historyLocation: {
    fontSize: 14,
    color: "#636E72",
    marginBottom: 4,
  },
  historyAmount: {
    fontSize: 14,
    color: "#636E72",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    margin: 16,
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FF6B6B",
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#FF6B6B",
    fontWeight: "bold",
  },
});
