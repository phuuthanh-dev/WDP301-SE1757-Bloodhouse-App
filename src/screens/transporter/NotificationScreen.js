import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import Header from "@/components/Header";

const MOCK_NOTIFICATIONS = [
  {
    id: "1",
    type: "new_delivery",
    title: "Đơn vận chuyển mới",
    message: "Bạn có một đơn vận chuyển mới cần thực hiện",
    deliveryId: "DEL123",
    createdAt: new Date(2024, 2, 15, 10, 30),
    read: false,
  },
  {
    id: "2",
    type: "delivery_reminder",
    title: "Nhắc nhở vận chuyển",
    message: "Đơn hàng DEL124 sẽ bắt đầu trong 30 phút nữa",
    deliveryId: "DEL124",
    createdAt: new Date(2024, 2, 15, 9, 0),
    read: true,
  },
  {
    id: "3",
    type: "delivery_cancelled",
    title: "Đơn hàng đã hủy",
    message: "Đơn hàng DEL125 đã bị hủy bởi người nhận",
    deliveryId: "DEL125",
    createdAt: new Date(2024, 2, 14, 15, 45),
    read: false,
  },
];

const NotificationScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // TODO: Implement API call to fetch notifications
      // const response = await notificationAPI.getNotifications();
      // setNotifications(response.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      // TODO: Implement API call to mark notification as read
      // await notificationAPI.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleNotificationPress = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Navigate based on notification type
    switch (notification.type) {
      case "new_delivery":
      case "delivery_reminder":
        navigation.navigate("DeliveryDetail", {
          id: notification.deliveryId,
        });
        break;
      case "delivery_cancelled":
        navigation.navigate("DeliveryList");
        break;
      default:
        break;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "new_delivery":
        return "local-shipping";
      case "delivery_reminder":
        return "access-time";
      case "delivery_cancelled":
        return "cancel";
      default:
        return "notifications";
    }
  };

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.read && styles.unreadItem]}
      onPress={() => handleNotificationPress(item)}
    >
      <View
        style={[
          styles.iconContainer,
          !item.read && styles.unreadIconContainer,
        ]}
      >
        <MaterialIcons
          name={getNotificationIcon(item.type)}
          size={24}
          color={item.read ? "#636E72" : "#FF6B6B"}
        />
      </View>
      <View style={styles.contentContainer}>
        <Text
          style={[styles.title, !item.read && styles.unreadText]}
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <Text style={styles.message} numberOfLines={2}>
          {item.message}
        </Text>
        <Text style={styles.time}>
          {format(item.createdAt, "HH:mm, dd/MM/yyyy", { locale: vi })}
        </Text>
      </View>
      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="notifications-none" size={64} color="#B2BEC3" />
      <Text style={styles.emptyText}>Không có thông báo nào</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Thông báo" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Thông báo" />
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmpty}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  listContainer: {
    flexGrow: 1,
    paddingVertical: 8,
  },
  notificationItem: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "white",
    alignItems: "center",
  },
  unreadItem: {
    backgroundColor: "#FFF5F5",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  unreadIconContainer: {
    backgroundColor: "#FFE3E3",
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3436",
    marginBottom: 4,
  },
  unreadText: {
    color: "#FF6B6B",
  },
  message: {
    fontSize: 14,
    color: "#636E72",
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: "#B2BEC3",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF6B6B",
    marginLeft: 12,
  },
  separator: {
    height: 1,
    backgroundColor: "#E9ECEF",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: "#636E72",
    marginTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default NotificationScreen; 