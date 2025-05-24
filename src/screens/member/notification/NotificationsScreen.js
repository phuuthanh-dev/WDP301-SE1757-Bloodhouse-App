import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import notificationAPI from "@/apis/notification";

const NotificationItem = ({ notification }) => {
  const getIcon = (type) => {
    switch (type) {
      case "emergencyCampaign":
        return "campaign";
      case "reminder":
        return "alarm";
      case "request":
        return "notifications";
      case "match":
        return "favorite";
      case "status":
        return "info";
      case "gift":
        return "card-giftcard";
      default:
        return "notifications";
    }
  };

  return (
    <TouchableOpacity style={styles.notificationItem}>
      <View style={styles.iconContainer}>
        <MaterialIcons
          name={getIcon(notification.type)}
          size={24}
          color="#FF6B6B"
        />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.notiTitle}>{notification.title}</Text>
        <Text style={styles.message}>{notification.message}</Text>
        <Text style={styles.time}>
          {format(new Date(notification.createAt), "HH:mm dd/MM/yyyy", {
            locale: vi,
          })}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotification();
  }, []);

  const fetchNotification = async () => {
    try {
      setLoading(true);
      const response = await notificationAPI.HandleNotification("/user");
      if (response.status === 200) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Đang tải...</Text>
      </View>
    );
  }

  if (notifications.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <MaterialIcons name="notifications-none" size={48} color="#95A5A6" />
        <Text style={styles.emptyText}>Chưa có thông báo nào</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Thông báo</Text>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <NotificationItem notification={item} />}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
};

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
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#95A5A6",
  },
  listContainer: {
    padding: 16,
  },
  notificationItem: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    marginRight: 16,
    justifyContent: "center",
  },
  contentContainer: {
    flex: 1,
  },
  notiTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2D3436",
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: "#636E72",
    marginBottom: 8,
  },
  time: {
    fontSize: 12,
    color: "#95A5A6",
  },
});

export default NotificationsScreen;
