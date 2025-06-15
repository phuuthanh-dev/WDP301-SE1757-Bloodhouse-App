import React, { useState, useCallback } from "react";
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
import { useFocusEffect } from "@react-navigation/native";

const NotificationItem = ({ notification }) => {
  const getNotificationStyle = (type) => {
    switch (type) {
      case "reminder":
        return {
          icon: "alarm",
          color: "#2196F3", // Info blue
          bgColor: "rgba(33, 150, 243, 0.1)",
        };
      case "request":
        return {
          icon: "notifications",
          color: "#FF9800", // Warning orange
          bgColor: "rgba(255, 152, 0, 0.1)",
        };
      case "match":
        return {
          icon: "favorite",
          color: "#4CAF50", // Success green
          bgColor: "rgba(76, 175, 80, 0.1)",
        };
      case "status":
        return {
          icon: "info",
          color: "#9C27B0", // Purple for status
          bgColor: "rgba(156, 39, 176, 0.1)",
        };
      case "gift":
        return {
          icon: "card-giftcard",
          color: "#FF6B6B", // Gift pink
          bgColor: "rgba(255, 107, 107, 0.1)",
        };
      case "delivery":
        return {
          icon: "delivery-dining",
          color: "#FF6B6B", // Delivery pink
          bgColor: "rgba(255, 107, 107, 0.1)",
        };
      default:
        return {
          icon: "notifications",
          color: "#607D8B", // Default blue grey
          bgColor: "rgba(96, 125, 139, 0.1)",
        };
    }
  };

  const style = getNotificationStyle(notification.type);

  return (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        { borderLeftWidth: 4, borderLeftColor: style.color },
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: style.bgColor }]}>
        <MaterialIcons name={style.icon} size={24} color={style.color} />
      </View>
      <View style={styles.contentContainer}>
        <Text style={[styles.notiTitle, { color: style.color }]}>
          {notification.title}
        </Text>
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
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showLoadMoreButton, setShowLoadMoreButton] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setNotifications([]);
      setPage(1);
      setTotal(0);
      setShowLoadMoreButton(true);
      fetchNotification(1, true);
    }, [])
  );

  const fetchNotification = async (pageToFetch = 1, initial = false) => {
    try {
      if (initial) setLoading(true);
      else setLoadingMore(true);
      const response = await notificationAPI.HandleNotification(
        `/user?page=${pageToFetch}&limit=${limit}`
      );
      if (response.status === 200) {
        const data = response.data.data;
        const totalCount = response.data.metadata.total;
        setTotal(totalCount);
        if (pageToFetch === 1) {
          setNotifications(data);
        } else {
          setNotifications((prev) => [...prev, ...data]);
        }
        setPage(pageToFetch);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (notifications.length < total && !loadingMore) {
      fetchNotification(page + 1);
    }
  };

  const handleShowMore = () => {
    setShowLoadMoreButton(false);
    handleLoadMore();
  };

  const renderFooter = () => {
    if (loadingMore)
      return (
        <Text style={{ textAlign: "center", margin: 10 }}>Đang tải...</Text>
      );
    if (notifications.length < total && !showLoadMoreButton)
      return (
        <TouchableOpacity onPress={handleLoadMore}>
          <Text style={{ textAlign: "center", color: "#FF6B6B", margin: 10 }}>
            Tải thêm
          </Text>
        </TouchableOpacity>
      );
    return null;
  };

  if (loading && notifications.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Thông báo</Text>
        </View>
        <View style={styles.centerContainer}>
          <MaterialIcons name="notifications-none" size={48} color="#95A5A6" />
          <Text style={styles.emptyText}>Chưa có thông báo nào</Text>
        </View>
      </SafeAreaView>
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
        refreshing={loading}
        onRefresh={() => fetchNotification(1, true)}
        onEndReached={!showLoadMoreButton ? handleLoadMore : null}
        onEndReachedThreshold={0.2}
        ListFooterComponent={
          showLoadMoreButton && notifications.length < total ? (
            <TouchableOpacity onPress={handleShowMore} style={styles.loadMoreButton}>
              <Text
                style={styles.loadMoreText}
              >
                Xem thông báo trước đó
              </Text>
            </TouchableOpacity>
          ) : (
            renderFooter()
          )
        }
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
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
    textAlign: "center",
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
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    flex: 1,
  },
  notiTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: "#2D3436",
    marginBottom: 8,
    lineHeight: 20,
  },
  time: {
    fontSize: 12,
    color: "#95A5A6",
    fontStyle: "italic",
  },
  loadMoreText: {
    textAlign: "center",
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    margin: 10,
  },
  loadMoreButton: {
    marginTop: 20,
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default NotificationsScreen;
