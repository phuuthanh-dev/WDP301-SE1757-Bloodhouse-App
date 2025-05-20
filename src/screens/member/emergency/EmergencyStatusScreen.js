import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function EmergencyStatusScreen({ route, navigation }) {
  const { requestId } = route.params;
  const [refreshing, setRefreshing] = useState(false);
  const [request, setRequest] = useState({
    id: requestId,
    status: 'searching', // searching, found, completed, cancelled
    patientName: 'Nguyễn Văn A',
    bloodType: 'A+',
    units: 2,
    hospital: 'Bệnh viện Chợ Rẫy',
    createdAt: '2024-02-22T10:30:00Z',
    donors: [
      {
        id: 1,
        name: 'Trần Thị B',
        bloodType: 'A+',
        status: 'confirmed', // pending, confirmed, completed, cancelled
        scheduledTime: '2024-02-22T14:00:00Z',
      },
      {
        id: 2,
        name: 'Lê Văn C',
        bloodType: 'A+',
        status: 'pending',
        scheduledTime: null,
      },
    ],
  });

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate fetching updated data
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'searching':
        return '#FFB300';
      case 'found':
        return '#4CAF50';
      case 'completed':
        return '#2196F3';
      case 'cancelled':
        return '#F44336';
      default:
        return '#95A5A6';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'searching':
        return 'Đang tìm người hiến máu';
      case 'found':
        return 'Đã tìm thấy người hiến máu';
      case 'completed':
        return 'Đã hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return 'Không xác định';
    }
  };

  const getDonorStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#FFB300';
      case 'confirmed':
        return '#4CAF50';
      case 'completed':
        return '#2196F3';
      case 'cancelled':
        return '#F44336';
      default:
        return '#95A5A6';
    }
  };

  const getDonorStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Chờ xác nhận';
      case 'confirmed':
        return 'Đã xác nhận';
      case 'completed':
        return 'Đã hiến máu';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return 'Không xác định';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderTimeline = () => (
    <View style={styles.timeline}>
      <View style={styles.timelineItem}>
        <View style={[styles.timelineDot, { backgroundColor: '#4CAF50' }]} />
        <View style={styles.timelineContent}>
          <Text style={styles.timelineTitle}>Yêu cầu được tạo</Text>
          <Text style={styles.timelineTime}>{formatDate(request.createdAt)}</Text>
        </View>
      </View>

      {request.donors.map((donor) => (
        <View key={donor.id} style={styles.timelineItem}>
          <View
            style={[
              styles.timelineDot,
              { backgroundColor: getDonorStatusColor(donor.status) },
            ]}
          />
          <View style={styles.timelineContent}>
            <Text style={styles.timelineTitle}>
              {donor.name} ({donor.bloodType})
            </Text>
            <Text style={styles.timelineStatus}>
              {getDonorStatusText(donor.status)}
            </Text>
            {donor.scheduledTime && (
              <Text style={styles.timelineTime}>
                Lịch hẹn: {formatDate(donor.scheduledTime)}
              </Text>
            )}
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Status Header */}
      <View style={styles.header}>
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: getStatusColor(request.status) },
            ]}
          />
          <Text style={styles.statusText}>
            {getStatusText(request.status)}
          </Text>
        </View>
        <Text style={styles.requestId}>Mã yêu cầu: #{request.id}</Text>
      </View>

      {/* Request Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin yêu cầu</Text>
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Bệnh nhân</Text>
            <Text style={styles.detailValue}>{request.patientName}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Nhóm máu</Text>
            <Text style={styles.detailValue}>{request.bloodType}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Số đơn vị</Text>
            <Text style={styles.detailValue}>{request.units} đơn vị</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Bệnh viện</Text>
            <Text style={styles.detailValue}>{request.hospital}</Text>
          </View>
        </View>
      </View>

      {/* Timeline */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tiến trình</Text>
        {renderTimeline()}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton]}
          onPress={() => {/* Handle update */}}
        >
          <MaterialIcons name="refresh" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Cập nhật trạng thái</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={20} color="#FF6B6B" />
          <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
            Quay lại
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: Platform.OS === "android" ? 40 : 0,
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  requestId: {
    fontSize: 14,
    color: '#95A5A6',
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  detailItem: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    color: '#95A5A6',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#2D3436',
    fontWeight: '500',
  },
  timeline: {
    paddingLeft: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 24,
    position: 'relative',
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 16,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2D3436',
    marginBottom: 4,
  },
  timelineStatus: {
    fontSize: 14,
    color: '#95A5A6',
    marginBottom: 4,
  },
  timelineTime: {
    fontSize: 14,
    color: '#95A5A6',
  },
  actions: {
    padding: 16,
    paddingBottom: 32,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#FF6B6B',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  secondaryButtonText: {
    color: '#FF6B6B',
  },
}); 