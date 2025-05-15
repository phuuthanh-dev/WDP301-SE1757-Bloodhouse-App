import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const bloodTypeDetails = {
  'A+': {
    description: 'Nhóm máu A dương tính chiếm khoảng 29.1% dân số Việt Nam.',
    canGiveTo: ['A+', 'AB+'],
    canReceiveFrom: ['A+', 'A-', 'O+', 'O-'],
    characteristics: [
      'Có kháng nguyên A trên bề mặt hồng cầu',
      'Có kháng thể anti-B trong huyết tương',
      'Có protein Rh trên bề mặt hồng cầu (Rh+)',
    ],
    donationTips: [
      'Uống nhiều nước trước khi hiến máu',
      'Đảm bảo đủ 8 tiếng ngủ đêm trước',
      'Ăn đầy đủ bữa sáng',
      'Tránh thức ăn nhiều dầu mỡ',
    ],
  },
  'A-': {
    description: 'Nhóm máu A âm tính khá hiếm, chỉ chiếm khoảng 0.4% dân số.',
    canGiveTo: ['A+', 'A-', 'AB+', 'AB-'],
    canReceiveFrom: ['A-', 'O-'],
    characteristics: [
      'Có kháng nguyên A trên bề mặt hồng cầu',
      'Có kháng thể anti-B trong huyết tương',
      'Không có protein Rh trên bề mặt hồng cầu (Rh-)',
    ],
    donationTips: [
      'Uống nhiều nước trước khi hiến máu',
      'Đảm bảo đủ 8 tiếng ngủ đêm trước',
      'Ăn đầy đủ bữa sáng',
      'Tránh thức ăn nhiều dầu mỡ',
    ],
  },
  'B+': {
    description: 'Nhóm máu B dương tính chiếm khoảng 29.1% dân số Việt Nam.',
    canGiveTo: ['B+', 'AB+'],
    canReceiveFrom: ['B+', 'B-', 'O+', 'O-'],
    characteristics: [
      'Có kháng nguyên B trên bề mặt hồng cầu',
      'Có kháng thể anti-A trong huyết tương',
      'Có protein Rh trên bề mặt hồng cầu (Rh+)',
    ],
    donationTips: [
      'Uống nhiều nước trước khi hiến máu',
      'Đảm bảo đủ 8 tiếng ngủ đêm trước',
      'Ăn đầy đủ bữa sáng',
      'Tránh thức ăn nhiều dầu mỡ',
    ],
  },
  'B-': {
    description: 'Nhóm máu B âm tính chiếm khoảng 0.4% dân số Việt Nam.',
    canGiveTo: ['B+', 'B-', 'AB+', 'AB-'],
    canReceiveFrom: ['B-', 'O-'],
    characteristics: [
      'Có kháng nguyên B trên bề mặt hồng cầu',
      'Có kháng thể anti-A trong huyết tương',
      'Không có protein Rh trên bề mặt hồng cầu (Rh-)',
    ],
    donationTips: [
      'Uống nhiều nước trước khi hiến máu',
      'Đảm bảo đủ 8 tiếng ngủ đêm trước',
      'Ăn đầy đủ bữa sáng',
      'Tránh thức ăn nhiều dầu mỡ',
    ],
  },
  'AB+': {
    description: 'Nhóm máu AB dương tính chiếm khoảng 0.4% dân số Việt Nam.',
    canGiveTo: ['AB+', 'AB-'],
    canReceiveFrom: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
    characteristics: [
      'Có kháng nguyên A và B trên bề mặt hồng cầu',
      'Không có kháng thể anti-A và anti-B trong huyết tương',
      'Có protein Rh trên bề mặt hồng cầu (Rh+)',
    ],
    donationTips: [
      'Uống nhiều nước trước khi hiến máu',
      'Đảm bảo đủ 8 tiếng ngủ đêm trước',
      'Ăn đầy đủ bữa sáng',
      'Tránh thức ăn nhiều dầu mỡ',
    ],
  },
  "O+": {
    description: 'Nhóm máu O dương tính chiếm khoảng 37.4% dân số Việt Nam.',
    canGiveTo: ['A+', 'B+', 'AB+', 'O+'],
    canReceiveFrom: ['O+', 'O-'],
    characteristics: [
      'Không có kháng nguyên A và B trên bề mặt hồng cầu',
      'Không có kháng thể anti-A và anti-B trong huyết tương',
      'Có protein Rh trên bề mặt hồng cầu (Rh+)',
    ],
    donationTips: [
      'Uống nhiều nước trước khi hiến máu',
      'Đảm bảo đủ 8 tiếng ngủ đêm trước',
      'Ăn đầy đủ bữa sáng',
      'Tránh thức ăn nhiều dầu mỡ',
    ],
  },
  "O-": {
    description: 'Nhóm máu O âm tính chiếm khoảng 37.4% dân số Việt Nam.',
    canGiveTo: ['A+', 'B+', 'AB+', 'O+', 'O-'],
    canReceiveFrom: ['O-'],
    characteristics: [
      'Không có kháng nguyên A và B trên bề mặt hồng cầu',
      'Không có kháng thể anti-A và anti-B trong huyết tương',
      'Không có protein Rh trên bề mặt hồng cầu (Rh-)',
    ],
    donationTips: [
      'Uống nhiều nước trước khi hiến máu',
      'Đảm bảo đủ 8 tiếng ngủ đêm trước',
      'Ăn đầy đủ bữa sáng',
      'Tránh thức ăn nhiều dầu mỡ',
    ],
  },
};

export default function BloodTypeDetailScreen({ route, navigation }) {
  const { info } = route.params;
  const details = bloodTypeDetails[info.type];

  const renderCompatibilitySection = (title, types) => (
    <View style={styles.compatibilitySection}>
      <Text style={styles.sectionSubtitle}>{title}</Text>
      <View style={styles.bloodTypeGrid}>
        {types.map((type) => (
          <View key={type} style={styles.bloodTypeChip}>
            <Text style={styles.bloodTypeChipText}>{type}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderList = (items) => (
    <View style={styles.listContainer}>
      {items.map((item, index) => (
        <View key={index} style={styles.listItem}>
          <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
          <Text style={styles.listItemText}>{item}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.bloodType}>{info.type}</Text>
          <Text style={styles.percentage}>{info.percentage} dân số</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin chung</Text>
          <Text style={styles.description}>{details.description}</Text>
        </View>

        {/* Compatibility */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tương thích máu</Text>
          {renderCompatibilitySection('Có thể cho máu cho', details.canGiveTo)}
          {renderCompatibilitySection('Có thể nhận máu từ', details.canReceiveFrom)}
        </View>

        {/* Characteristics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Đặc điểm</Text>
          {renderList(details.characteristics)}
        </View>

        {/* Donation Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lưu ý khi hiến máu</Text>
          {renderList(details.donationTips)}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#FF6B6B',
    padding: 20,
    paddingTop: 40,
  },
  backButton: {
    marginBottom: 16,
  },
  headerContent: {
    alignItems: 'center',
  },
  bloodType: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  percentage: {
    fontSize: 18,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  content: {
    padding: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#95A5A6',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#2D3436',
    lineHeight: 24,
  },
  compatibilitySection: {
    marginBottom: 16,
  },
  bloodTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  bloodTypeChip: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    margin: 4,
  },
  bloodTypeChipText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContainer: {
    marginTop: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  listItemText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#2D3436',
    flex: 1,
  },
}); 