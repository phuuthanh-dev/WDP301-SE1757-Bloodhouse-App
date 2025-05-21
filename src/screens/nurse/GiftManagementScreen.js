import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

// Mock data for gifts
const gifts = [
  {
    id: '1',
    name: 'Áo Thun BloodHouse',
    code: 'BH-SHIRT-001',
    quantity: 50,
    type: 'Áo',
    status: 'Còn hàng',
  },
  {
    id: '2',
    name: 'Túi Canvas',
    code: 'BH-BAG-001',
    quantity: 30,
    type: 'Túi',
    status: 'Còn hàng',
  },
  {
    id: '3',
    name: 'Bình Nước',
    code: 'BH-BOTTLE-001',
    quantity: 20,
    type: 'Bình nước',
    status: 'Sắp hết',
  },
  {
    id: '4',
    name: 'Nón Lưỡi Trai',
    code: 'BH-CAP-001',
    quantity: 5,
    type: 'Nón',
    status: 'Sắp hết',
  },
  {
    id: '5',
    name: 'Voucher Cafe',
    code: 'BH-VOUCHER-001',
    quantity: 0,
    type: 'Voucher',
    status: 'Hết hàng',
  },
];

export default function GiftManagementScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Tất cả');

  const getStatusColor = (status) => {
    switch (status) {
      case 'Còn hàng':
        return '#2ED573';
      case 'Sắp hết':
        return '#FFA502';
      case 'Hết hàng':
        return '#FF4757';
      default:
        return '#95A5A6';
    }
  };

  const handleDistributeGift = (gift) => {
    if (gift.quantity === 0) {
      Alert.alert('Thông báo', 'Quà tặng đã hết hàng!');
      return;
    }
    navigation.navigate('GiftDistributionForm', { gift });
  };

  const renderGiftCard = (gift) => (
    <View key={gift.id} style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.giftCode}>{gift.code}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(gift.status) + '20' },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(gift.status) },
              ]}
            >
              {gift.status}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.giftName}>{gift.name}</Text>
        <View style={styles.giftInfo}>
          <View style={styles.infoItem}>
            <MaterialIcons name="category" size={16} color="#636E72" />
            <Text style={styles.infoText}>{gift.type}</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialIcons name="inventory" size={16} color="#636E72" />
            <Text style={styles.infoText}>Số lượng: {gift.quantity}</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            gift.quantity === 0 && styles.disabledButton,
          ]}
          onPress={() => handleDistributeGift(gift)}
          disabled={gift.quantity === 0}
        >
          <MaterialIcons name="redeem" size={16} color="#FF6B6B" />
          <Text style={styles.actionText}>Phát quà</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản Lý Quà Tặng</Text>
        <TouchableOpacity style={styles.filterButton}>
          <MaterialIcons name="filter-list" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={20} color="#95A5A6" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm quà tặng..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          {['Tất cả', 'Còn hàng', 'Sắp hết', 'Hết hàng'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                selectedFilter === filter && {
                  backgroundColor: filter === 'Tất cả' ? '#FF6B6B' : getStatusColor(filter),
                },
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedFilter === filter && styles.filterChipTextActive,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Gift List */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {gifts
          .filter(
            (gift) =>
              (selectedFilter === 'Tất cả' || gift.status === selectedFilter) &&
              (gift.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                gift.code.toLowerCase().includes(searchQuery.toLowerCase()))
          )
          .map(renderGiftCard)}
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
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F2F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#2D3436',
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  filterContent: {
    paddingHorizontal: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F2F6',
    marginRight: 8,
  },
  filterChipText: {
    color: '#636E72',
    fontSize: 14,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  giftCode: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2D3436',
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardContent: {
    padding: 16,
  },
  giftName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 8,
  },
  giftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  infoText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#636E72',
  },
  cardActions: {
    flexDirection: 'row',
    padding: 12,
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FF6B6B20',
  },
  disabledButton: {
    opacity: 0.5,
  },
  actionText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
    color: '#FF6B6B',
  },
}); 