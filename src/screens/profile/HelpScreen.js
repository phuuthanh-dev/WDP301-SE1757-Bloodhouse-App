import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function HelpScreen({ navigation }) {
  const helpOptions = [
    {
      title: 'Câu hỏi thường gặp',
      icon: 'help',
      onPress: () => {},
    },
    {
      title: 'Liên hệ hỗ trợ',
      icon: 'headset-mic',
      onPress: () => Linking.openURL('tel:1900xxxx'),
    },
    {
      title: 'Hướng dẫn sử dụng',
      icon: 'menu-book',
      onPress: () => {},
    },
    {
      title: 'Báo cáo sự cố',
      icon: 'bug-report',
      onPress: () => {},
    },
    {
      title: 'Điều khoản sử dụng',
      icon: 'description',
      onPress: () => {},
    },
    {
      title: 'Chính sách bảo mật',
      icon: 'privacy-tip',
      onPress: () => {},
    },
  ];

  const renderHelpOption = (option, index) => (
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
        <Text style={styles.headerTitle}>Trợ giúp</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          {helpOptions.map((option, index) => renderHelpOption(option, index))}
        </View>

        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Liên hệ khẩn cấp</Text>
          <TouchableOpacity
            style={styles.emergencyButton}
            onPress={() => Linking.openURL('tel:115')}
          >
            <MaterialIcons name="emergency" size={24} color="#FF6B6B" />
            <Text style={styles.emergencyText}>115</Text>
          </TouchableOpacity>
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
  contactSection: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 16,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE9E9',
    padding: 12,
    borderRadius: 8,
  },
  emergencyText: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
}); 