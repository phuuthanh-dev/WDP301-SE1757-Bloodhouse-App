// Mock data for doctor screens
import { addDays, subDays, addHours } from 'date-fns';

// Mock Health Checks Data
export const mockHealthChecks = [
  {
    _id: 'hc001',
    checkDate: new Date(),
    userId: {
      _id: 'user001',
      fullName: 'Nguyễn Văn An',
      avatar: 'https://i.pravatar.cc/150?img=1',
      phone: '0123456789',
      sex: 'male',
      yob: new Date('1990-05-15'),
      bloodId: { name: 'A+', type: 'A+' }
    },
    staffId: {
      userId: {
        fullName: 'Y tá Trần Thị Bình'
      }
    },
    registrationId: 'reg001',
    bloodPressure: '120/80',
    hemoglobin: 13.5,
    weight: 65,
    pulse: 72,
    temperature: 36.5,
    generalCondition: 'Tốt',
    isEligible: null, // Chờ khám
    deferralReason: null,
    notes: null
  },
  {
    _id: 'hc002',
    checkDate: new Date(),
    userId: {
      _id: 'user002',
      fullName: 'Trần Thị Mai',
      avatar: 'https://i.pravatar.cc/150?img=2',
      phone: '0987654321',
      sex: 'female',
      yob: new Date('1985-08-20'),
      bloodId: { name: 'B+', type: 'B+' }
    },
    staffId: {
      userId: {
        fullName: 'Y tá Lê Văn Cường'
      }
    },
    registrationId: 'reg002',
    bloodPressure: '118/78',
    hemoglobin: 12.8,
    weight: 55,
    pulse: 68,
    temperature: 36.4,
    generalCondition: 'Tốt',
    isEligible: true,
    deferralReason: null,
    notes: 'Người hiến có sức khỏe tốt, đủ điều kiện hiến máu'
  },
  {
    _id: 'hc003',
    checkDate: new Date(),
    userId: {
      _id: 'user003',
      fullName: 'Lê Văn Đức',
      avatar: 'https://i.pravatar.cc/150?img=3',
      phone: '0369852147',
      sex: 'male',
      yob: new Date('1992-12-10'),
      bloodId: { name: 'O+', type: 'O+' }
    },
    staffId: {
      userId: {
        fullName: 'Y tá Phạm Thị Dung'
      }
    },
    registrationId: 'reg003',
    bloodPressure: '140/90',
    hemoglobin: 11.5,
    weight: 70,
    pulse: 85,
    temperature: 37.2,
    generalCondition: 'Huyết áp cao, sốt nhẹ',
    isEligible: false,
    deferralReason: 'Huyết áp cao và có dấu hiệu sốt nhẹ',
    notes: 'Khuyên người hiến nghỉ ngơi và tái khám sau 1 tuần'
  },
  {
    _id: 'hc004',
    checkDate: addHours(new Date(), -2),
    userId: {
      _id: 'user004',
      fullName: 'Phạm Thị Lan',
      avatar: 'https://i.pravatar.cc/150?img=4',
      phone: '0741852963',
      sex: 'female',
      yob: new Date('1988-03-25'),
      bloodId: { name: 'AB+', type: 'AB+' }
    },
    staffId: {
      userId: {
        fullName: 'Y tá Hoàng Văn Nam'
      }
    },
    registrationId: 'reg004',
    bloodPressure: '115/75',
    hemoglobin: 13.2,
    weight: 58,
    pulse: 70,
    temperature: 36.3,
    generalCondition: 'Rất tốt',
    isEligible: true,
    deferralReason: null,
    notes: 'Người hiến có tiền sử hiến máu tốt'
  },
  {
    _id: 'hc005',
    checkDate: subDays(new Date(), 1),
    userId: {
      _id: 'user005',
      fullName: 'Võ Minh Tuấn',
      avatar: 'https://i.pravatar.cc/150?img=5',
      phone: '0852963741',
      sex: 'male',
      yob: new Date('1995-07-18'),
      bloodId: { name: 'A-', type: 'A-' }
    },
    staffId: {
      userId: {
        fullName: 'Y tá Nguyễn Thị Hoa'
      }
    },
    registrationId: 'reg005',
    bloodPressure: '125/82',
    hemoglobin: 14.1,
    weight: 72,
    pulse: 75,
    temperature: 36.6,
    generalCondition: 'Tốt',
    isEligible: true,
    deferralReason: null,
    notes: 'Người hiến khỏe mạnh, các chỉ số đều bình thường'
  }
];

// Mock Blood Donations Data
export const mockBloodDonations = [
  {
    _id: 'bd001',
    code: 'BDON001234',
    donationDate: new Date(),
    userId: {
      _id: 'user001',
      fullName: 'Nguyễn Văn An',
      avatar: 'https://i.pravatar.cc/150?img=1',
      phone: '0123456789',
      sex: 'male',
      yob: new Date('1990-05-15')
    },
    bloodGroupId: { name: 'A+', type: 'A+' },
    quantity: 450,
    bloodComponent: 'Máu toàn phần',
    status: 'confirmed',
    notes: 'Hiến máu định kỳ, người hiến có sức khỏe tốt',
    bloodUnits: [
      {
        _id: 'bu001',
        barcode: 'BU001234567',
        bloodComponent: 'Máu toàn phần',
        volume: 450,
        expiryDate: addDays(new Date(), 35),
        status: 'approved',
        testResults: 'Âm tính với HIV, HBV, HCV',
        storageLocation: 'Tủ lạnh A1-B2',
        notes: 'Đơn vị máu chất lượng tốt',
        createdAt: new Date()
      }
    ]
  },
  {
    _id: 'bd002',
    code: 'BDON001235',
    donationDate: addHours(new Date(), -3),
    userId: {
      _id: 'user002',
      fullName: 'Trần Thị Mai',
      avatar: 'https://i.pravatar.cc/150?img=2',
      phone: '0987654321',
      sex: 'female',
      yob: new Date('1985-08-20')
    },
    bloodGroupId: { name: 'B+', type: 'B+' },
    quantity: 450,
    bloodComponent: 'Máu toàn phần',
    status: 'confirmed',
    notes: 'Người hiến tình nguyện lần đầu',
    bloodUnits: [
      {
        _id: 'bu002',
        barcode: 'BU001234568',
        bloodComponent: 'Hồng cầu',
        volume: 200,
        expiryDate: addDays(new Date(), 42),
        status: 'pending',
        testResults: null,
        storageLocation: 'Tủ lạnh A2-B1',
        notes: 'Đang chờ kết quả xét nghiệm',
        createdAt: new Date()
      },
      {
        _id: 'bu003',
        barcode: 'BU001234569',
        bloodComponent: 'Plasma',
        volume: 250,
        expiryDate: addDays(new Date(), 365),
        status: 'approved',
        testResults: 'Âm tính với các bệnh truyền nhiễm',
        storageLocation: 'Tủ đông C1-D2',
        notes: 'Plasma chất lượng cao',
        createdAt: new Date()
      }
    ]
  },
  {
    _id: 'bd003',
    code: 'BDON001236',
    donationDate: subDays(new Date(), 1),
    userId: {
      _id: 'user003',
      fullName: 'Lê Văn Đức',
      avatar: 'https://i.pravatar.cc/150?img=3',
      phone: '0369852147',
      sex: 'male',
      yob: new Date('1992-12-10')
    },
    bloodGroupId: { name: 'O+', type: 'O+' },
    quantity: 450,
    bloodComponent: 'Máu toàn phần',
    status: 'confirmed',
    notes: 'Người hiến máu thường xuyên, lần thứ 5',
    bloodUnits: [
      {
        _id: 'bu004',
        barcode: 'BU001234570',
        bloodComponent: 'Máu toàn phần',
        volume: 450,
        expiryDate: addDays(new Date(), 34),
        status: 'approved',
        testResults: 'Tất cả xét nghiệm đều âm tính',
        storageLocation: 'Tủ lạnh B1-C2',
        notes: 'Đơn vị máu O+ quý hiếm',
        createdAt: subDays(new Date(), 1)
      }
    ]
  },
  {
    _id: 'bd004',
    code: 'BDON001237',
    donationDate: new Date(),
    userId: {
      _id: 'user004',
      fullName: 'Phạm Thị Lan',
      avatar: 'https://i.pravatar.cc/150?img=4',
      phone: '0741852963',
      sex: 'female',
      yob: new Date('1988-03-25')
    },
    bloodGroupId: { name: 'AB+', type: 'AB+' },
    quantity: 450,
    bloodComponent: 'Máu toàn phần',
    status: 'confirmed',
    notes: 'Hiến máu nhân dịp sinh nhật',
    bloodUnits: []
  }
];

// Mock Blood Units Data
export const mockBloodUnits = [
  {
    _id: 'bu001',
    barcode: 'BU001234567',
    bloodDonationId: 'bd001',
    bloodComponent: 'Máu toàn phần',
    volume: 450,
    expiryDate: addDays(new Date(), 35),
    status: 'approved',
    testResults: 'Âm tính với HIV, HBV, HCV, Syphilis',
    storageLocation: 'Tủ lạnh A1-B2',
    notes: 'Đơn vị máu chất lượng tốt, đã qua kiểm tra nghiêm ngặt',
    createdAt: new Date()
  },
  {
    _id: 'bu002',
    barcode: 'BU001234568',
    bloodDonationId: 'bd002',
    bloodComponent: 'Hồng cầu',
    volume: 200,
    expiryDate: addDays(new Date(), 42),
    status: 'pending',
    testResults: null,
    storageLocation: 'Tủ lạnh A2-B1',
    notes: 'Đang chờ kết quả xét nghiệm cuối cùng',
    createdAt: new Date()
  },
  {
    _id: 'bu003',
    barcode: 'BU001234569',
    bloodDonationId: 'bd002',
    bloodComponent: 'Plasma',
    volume: 250,
    expiryDate: addDays(new Date(), 365),
    status: 'approved',
    testResults: 'Âm tính với các bệnh truyền nhiễm, protein bình thường',
    storageLocation: 'Tủ đông C1-D2',
    notes: 'Plasma chất lượng cao, phù hợp cho điều trị',
    createdAt: new Date()
  },
  {
    _id: 'bu004',
    barcode: 'BU001234570',
    bloodDonationId: 'bd003',
    bloodComponent: 'Máu toàn phần',
    volume: 450,
    expiryDate: addDays(new Date(), 34),
    status: 'approved',
    testResults: 'Tất cả xét nghiệm đều âm tính, chất lượng tốt',
    storageLocation: 'Tủ lạnh B1-C2',
    notes: 'Đơn vị máu O+ quý hiếm, ưu tiên sử dụng khẩn cấp',
    createdAt: subDays(new Date(), 1)
  },
  {
    _id: 'bu005',
    barcode: 'BU001234571',
    bloodDonationId: 'bd001',
    bloodComponent: 'Tiểu cầu',
    volume: 50,
    expiryDate: addDays(new Date(), 5),
    status: 'expired',
    testResults: 'Âm tính với các bệnh truyền nhiễm',
    storageLocation: 'Tủ lạnh D1-E2',
    notes: 'Đã hết hạn sử dụng, cần xử lý',
    createdAt: subDays(new Date(), 10)
  }
];

// Mock Donors Data
export const mockDonors = [
  {
    _id: 'user001',
    fullName: 'Nguyễn Văn An',
    email: 'nguyenvanan@email.com',
    phone: '0123456789',
    sex: 'male',
    yob: new Date('1990-05-15'),
    address: '123 Đường Lê Lợi, Quận 1, TP.HCM',
    avatar: 'https://i.pravatar.cc/150?img=1',
    bloodId: { name: 'A+', type: 'A+' },
    totalDonations: 8,
    lastDonation: new Date('2024-01-15'),
    status: 'active',
  },
  {
    _id: 'user002',
    fullName: 'Trần Thị Mai',
    email: 'tranthimai@email.com',
    phone: '0987654321',
    sex: 'female',
    yob: new Date('1985-08-20'),
    address: '456 Đường Nguyễn Huệ, Quận 1, TP.HCM',
    avatar: 'https://i.pravatar.cc/150?img=2',
    bloodId: { name: 'B+', type: 'B+' },
    totalDonations: 5,
    lastDonation: new Date('2024-02-10'),
    status: 'active',
  },
  {
    _id: 'user003',
    fullName: 'Lê Văn Đức',
    email: 'levanduc@email.com',
    phone: '0369852147',
    sex: 'male',
    yob: new Date('1992-12-10'),
    address: '789 Đường Pasteur, Quận 3, TP.HCM',
    avatar: 'https://i.pravatar.cc/150?img=3',
    bloodId: { name: 'O+', type: 'O+' },
    totalDonations: 12,
    lastDonation: new Date('2024-01-28'),
    status: 'active',
  },
  {
    _id: 'user004',
    fullName: 'Phạm Thị Lan',
    email: 'phamthilan@email.com',
    phone: '0741852963',
    sex: 'female',
    yob: new Date('1988-03-25'),
    address: '321 Đường Võ Văn Tần, Quận 3, TP.HCM',
    avatar: 'https://i.pravatar.cc/150?img=4',
    bloodId: { name: 'AB+', type: 'AB+' },
    totalDonations: 3,
    lastDonation: new Date('2023-12-15'),
    status: 'active',
  },
  {
    _id: 'user005',
    fullName: 'Võ Minh Tuấn',
    email: 'vominhtuan@email.com',
    phone: '0852963741',
    sex: 'male',
    yob: new Date('1995-07-18'),
    address: '654 Đường Cách Mạng Tháng 8, Quận 10, TP.HCM',
    avatar: 'https://i.pravatar.cc/150?img=5',
    bloodId: { name: 'A-', type: 'A-' },
    totalDonations: 6,
    lastDonation: new Date('2024-01-05'),
    status: 'active',
  },
  {
    _id: 'user006',
    fullName: 'Hoàng Thị Hương',
    email: 'hoangthihuong@email.com',
    phone: '0963741852',
    sex: 'female',
    yob: new Date('1993-11-08'),
    address: '987 Đường Điện Biên Phủ, Quận Bình Thạnh, TP.HCM',
    avatar: 'https://i.pravatar.cc/150?img=6',
    bloodId: { name: 'B-', type: 'B-' },
    totalDonations: 4,
    lastDonation: new Date('2023-11-20'),
    status: 'inactive',
  },
  {
    _id: 'user007',
    fullName: 'Đặng Văn Hùng',
    email: 'dangvanhung@email.com',
    phone: '0147258369',
    sex: 'male',
    yob: new Date('1987-04-12'),
    address: '159 Đường Trần Hưng Đạo, Quận 5, TP.HCM',
    avatar: 'https://i.pravatar.cc/150?img=7',
    bloodId: { name: 'O-', type: 'O-' },
    totalDonations: 15,
    lastDonation: new Date('2024-02-01'),
    status: 'active',
  },
  {
    _id: 'user008',
    fullName: 'Bùi Thị Ngọc',
    email: 'buithingoc@email.com',
    phone: '0258147369',
    sex: 'female',
    yob: new Date('1991-09-30'),
    address: '753 Đường Lý Thường Kiệt, Quận 11, TP.HCM',
    avatar: 'https://i.pravatar.cc/150?img=8',
    bloodId: { name: 'AB-', type: 'AB-' },
    totalDonations: 2,
    lastDonation: new Date('2023-10-15'),
    status: 'banned',
  }
];

// Mock Donation History for Donors
export const mockDonationHistory = [
  {
    _id: 'dh001',
    donorId: 'user001',
    donationDate: new Date('2024-01-15'),
    quantity: 450,
    status: 'completed',
    facilityId: { name: 'Bệnh viện Chợ Rẫy' },
    bloodComponent: 'Máu toàn phần',
  },
  {
    _id: 'dh002',
    donorId: 'user001',
    donationDate: new Date('2023-10-20'),
    quantity: 450,
    status: 'completed',
    facilityId: { name: 'Viện Huyết học' },
    bloodComponent: 'Máu toàn phần',
  },
  {
    _id: 'dh003',
    donorId: 'user002',
    donationDate: new Date('2024-02-10'),
    quantity: 450,
    status: 'completed',
    facilityId: { name: 'Bệnh viện Đại học Y Dược' },
    bloodComponent: 'Máu toàn phần',
  },
  {
    _id: 'dh004',
    donorId: 'user003',
    donationDate: new Date('2024-01-28'),
    quantity: 450,
    status: 'completed',
    facilityId: { name: 'Trung tâm Truyền máu Quốc gia' },
    bloodComponent: 'Máu toàn phần',
  }
];

// Mock Health Records for Donors
export const mockHealthRecords = [
  {
    _id: 'hr001',
    donorId: 'user001',
    checkDate: new Date('2024-01-15'),
    bloodPressure: '120/80',
    hemoglobin: 13.5,
    weight: 65,
    pulse: 72,
    temperature: 36.5,
    isEligible: true,
    generalCondition: 'Tốt',
  },
  {
    _id: 'hr002',
    donorId: 'user001',
    checkDate: new Date('2023-10-20'),
    bloodPressure: '118/78',
    hemoglobin: 13.2,
    weight: 64,
    pulse: 70,
    temperature: 36.4,
    isEligible: true,
    generalCondition: 'Tốt',
  },
  {
    _id: 'hr003',
    donorId: 'user002',
    checkDate: new Date('2024-02-10'),
    bloodPressure: '115/75',
    hemoglobin: 12.8,
    weight: 55,
    pulse: 68,
    temperature: 36.3,
    isEligible: true,
    generalCondition: 'Rất tốt',
  }
];

// Mock API functions
export const mockHealthCheckAPI = {
  HandleHealthCheck: async (endpoint, data, method) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (method === 'get') {
      if (endpoint.includes('/doctor')) {
        return {
          data: {
            data: mockHealthChecks,
            total: mockHealthChecks.length
          }
        };
      } else if (endpoint.includes('/registration/')) {
        const registrationId = endpoint.split('/').pop();
        const healthCheck = mockHealthChecks.find(hc => hc.registrationId === registrationId);
        return {
          data: {
            registration: {
              _id: registrationId,
              userId: healthCheck?.userId,
              bloodGroupId: healthCheck?.userId?.bloodId
            },
            healthCheck: healthCheck
          }
        };
      } else if (endpoint.startsWith('/')) {
        const healthCheckId = endpoint.substring(1);
        const healthCheck = mockHealthChecks.find(hc => hc._id === healthCheckId);
        return { data: healthCheck };
      }
    } else if (method === 'patch') {
      const healthCheckId = endpoint.substring(1);
      const healthCheckIndex = mockHealthChecks.findIndex(hc => hc._id === healthCheckId);
      if (healthCheckIndex !== -1) {
        mockHealthChecks[healthCheckIndex] = { ...mockHealthChecks[healthCheckIndex], ...data };
        return { data: mockHealthChecks[healthCheckIndex] };
      }
    }
    
    return { data: null };
  }
};

export const mockBloodDonationAPI = {
  HandleBloodDonation: async (endpoint, data, method) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (method === 'get') {
      if (endpoint.startsWith('?') || endpoint === '') {
        return {
          data: {
            data: mockBloodDonations,
            total: mockBloodDonations.length
          }
        };
      } else if (endpoint.startsWith('/blood-units/')) {
        const bloodUnitId = endpoint.split('/').pop();
        const bloodUnit = mockBloodUnits.find(bu => bu._id === bloodUnitId);
        return { data: bloodUnit };
      } else if (endpoint.startsWith('/')) {
        const donationId = endpoint.substring(1);
        const donation = mockBloodDonations.find(bd => bd._id === donationId);
        return { data: donation };
      }
    } else if (method === 'post' && endpoint === '/blood-units') {
      const newBloodUnit = {
        _id: `bu${Date.now()}`,
        barcode: `BU${Date.now()}`,
        ...data,
        createdAt: new Date()
      };
      mockBloodUnits.push(newBloodUnit);
      
      // Add to donation's bloodUnits array
      const donation = mockBloodDonations.find(bd => bd._id === data.bloodDonationId);
      if (donation) {
        donation.bloodUnits.push(newBloodUnit);
      }
      
      return { data: newBloodUnit };
    } else if (method === 'patch' && endpoint.startsWith('/blood-units/')) {
      const bloodUnitId = endpoint.split('/').pop();
      const bloodUnitIndex = mockBloodUnits.findIndex(bu => bu._id === bloodUnitId);
      if (bloodUnitIndex !== -1) {
        mockBloodUnits[bloodUnitIndex] = { ...mockBloodUnits[bloodUnitIndex], ...data };
        return { data: mockBloodUnits[bloodUnitIndex] };
      }
    }
    
    return { data: null };
  }
};

// Mock Donor API
export const mockDonorAPI = {
  HandleDonor: async (endpoint, data, method) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (method === 'get') {
      if (endpoint === '/donors' || endpoint.startsWith('/donors?')) {
        return {
          data: {
            data: mockDonors,
            total: mockDonors.length
          }
        };
      } else if (endpoint.startsWith('/donors/')) {
        const donorId = endpoint.split('/').pop();
        const donor = mockDonors.find(d => d._id === donorId);
        
        // Get donation history for this donor
        const donationHistory = mockDonationHistory.filter(dh => dh.donorId === donorId);
        
        // Get health records for this donor
        const healthRecords = mockHealthRecords.filter(hr => hr.donorId === donorId);
        
        return { 
          data: {
            donor,
            donationHistory,
            healthRecords
          }
        };
      }
    }
    
    return { data: null };
  }
};

// Helper function to get mock data by date
export const getMockDataByDate = (data, dateField, targetDate) => {
  return data.filter(item => {
    const itemDate = new Date(item[dateField]);
    return itemDate.getFullYear() === targetDate.getFullYear() &&
           itemDate.getMonth() === targetDate.getMonth() &&
           itemDate.getDate() === targetDate.getDate();
  });
};

// Helper function to filter by status
export const filterByStatus = (data, statusField, status) => {
  if (status === 'all') return data;
  return data.filter(item => item[statusField] === status);
};

// Helper function to search by name
export const searchByName = (data, searchText) => {
  if (!searchText.trim()) return data;
  return data.filter(item => 
    item.userId?.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
    item.fullName?.toLowerCase().includes(searchText.toLowerCase())
  );
}; 