import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  SafeAreaView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const bloodCompatibility = {
  wholeBlood: {
    'A+': {
      canGiveTo: ['A+', 'AB+'],
      canReceiveFrom: ['A+', 'A-', 'O+', 'O-'],
    },
    'A-': {
      canGiveTo: ['A+', 'A-', 'AB+', 'AB-'],
      canReceiveFrom: ['A-', 'O-'],
    },
    'B+': {
      canGiveTo: ['B+', 'AB+'],
      canReceiveFrom: ['B+', 'B-', 'O+', 'O-'],
    },
    'B-': {
      canGiveTo: ['B+', 'B-', 'AB+', 'AB-'],
      canReceiveFrom: ['B-', 'O-'],
    },
    'AB+': {
      canGiveTo: ['AB+'],
      canReceiveFrom: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    'AB-': {
      canGiveTo: ['AB+', 'AB-'],
      canReceiveFrom: ['A-', 'B-', 'AB-', 'O-'],
    },
    'O+': {
      canGiveTo: ['A+', 'B+', 'AB+', 'O+'],
      canReceiveFrom: ['O+', 'O-'],
    },
    'O-': {
      canGiveTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      canReceiveFrom: ['O-'],
    },
  },
  redBloodCells: {
    'A+': ['A+', 'A-', 'O+', 'O-'],
    'A-': ['A-', 'O-'],
    'B+': ['B+', 'B-', 'O+', 'O-'],
    'B-': ['B-', 'O-'],
    'AB+': ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-'],
    'AB-': ['AB-', 'A-', 'B-', 'O-'],
    'O+': ['O+', 'O-'],
    'O-': ['O-'],
  },
  plasma: {
    'A+': ['A+', 'AB+'],
    'A-': ['A+', 'A-', 'AB+', 'AB-'],
    'B+': ['B+', 'AB+'],
    'B-': ['B+', 'B-', 'AB+', 'AB-'],
    'AB+': ['AB+'],
    'AB-': ['AB+', 'AB-'],
    'O+': ['O+', 'A+', 'B+', 'AB+'],
    'O-': ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
  },
  platelets: {
    'A+': ['A+', 'AB+'],
    'A-': ['A+', 'A-', 'AB+', 'AB-'],
    'B+': ['B+', 'AB+'],
    'B-': ['B+', 'B-', 'AB+', 'AB-'],
    'AB+': ['AB+'],
    'AB-': ['AB+', 'AB-'],
    'O+': ['O+', 'A+', 'B+', 'AB+'],
    'O-': ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
  },
};

export default function BloodCompatibilityScreen() {
  const [selectedBloodType, setSelectedBloodType] = useState(null);
  const [selectedComponent, setSelectedComponent] = useState('wholeBlood');

  const components = [
    { id: 'wholeBlood', label: 'Máu toàn phần' },
    { id: 'redBloodCells', label: 'Hồng cầu' },
    { id: 'plasma', label: 'Huyết tương' },
    { id: 'platelets', label: 'Tiểu cầu' },
  ];

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const getCompatibleTypes = (bloodType, component) => {
    if (!bloodType) return [];
    
    if (component === 'wholeBlood') {
      return {
        canGiveTo: bloodCompatibility.wholeBlood[bloodType].canGiveTo,
        canReceiveFrom: bloodCompatibility.wholeBlood[bloodType].canReceiveFrom,
      };
    }
    
    return bloodCompatibility[component][bloodType];
  };

  const renderBloodTypeButton = (type) => (
    <TouchableOpacity
      key={type}
      style={[
        styles.bloodTypeButton,
        selectedBloodType === type && styles.selectedBloodType,
      ]}
      onPress={() => setSelectedBloodType(type)}
    >
      <Text
        style={[
          styles.bloodTypeButtonText,
          selectedBloodType === type && styles.selectedBloodTypeText,
        ]}
      >
        {type}
      </Text>
    </TouchableOpacity>
  );

  const renderCompatibilityInfo = () => {
    if (!selectedBloodType) return null;

    const compatibility = getCompatibleTypes(selectedBloodType, selectedComponent);

    if (selectedComponent === 'wholeBlood') {
      return (
        <View style={styles.compatibilityContainer}>
          <View style={styles.compatibilitySection}>
            <Text style={styles.compatibilityTitle}>Có thể cho máu cho</Text>
            <View style={styles.bloodTypeGrid}>
              {compatibility.canGiveTo.map((type) => (
                <View key={type} style={styles.compatibleType}>
                  <Text style={styles.compatibleTypeText}>{type}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.compatibilitySection}>
            <Text style={styles.compatibilityTitle}>Có thể nhận máu từ</Text>
            <View style={styles.bloodTypeGrid}>
              {compatibility.canReceiveFrom.map((type) => (
                <View key={type} style={styles.compatibleType}>
                  <Text style={styles.compatibleTypeText}>{type}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.compatibilityContainer}>
        <Text style={styles.compatibilityTitle}>Có thể nhận từ</Text>
        <View style={styles.bloodTypeGrid}>
          {compatibility.map((type) => (
            <View key={type} style={styles.compatibleType}>
              <Text style={styles.compatibleTypeText}>{type}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Kiểm tra tương thích máu</Text>
        <Text style={styles.subtitle}>
          Chọn nhóm máu và thành phần để xem thông tin tương thích
        </Text>
      </View>

      {/* Component Selection */}
      <View style={styles.componentSelection}>
        {components.map((component) => (
          <TouchableOpacity
            key={component.id}
            style={[
              styles.componentButton,
              selectedComponent === component.id && styles.selectedComponent,
            ]}
            onPress={() => setSelectedComponent(component.id)}
          >
            <Text
              style={[
                styles.componentButtonText,
                selectedComponent === component.id && styles.selectedComponentText,
              ]}
            >
              {component.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Blood Type Selection */}
      <View style={styles.bloodTypeSelection}>
        <Text style={styles.sectionTitle}>Chọn nhóm máu</Text>
        <View style={styles.bloodTypeGrid}>
          {bloodTypes.map(renderBloodTypeButton)}
        </View>
      </View>

      {/* Compatibility Information */}
      {selectedBloodType && renderCompatibilityInfo()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: Platform.OS === "android" ? 40 : 0,
  },
  header: {
    backgroundColor: '#FF6B6B',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  componentSelection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginTop: -10,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  componentButton: {
    flex: 1,
    minWidth: '45%',
    margin: 4,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    alignItems: 'center',
  },
  selectedComponent: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  componentButtonText: {
    color: '#2D3436',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedComponentText: {
    color: '#FFFFFF',
  },
  bloodTypeSelection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 16,
  },
  bloodTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  bloodTypeButton: {
    width: '23%',
    margin: '1%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  selectedBloodType: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  bloodTypeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  selectedBloodTypeText: {
    color: '#FFFFFF',
  },
  compatibilityContainer: {
    padding: 16,
  },
  compatibilitySection: {
    marginBottom: 24,
  },
  compatibilityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 12,
  },
  compatibleType: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    margin: 4,
  },
  compatibleTypeText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 