import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

// Mock data for notifications
const notifications = [
  {
    id: '1',
    type: 'warning',
    title: 'Cảnh báo sức khỏe',
    message: 'Người hiến Nguyễn Văn A có tiền sử huyết áp cao, cần kiểm tra kỹ',
    time: '5 phút trước',
    isRead: false,
  },
  {
    id: '2',
    type: 'info',
    title: 'Nhắc nhở quy trình',
    message: 'Đã đến giờ theo dõi sau hiến cho người hiến Trần Thị B',
    time: '15 phút trước',
    isRead: false,
  },
  {
    id: '3',
    type: 'success',
    title: 'Hoàn thành hiến máu',
    message: 'Người hiến Lê Văn C đã hoàn thành quy trình hiến máu',
    time: '30 phút trước',
    isRead: true,
  },
  {
    id: '4',
    type: 'warning',
    title: 'Quà tặng sắp hết',
    message: 'Số lượng Nón lưỡi trai chỉ còn 5 cái',
    time: '1 giờ trước',
    isRead: true,
  },
  {
    id: '5',
    type: 'info',
    title: 'Lịch hẹn mới',
    message: '3 người hiến đã đăng ký lịch hẹn cho ngày mai',
    time: '2 giờ trước',
    isRead: true,
  },
];

export default function NotificationsScreen({ navigation }) {
  const [notificationList, setNotificationList] = useState(notifications);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      case 'success':
        return 'check-circle';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'warning':
        return '#FFA502';
      case 'info':
        return '#1E90FF';
      case 'success':
        return '#2ED573';
      default:
        return '#95A5A6';
    }
  };

  const markAsRead = (id) => {
    setNotificationList(
      notificationList.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotificationList(
      notificationList.map((notification) => ({
        ...notification,
        isRead: true,
      }))
    );
  };

  const renderNotification = (notification) => (
    <TouchableOpacity
      key={notification.id}
      style={[
        styles.notificationCard,
        !notification.isRead && styles.unreadCard,
      ]}
      onPress={() => markAsRead(notification.id)}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: getNotificationColor(notification.type) + '20' },
        ]}
      >
        <MaterialIcons
          name={getNotificationIcon(notification.type)}
          size={24}
          color={getNotificationColor(notification.type)}
        />
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{notification.title}</Text>
          <Text style={styles.time}>{notification.time}</Text>
        </View>
        <Text style={styles.message}>{notification.message}</Text>
      </View>
    </TouchableOpacity>
  );

  const unreadCount = notificationList.filter(
    (notification) => !notification.isRead
  ).length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thông Báo</Text>
        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={markAllAsRead}
          >
            <MaterialIcons name="done-all" size={20} color="#FFFFFF" />
            <Text style={styles.markAllText}>Đọc tất cả</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Notification Count */}
      {unreadCount > 0 && (
        <View style={styles.countContainer}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
          <Text style={styles.countText}>thông báo chưa đọc</Text>
        </View>
      )}

      {/* Notifications List */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {notificationList.map(renderNotification)}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#FF6B6B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  markAllText: {
    color: '#FFFFFF',
    marginLeft: 4,
    fontSize: 14,
  },
  countContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  badge: {
    backgroundColor: '#FF6B6B',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  countText: {
    color: '#2D3436',
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unreadCard: {
    backgroundColor: '#FFF5F5',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  time: {
    fontSize: 12,
    color: '#95A5A6',
  },
  message: {
    fontSize: 14,
    color: '#636E72',
    lineHeight: 20,
  },
}); 