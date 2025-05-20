import React, { useEffect } from 'react';
import { View, Button, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNotification } from '@/contexts/NotificationContext';
import * as Clipboard from 'expo-clipboard';
import * as Notifications from 'expo-notifications';

export default function NotificationTestScreen() {
  const {
    hasPermission,
    pushToken,
    scheduledNotifications,
    scheduleDonationReminder,
    scheduleNextDonationEligibility,
    sendEmergencyNotification,
    cancelAllNotifications,
  } = useNotification();

  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });
  
    return () => subscription.remove();
  }, []);

  const handleScheduleDonation = async () => {
    const success = await scheduleDonationReminder();
    if (success) {
      console.log('Donation reminder scheduled successfully');
    }
  };

  const handleEligibilityReminder = async () => {
    const success = await scheduleNextDonationEligibility(new Date(), 'male');
    if (success) {
      console.log('Eligibility reminder scheduled successfully');
    }
  };

  const handleEmergencyTest = async () => {
    const success = await sendEmergencyNotification('A+', 'Bệnh viện Chợ Rẫy');
    if (success) {
      console.log('Emergency notification sent successfully');
    }
  };

  const copyTokenToClipboard = async () => {
    if (pushToken) {
      await Clipboard.setStringAsync(pushToken);
      alert('Token đã được sao chép!');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('vi-VN');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trạng thái thông báo</Text>
        <Text style={styles.statusText}>
          Quyền thông báo: {hasPermission ? '✅ Đã cấp quyền' : '❌ Chưa cấp quyền'}
        </Text>
        <Text style={styles.sectionTitle}>Push Token</Text>
        <TouchableOpacity onPress={copyTokenToClipboard}>
          <Text style={styles.tokenText}>
            {pushToken ? pushToken : 'Chưa có token'}
          </Text>
          {pushToken && (
            <Text style={styles.copyHint}>
              Nhấn để sao chép token
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Kiểm tra thông báo</Text>
        <Button 
          title="Test Nhắc nhở hiến máu (5s)" 
          onPress={handleScheduleDonation}
          disabled={!hasPermission}
        />
        <View style={styles.spacing} />
        <Button 
          title="Test Nhắc đủ điều kiện (10s)" 
          onPress={handleEligibilityReminder}
          disabled={!hasPermission}
        />
        <View style={styles.spacing} />
        <Button 
          title="Test Thông báo khẩn cấp (ngay lập tức)" 
          onPress={handleEmergencyTest}
          disabled={!hasPermission}
        />
        <View style={styles.spacing} />
        <Button 
          title="Xóa tất cả thông báo" 
          onPress={cancelAllNotifications}
          color="#FF6B6B"
          disabled={!hasPermission}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông báo đã lên lịch</Text>
        {scheduledNotifications.length === 0 ? (
          <Text style={styles.noNotifications}>Không có thông báo nào</Text>
        ) : (
          scheduledNotifications.map((notification, index) => (
            <View key={index} style={styles.notificationItem}>
              <Text style={styles.notificationTitle}>
                {notification.content.title}
              </Text>
              <Text style={styles.notificationBody}>
                {notification.content.body}
              </Text>
              <Text style={styles.notificationTime}>
                Thời gian: {formatDate(notification.trigger.date)}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F8F9FA',
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2D3436',
  },
  statusText: {
    fontSize: 16,
    marginBottom: 16,
    color: '#2D3436',
  },
  tokenText: {
    fontSize: 14,
    color: '#64748B',
    padding: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    marginBottom: 4,
  },
  copyHint: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  spacing: {
    height: 12,
  },
  notificationItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#2D3436',
  },
  notificationBody: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#94A3B8',
  },
  noNotifications: {
    fontSize: 14,
    color: '#64748B',
    fontStyle: 'italic',
  },
}); 