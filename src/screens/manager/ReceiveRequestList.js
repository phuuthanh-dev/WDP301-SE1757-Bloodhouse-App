import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import bloodRequestAPI from '@/apis/bloodRequestAPI';
import { formatDateTime } from '@/utils/formatHelpers';
import { getStatusReceiveBloodColor, getStatusReceiveBloodName } from '@/constants/receiveBloodStatus';

// Filter chip component
const FilterChip = ({ label, value, icon, isActive, onPress }) => (
  <TouchableOpacity
    style={[styles.filterChip, isActive && styles.activeFilterChip]}
    onPress={onPress}
  >
    <MaterialIcons
      name={icon}
      size={18}
      color={isActive ? '#FFFFFF' : '#636E72'}
    />
    <Text style={[styles.filterChipText, isActive && styles.activeFilterChipText]}>
      {label}
    </Text>
  </TouchableOpacity>
);

// Stats component
const Stats = ({ total, pending, completed }) => (
  <View style={styles.statsContainer}>
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{total}</Text>
      <Text style={styles.statLabel}>Tổng yêu cầu</Text>
    </View>
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{pending}</Text>
      <Text style={styles.statLabel}>Chờ duyệt</Text>
    </View>
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{completed}</Text>
      <Text style={styles.statLabel}>Hoàn thành</Text>
    </View>
  </View>
);

// Request card component
const RequestCard = ({ request, onPress }) => (
  <TouchableOpacity style={styles.requestCard} onPress={onPress}>
    <View style={styles.cardHeader}>
      <View style={styles.userInfo}>
        <MaterialIcons name="person" size={20} color="#636E72" />
        <Text style={styles.userName}>{request.userId.fullName}</Text>
      </View>
      <View
        style={[
          styles.statusBadge,
          { backgroundColor: getStatusReceiveBloodColor(request.status) + '20' },
        ]}
      >
        <Text
          style={[
            styles.statusText,
            { color: getStatusReceiveBloodColor(request.status) },
          ]}
        >
          {getStatusReceiveBloodName(request.status)}
        </Text>
      </View>
    </View>

    <View style={styles.cardContent}>
      <View style={styles.infoRow}>
        <MaterialIcons name="event" size={20} color="#636E72" />
        <Text style={styles.infoText}>
          Ngày yêu cầu: {formatDateTime(request.createdAt)}
        </Text>
      </View>

      {request.scheduleDate && (
        <View style={styles.infoRow}>
          <MaterialIcons name="schedule" size={20} color="#636E72" />
          <Text style={styles.infoText}>
            Ngày hẹn: {formatDateTime(request.scheduleDate)}
          </Text>
        </View>
      )}

      <View style={styles.infoRow}>
        <MaterialIcons name="opacity" size={20} color="#636E72" />
        <Text style={styles.infoText}>
          Nhóm máu: {request.groupId.name} • {request.quantity}ml
        </Text>
      </View>

      <View style={styles.infoRow}>
        <MaterialIcons name="info" size={20} color="#636E72" />
        <Text style={styles.infoText} numberOfLines={2}>
          Lý do: {request.note}
        </Text>
      </View>
    </View>

    <View style={styles.cardFooter}>
      <TouchableOpacity style={styles.actionButton} onPress={onPress}>
        <MaterialIcons name="visibility" size={20} color="#FF6B6B" />
        <Text style={styles.actionButtonText}>Xem chi tiết</Text>
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

export default function ReceiveRequestList({ navigation }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await bloodRequestAPI.HandleBloodRequest('/facility');
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filteredRequests = requests.filter(request => {
    if (activeFilter === 'all') return true;
    return request.status === activeFilter;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending_approval').length,
    completed: requests.filter(r => r.status === 'completed').length,
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yêu Cầu Nhận Máu</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        <FilterChip
          label="Tất cả"
          value="all"
          icon="list"
          isActive={activeFilter === 'all'}
          onPress={() => setActiveFilter('all')}
        />
        <FilterChip
          label="Chờ duyệt"
          value="pending_approval"
          icon="pending"
          isActive={activeFilter === 'pending_approval'}
          onPress={() => setActiveFilter('pending_approval')}
        />
        <FilterChip
          label="Đã duyệt"
          value="approved"
          icon="check-circle"
          isActive={activeFilter === 'approved'}
          onPress={() => setActiveFilter('approved')}
        />
        <FilterChip
          label="Hoàn thành"
          value="completed"
          icon="verified"
          isActive={activeFilter === 'completed'}
          onPress={() => setActiveFilter('completed')}
        />
      </ScrollView>

      <Stats {...stats} />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchRequests} />
        }
      >
        {filteredRequests.map(request => (
          <RequestCard
            key={request._id}
            request={request}
            onPress={() => navigation.navigate('ReceiveRequestDetail', { request })}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: Platform.OS === 'android' ? 40 : 0,
  },
  header: {
    backgroundColor: '#FF6B6B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
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
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
  },
  filtersContent: {
    paddingHorizontal: 16,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  activeFilterChip: {
    backgroundColor: '#FF6B6B',
  },
  filterChipText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#636E72',
  },
  activeFilterChipText: {
    color: '#FFFFFF',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#636E72',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  requestCard: {
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
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardContent: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#636E72',
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    padding: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#FF6B6B',
  },
}); 