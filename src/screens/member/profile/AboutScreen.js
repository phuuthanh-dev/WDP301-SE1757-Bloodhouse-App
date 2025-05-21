import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  SafeAreaView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function AboutScreen({ navigation }) {
  const appVersion = '1.0.0';

  const socialLinks = [
    {
      title: 'Website',
      icon: 'language',
      url: 'https://bloodhouse.com',
    },
    {
      title: 'Facebook',
      icon: 'facebook',
      url: 'https://facebook.com/bloodhouse',
    },
    {
      title: 'Instagram',
      icon: 'camera',
      url: 'https://instagram.com/bloodhouse',
    },
  ];

  const handleOpenLink = (url) => {
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông tin ứng dụng</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* App Info */}
        <View style={styles.appInfo}>
          <Image
            source={require('@/assets/images/icon.png')}
            style={styles.appIcon}
          />
          <Text style={styles.appName}>Bloodhouse</Text>
          <Text style={styles.appVersion}>Phiên bản {appVersion}</Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.description}>
            Bloodhouse là ứng dụng kết nối cộng đồng hiến máu, giúp mọi người dễ dàng
            tham gia vào hoạt động hiến máu nhân đạo và tìm kiếm nguồn máu khi cần thiết.
          </Text>
        </View>

        {/* Social Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kết nối với chúng tôi</Text>
          {socialLinks.map((link, index) => (
            <TouchableOpacity
              key={index}
              style={styles.socialButton}
              onPress={() => handleOpenLink(link.url)}
            >
              <MaterialIcons name={link.icon} size={24} color="#2D3436" />
              <Text style={styles.socialText}>{link.title}</Text>
              <MaterialIcons name="chevron-right" size={24} color="#95A5A6" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Credits */}
        <View style={styles.credits}>
          <Text style={styles.creditText}>Phát triển bởi Team Bloodhouse</Text>
          <Text style={styles.copyright}>© 2024 Bloodhouse. All rights reserved.</Text>
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
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
  appInfo: {
    alignItems: 'center',
    padding: 32,
  },
  appIcon: {
    width: 100,
    height: 100,
    borderRadius: 20,
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 8,
  },
  appVersion: {
    fontSize: 16,
    color: '#95A5A6',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  description: {
    fontSize: 16,
    color: '#2D3436',
    lineHeight: 24,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 16,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  socialText: {
    flex: 1,
    fontSize: 16,
    color: '#2D3436',
    marginLeft: 16,
  },
  credits: {
    alignItems: 'center',
    padding: 32,
  },
  creditText: {
    fontSize: 14,
    color: '#95A5A6',
    marginBottom: 4,
  },
  copyright: {
    fontSize: 12,
    color: '#95A5A6',
  },
}); 