import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function BloodTypeListScreen({ navigation }) {
  // Mock data for blood type information
  const bloodTypeInfo = [
    {
      type: "A+",
      canGiveTo: ["A+", "AB+"],
      canReceiveFrom: ["A+", "A-", "O+", "O-"],
      percentage: "29.1%",
      description: "Nhóm máu A+ là một trong những nhóm máu phổ biến nhất.",
    },
    {
      type: "A-",
      canGiveTo: ["A+", "A-", "AB+", "AB-"],
      canReceiveFrom: ["A-", "O-"],
      percentage: "6.3%",
      description: "Nhóm máu A- có thể cho máu cho cả A+ và AB+.",
    },
    {
      type: "B+",
      canGiveTo: ["B+", "AB+"],
      canReceiveFrom: ["B+", "B-", "O+", "O-"],
      percentage: "20.1%",
      description: "Nhóm máu B+ là nhóm máu phổ biến thứ ba.",
    },
    {
      type: "B-",
      canGiveTo: ["B+", "B-", "AB+", "AB-"],
      canReceiveFrom: ["B-", "O-"],
      percentage: "1.7%",
      description: "Nhóm máu B- khá hiếm gặp.",
    },
    {
      type: "AB+",
      canGiveTo: ["AB+"],
      canReceiveFrom: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      percentage: "3.4%",
      description: "Người có nhóm máu AB+ có thể nhận máu từ tất cả các nhóm.",
    },
    {
      type: "AB-",
      canGiveTo: ["AB+", "AB-"],
      canReceiveFrom: ["A-", "B-", "AB-", "O-"],
      percentage: "0.6%",
      description: "AB- là một trong những nhóm máu hiếm nhất.",
    },
    {
      type: "O+",
      canGiveTo: ["O+", "A+", "B+", "AB+"],
      canReceiveFrom: ["O+", "O-"],
      percentage: "35.7%",
      description: "O+ là nhóm máu phổ biến nhất.",
    },
    {
      type: "O-",
      canGiveTo: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      canReceiveFrom: ["O-"],
      percentage: "3.1%",
      description: "O- được gọi là người cho máu toàn năng.",
    },
  ];

  const renderBloodTypeCard = (info) => (
    <TouchableOpacity
      key={info.type}
      style={styles.bloodTypeCard}
      onPress={() => navigation.navigate("BloodTypeDetail", { info })}
    >
      <View style={styles.bloodTypeHeader}>
        <View style={styles.typeContainer}>
          <Text style={styles.bloodType}>{info.type}</Text>
          <Text style={styles.percentage}>{info.percentage}</Text>
        </View>
        <MaterialIcons name="chevron-right" size={24} color="#95A5A6" />
      </View>

      <Text style={styles.description}>{info.description}</Text>

      <View style={styles.compatibilityContainer}>
        <View style={styles.compatibilitySection}>
          <Text style={styles.compatibilityLabel}>Có thể cho</Text>
          <View style={styles.bloodTypeList}>
            {info.canGiveTo.map((type) => (
              <View key={`give-${type}`} style={styles.smallBloodType}>
                <Text style={styles.smallBloodTypeText}>{type}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.compatibilitySection}>
          <Text style={styles.compatibilityLabel}>Có thể nhận</Text>
          <View style={styles.bloodTypeList}>
            {info.canReceiveFrom.map((type) => (
              <View key={`receive-${type}`} style={styles.smallBloodType}>
                <Text style={styles.smallBloodTypeText}>{type}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nhóm máu</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 32 }}>
        {bloodTypeInfo.map(renderBloodTypeCard)}
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
    backgroundColor: '#FF6B6B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  bloodTypeCard: {
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
  bloodTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bloodType: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginRight: 8,
  },
  percentage: {
    fontSize: 16,
    color: '#95A5A6',
  },
  description: {
    fontSize: 14,
    color: '#636E72',
    marginBottom: 16,
  },
  compatibilityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  compatibilitySection: {
    flex: 1,
  },
  compatibilityLabel: {
    fontSize: 14,
    color: '#95A5A6',
    marginBottom: 8,
  },
  bloodTypeList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  smallBloodType: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 4,
  },
  smallBloodTypeText: {
    fontSize: 12,
    color: '#2D3436',
  },
}); 