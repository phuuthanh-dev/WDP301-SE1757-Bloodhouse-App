import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import giftAPI from '@/apis/giftAPI';

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = (screenWidth - 48) / 2; // 2 columns with margins

export default function GiftDistributionScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { donationId, donorName, bloodType, donationData } = route.params;

  const [loading, setLoading] = useState(false);
  const [availableGifts, setAvailableGifts] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null); // Single selection
  const [distributing, setDistributing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPackageDetail, setSelectedPackageDetail] = useState(null);

  useEffect(() => {
    fetchAvailableGifts();
  }, []);

  const fetchAvailableGifts = async () => {
    setLoading(true);
    try {
      // Use nurse-specific API that gets facility from token
      const response = await giftAPI.getNurseAvailableGifts(donationId);
      
      if (response.data) {
        setAvailableGifts(response.data);
      }
    } catch (error) {
      console.error('Error fetching available gifts:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách quà');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPackage = (packageData) => {
    const packageId = packageData.package._id;
    
    // Single selection logic
    if (selectedPackage?.id === packageId) {
      // Deselect if same package is selected
      setSelectedPackage(null);
    } else {
      // Select new package
      setSelectedPackage({
        id: packageId,
        name: packageData.package.name,
        description: packageData.package.description,
        image: packageData.package.image,
        quantity: packageData.availablePackageQuantity || packageData.package.quantity || 0,
        originalData: packageData
      });
    }
  };

  const handleViewPackageDetail = (packageData) => {
    setSelectedPackageDetail(packageData);
    setModalVisible(true);
  };

  const handleDistributePackage = async () => {
    if (!selectedPackage) {
      Alert.alert('Thông báo', 'Vui lòng chọn một gói quà');
      return;
    }

    Alert.alert(
      'Xác nhận phân phối',
      `Bạn có chắc muốn phân phối gói quà "${selectedPackage.name}" cho ${donorName}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xác nhận', onPress: confirmDistribution }
      ]
    );
  };

  const confirmDistribution = async () => {
    setDistributing(true);
    try {
      const distributionData = {
        donationId: donationId,
        packageId: selectedPackage.id,
        notes: `Phân phối gói quà sau hiến máu cho ${donorName}`,
      };

      await giftAPI.nurseDistributeGiftPackage(distributionData);

      Alert.alert(
        'Thành công',
        'Đã phân phối gói quà thành công!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Error distributing package:', error);
      Alert.alert('Lỗi', 'Không thể phân phối gói quà. Vui lòng thử lại.');
    } finally {
      setDistributing(false);
    }
  };

  const renderGiftPackage = ({ item, index }) => {
    const isSelected = selectedPackage?.id === item.package._id;

    return (
      <View style={[styles.gridItem, index % 2 === 1 && styles.gridItemRight]}>
        <TouchableOpacity
          style={[styles.packageCard, isSelected && styles.selectedCard]}
          onPress={() => handleSelectPackage(item)}
        >
          {/* Package Image */}
          <View style={styles.cardImageContainer}>
            <Image
              source={{ uri: item.package.image || 'https://via.placeholder.com/120' }}
              style={styles.cardImage}
              resizeMode="cover"
            />
            {isSelected && (
              <View style={styles.selectedOverlay}>
                <MaterialCommunityIcons name="check-circle" size={32} color="#FFF" />
              </View>
            )}
            {/* Info Button */}
            <TouchableOpacity
              style={styles.infoButton}
              onPress={() => handleViewPackageDetail(item)}
            >
              <MaterialIcons name="info-outline" size={16} color="#FF6B6B" />
            </TouchableOpacity>
          </View>

          {/* Package Info - Fixed Height Container */}
          <View style={styles.cardInfoContainer}>
            <View style={styles.cardTitleContainer}>
              <Text style={styles.cardTitle} numberOfLines={2} ellipsizeMode="tail">
                {item.package.name}
              </Text>
            </View>
            
            <View style={styles.cardMiddleSection}>
              <View style={styles.packageBadge}>
                <MaterialCommunityIcons name="package-variant" size={12} color="#FF6B6B" />
                <Text style={styles.badgeText}>
                  {item.package.items?.length || 0} món
                </Text>
              </View>
            </View>

            <View style={styles.cardBottomSection}>
              <View style={styles.quantityContainer}>
                <MaterialCommunityIcons name="package-variant" size={14} color="#2ED573" />
                <Text style={styles.quantityText}>
                  {item.availablePackageQuantity || item.package.quantity || 0} gói có sẵn
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderPackageDetailModal = () => {
    if (!selectedPackageDetail) return null;

    const { package: pkg, availablePackageQuantity } = selectedPackageDetail;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={2}>{pkg.name}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseIcon}>
                <MaterialIcons name="close" size={24} color="#636E72" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Package Image */}
              <View style={styles.modalImageContainer}>
                <Image
                  source={{ uri: pkg.image || 'https://via.placeholder.com/200' }}
                  style={styles.modalImage}
                  resizeMode="cover"
                />
              </View>

              {/* Package Description */}
              {pkg.description && (
                <View style={styles.modalDescriptionContainer}>
                  <Text style={styles.modalDescription}>{pkg.description}</Text>
                </View>
              )}

              {/* Package Quantity Info */}
              <View style={styles.modalQuantitySection}>
                <View style={styles.modalQuantityContent}>
                  <MaterialCommunityIcons name="package-variant" size={20} color="#2ED573" />
                  <Text style={styles.modalQuantityLabel}>Số lượng có sẵn:</Text>
                </View>
                <Text style={styles.modalQuantityValue}>
                  {availablePackageQuantity || pkg.quantity || 0} gói
                </Text>
              </View>

              {/* Package Items */}
              <View style={styles.modalItemsSection}>
                <View style={styles.modalSectionHeader}>
                  <MaterialCommunityIcons name="gift-outline" size={20} color="#FF6B6B" />
                  <Text style={styles.modalSectionTitle}>Bao gồm các món quà:</Text>
                </View>
                {pkg.items?.map((packageItem, index) => (
                  <View key={index} style={styles.modalItem}>
                    <View style={styles.modalItemImageContainer}>
                      <Image
                        source={{ 
                          uri: packageItem.giftItemId.image || 'https://via.placeholder.com/60x60?text=Gift'
                        }}
                        style={styles.modalItemImage}
                        resizeMode="cover"
                      />
                    </View>
                    <View style={styles.modalItemInfo}>
                      <Text style={styles.modalItemName}>
                        {packageItem.giftItemId.name}
                      </Text>
                      <Text style={styles.modalItemDetails}>
                        {packageItem.quantity} {packageItem.giftItemId.unit}
                      </Text>
                      <View style={styles.modalItemCategory}>
                        <MaterialCommunityIcons name="tag" size={12} color="#FF6B6B" />
                        <Text style={styles.modalItemCategoryText}>
                          {packageItem.giftItemId.category}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>

            {/* Modal Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCancelButtonText}>Đóng</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSelectButton}
                onPress={() => {
                  handleSelectPackage(selectedPackageDetail);
                  setModalVisible(false);
                }}
              >
                <MaterialCommunityIcons name="plus" size={18} color="#FFF" />
                <Text style={styles.modalSelectButtonText}>Chọn gói này</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Phân Phối Quà</Text>
            <Text style={styles.headerSubtitle}>Chọn gói quà tặng cho người hiến máu</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons name="loading" size={48} color="#8B5CF6" />
          <Text style={styles.loadingText}>Đang tải danh sách gói quà...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header - Following donationDetailScreen style */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Phân Phối Quà</Text>
          <Text style={styles.headerSubtitle}>Chọn gói quà tặng cho người hiến máu</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Donor Info Card */}
      <View style={styles.donorInfoCard}>
        <View style={styles.donorInfoHeader}>
          <View style={styles.donorIconContainer}>
            <MaterialCommunityIcons name="account-heart" size={24} color="#fff" />
          </View>
          <View style={styles.donorInfoContent}>
            <Text style={styles.donorName}>{donorName}</Text>
            <View style={styles.bloodTypeContainer}>
              <MaterialCommunityIcons name="water" size={16} color="#FF6B6B" />
              <Text style={styles.donorBloodType}>Nhóm máu {bloodType}</Text>
            </View>
          </View>
          <View style={styles.donorStatusBadge}>
            <Text style={styles.donorStatusText}>Hoàn thành</Text>
          </View>
        </View>
      </View>

      {/* Packages Section */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {availableGifts.packages && availableGifts.packages.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <MaterialCommunityIcons name="package-variant" size={20} color="#FF6B6B" />
                <Text style={styles.sectionTitle}>Gói quà có sẵn</Text>
              </View>
              <View style={styles.sectionCount}>
                <Text style={styles.sectionCountText}>{availableGifts.packages.length}</Text>
              </View>
            </View>
            <Text style={styles.sectionDescription}>
              Chọn một gói quà để phân phối cho người hiến máu
            </Text>
            <FlatList
              data={availableGifts.packages}
              renderItem={renderGiftPackage}
              keyExtractor={(item) => `package_${item.package._id}`}
              numColumns={2}
              scrollEnabled={false}
              contentContainerStyle={styles.gridContainer}
              columnWrapperStyle={styles.gridRow}
            />
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <MaterialCommunityIcons name="package-variant-closed" size={64} color="#CBD5E0" />
            </View>
            <Text style={styles.emptyTitle}>Không có gói quà khả dụng</Text>
            <Text style={styles.emptyText}>Hiện tại không có gói quà nào có sẵn để phân phối cho người hiến máu này</Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Action */}
      {selectedPackage && (
        <View style={styles.bottomSection}>
          <View style={styles.selectedSummary}>
            <View style={styles.selectedInfo}>
              <Text style={styles.selectedTitle}>Gói quà đã chọn:</Text>
              <Text style={styles.selectedPackageName} numberOfLines={1}>
                {selectedPackage.name}
              </Text>
              <Text style={styles.selectedPackageValue}>
                Số lượng: {selectedPackage.quantity}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.distributeButton, distributing && styles.distributeButtonDisabled]}
              onPress={handleDistributePackage}
              disabled={distributing}
            >
              {distributing ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <MaterialCommunityIcons name="gift" size={20} color="#FFF" />
                  <Text style={styles.distributeButtonText}>Phân phối gói quà</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Package Detail Modal */}
      {renderPackageDetailModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  // Header styles - Following donationDetailScreen pattern
  header: {
    backgroundColor: '#FF6B6B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 12,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#718096',
    fontWeight: '500',
  },
  // Donor Info Card
  donorInfoCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 12,
    padding: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  donorInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  donorIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  donorInfoContent: {
    flex: 1,
  },
  donorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 3,
  },
  bloodTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  donorBloodType: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '600',
    marginLeft: 3,
  },
  donorStatusBadge: {
    backgroundColor: '#E8F8F5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2ED573',
  },
  donorStatusText: {
    fontSize: 10,
    color: '#2ED573',
    fontWeight: '600',
  },
  // Content Section
  content: {
    flex: 1,
    padding: 12,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    marginLeft: 6,
  },
  sectionCount: {
    backgroundColor: '#FFEAEA',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  sectionCountText: {
    fontSize: 10,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  sectionDescription: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  // Grid Layout
  gridContainer: {
    paddingHorizontal: 2,
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  gridItem: {
    width: cardWidth,
    marginBottom: 12,
  },
  gridItemRight: {
    // No additional margin needed due to justifyContent: 'space-between'
  },
  // Card Styles - More compact design
  packageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 0,
    height: 240, // Reduced from 280
    borderWidth: 2,
    borderColor: '#E2E8F0',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    overflow: 'hidden',
  },
  selectedCard: {
    borderColor: '#2ED573',
    backgroundColor: '#F0FFF4',
    borderWidth: 3,
    elevation: 6,
    shadowOpacity: 0.15,
  },
  cardImageContainer: {
    width: '100%',
    height: 120, // Reduced from 140
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  selectedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(46, 213, 115, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  // Card Info Container - More compact
  cardInfoContainer: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  cardTitleContainer: {
    height: 36, // Reduced from 44
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2D3748',
    lineHeight: 18,
  },
  cardMiddleSection: {
    marginBottom: 6,
  },
  packageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FF6B6B',
    marginLeft: 3,
  },
  cardBottomSection: {
    alignItems: 'flex-start',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2ED573',
    marginLeft: 3,
  },
  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 40,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 18,
  },
  // Bottom Section
  bottomSection: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  selectedSummary: {
    padding: 12,
  },
  selectedInfo: {
    marginBottom: 10,
  },
  selectedTitle: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 3,
  },
  selectedPackageName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 2,
  },
  selectedPackageValue: {
    fontSize: 12,
    color: '#2ED573',
    fontWeight: '600',
  },
  distributeButton: {
    backgroundColor: '#FF6B6B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    elevation: 4,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  distributeButtonDisabled: {
    backgroundColor: '#CBD5E0',
    elevation: 0,
    shadowOpacity: 0,
  },
  distributeButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 6,
  },
  // Modal Styles - More compact
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxHeight: '85%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    flex: 1,
    marginRight: 12,
    lineHeight: 22,
  },
  modalCloseIcon: {
    padding: 3,
  },
  modalImageContainer: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#F8F9FA',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  modalDescriptionContainer: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#8B5CF6',
  },
  modalDescription: {
    fontSize: 13,
    color: '#4A5568',
    lineHeight: 18,
  },
  modalItemsSection: {
    marginBottom: 16,
  },
  modalSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2D3748',
    marginLeft: 6,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalItemImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    marginRight: 10,
  },
  modalItemImage: {
    width: '100%',
    height: '100%',
  },
  modalItemInfo: {
    flex: 1,
  },
  modalItemName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 2,
  },
  modalItemDetails: {
    fontSize: 11,
    color: '#718096',
    fontWeight: '500',
  },
  modalItemCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  modalItemCategoryText: {
    fontSize: 11,
    color: '#718096',
    fontWeight: '500',
    marginLeft: 3,
  },
  modalQuantitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FFF4',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2ED573',
  },
  modalQuantityContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalQuantityLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2D3748',
    marginLeft: 6,
  },
  modalQuantityValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2ED573',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  modalCancelButton: {
    flex: 1,
    padding: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
  },
  modalCancelButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#718096',
  },
  modalSelectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalSelectButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 5,
  },
}); 