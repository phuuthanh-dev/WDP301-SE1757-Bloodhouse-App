import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function SecurityScreen({ navigation }) {
  const securityOptions = [
    {
      title: 'Đổi mật khẩu',
      icon: 'lock',
      onPress: () => {},
    },
    {
      title: 'Xác thực 2 lớp',
      icon: 'security',
      onPress: () => {},
    },
    {
      title: 'Thiết bị đã đăng nhập',
      icon: 'devices',
      onPress: () => {},
    },
    {
      title: 'Lịch sử đăng nhập',
      icon: 'history',
      onPress: () => {},
    },
  ];

  const renderSecurityOption = (option, index) => (
    <TouchableOpacity
      key={index}
      style={styles.optionButton}
      onPress={option.onPress}
    >
      <View style={styles.optionContent}>
        <MaterialIcons name={option.icon} size={24} color="#2D3436" />
        <Text style={styles.optionText}>{option.title}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color="#95A5A6" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bảo mật</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          {securityOptions.map((option, index) => renderSecurityOption(option, index))}
        </View>

        <View style={styles.infoSection}>
          <MaterialIcons name="info" size={20} color="#95A5A6" />
          <Text style={styles.infoText}>
            Bảo mật tài khoản giúp bảo vệ thông tin cá nhân của bạn khỏi các truy cập trái phép
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    color: '#2D3436',
    marginLeft: 16,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    marginTop: 16,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#95A5A6',
    lineHeight: 20,
  },
}); 