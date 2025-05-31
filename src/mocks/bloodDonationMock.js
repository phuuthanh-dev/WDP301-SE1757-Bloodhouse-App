// Mock data for blood donations
const today = new Date();
const todayISO = today.toISOString();
const todayMorning = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0).toISOString();
const todayAfternoon = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0).toISOString();
const todayEvening = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 16, 30).toISOString();

const mockBloodDonations = [
  {
    _id: "675b1234567890abcdef0001",
    userId: {
      _id: "675a1234567890abcdef0001",
      fullName: "Nguyễn Văn An",
      email: "nguyenvanan@email.com",
      phone: "0901234567",
      avatar: "https://i.pravatar.cc/150?img=1"
    },
    bloodGroupId: {
      _id: "675c1234567890abcdef0001",
      name: "A+",
      type: "A+"
    },
    bloodComponent: "Hồng cầu",
    quantity: 450,
    donationDate: todayMorning, // Today morning
    status: "completed",
    isDivided: false,
    bloodDonationRegistrationId: {
      _id: "675d1234567890abcdef0001",
      facilityId: {
        _id: "675e1234567890abcdef0001",
        name: "Bệnh viện Bạch Mai",
        street: "78 Giải Phóng",
        city: "Hà Nội"
      },
      preferredDate: todayMorning,
      code: "REG001"
    },
    code: "DON001",
    notes: "Hiến máu Hồng cầu thành công",
    createdAt: todayMorning,
    updatedAt: todayMorning
  },
  {
    _id: "675b1234567890abcdef0002",
    userId: {
      _id: "675a1234567890abcdef0002",
      fullName: "Trần Thị Bình",
      email: "tranthibinh@email.com",
      phone: "0901234568",
      avatar: "https://i.pravatar.cc/150?img=2"
    },
    bloodGroupId: {
      _id: "675c1234567890abcdef0002",
      name: "O+",
      type: "O+"
    },
    bloodComponent: "Máu toàn phần",
    quantity: 450,
    donationDate: todayAfternoon, // Today afternoon
    status: "completed",
    isDivided: true,
    bloodDonationRegistrationId: {
      _id: "675d1234567890abcdef0002",
      facilityId: {
        _id: "675e1234567890abcdef0001",
        name: "Bệnh viện Bạch Mai",
        street: "78 Giải Phóng",
        city: "Hà Nội"
      },
      preferredDate: todayAfternoon,
      code: "REG002"
    },
    code: "DON002",
    notes: "Đã phân chia máu toàn phần thành công",
    createdAt: todayAfternoon,
    updatedAt: todayAfternoon
  },
  {
    _id: "675b1234567890abcdef0003",
    userId: {
      _id: "675a1234567890abcdef0003",
      fullName: "Lê Minh Cường",
      email: "leminhcuong@email.com",
      phone: "0901234569",
      avatar: "https://i.pravatar.cc/150?img=3"
    },
    bloodGroupId: {
      _id: "675c1234567890abcdef0003",
      name: "B+",
      type: "B+"
    },
    bloodComponent: "Huyết tương",
    quantity: 400,
    donationDate: todayEvening, // Today evening
    status: "completed",
    isDivided: false,
    bloodDonationRegistrationId: {
      _id: "675d1234567890abcdef0003",
      facilityId: {
        _id: "675e1234567890abcdef0001",
        name: "Bệnh viện Bạch Mai",
        street: "78 Giải Phóng",
        city: "Hà Nội"
      },
      preferredDate: todayEvening,
      code: "REG003"
    },
    code: "DON003",
    notes: "Hiến Huyết tương chuyên biệt",
    createdAt: todayEvening,
    updatedAt: todayEvening
  },
  {
    _id: "675b1234567890abcdef0004",
    userId: {
      _id: "675a1234567890abcdef0004",
      fullName: "Phạm Thu Hương",
      email: "phamthuhuong@email.com",
      phone: "0901234570",
      avatar: "https://i.pravatar.cc/150?img=4"
    },
    bloodGroupId: {
      _id: "675c1234567890abcdef0004",
      name: "AB+",
      type: "AB+"
    },
    bloodComponent: "Tiểu cầu",
    quantity: 300,
    donationDate: "2024-01-16T09:00:00.000Z",
    status: "completed",
    isDivided: false,
    bloodDonationRegistrationId: {
      _id: "675d1234567890abcdef0004",
      facilityId: {
        _id: "675e1234567890abcdef0001",
        name: "Bệnh viện Bạch Mai",
        street: "78 Giải Phóng",
        city: "Hà Nội"
      },
      preferredDate: "2024-01-16T00:00:00.000Z",
      code: "REG004"
    },
    code: "DON004",
    notes: "Hiến Tiểu cầu cho bệnh nhân ung thư",
    createdAt: "2024-01-16T08:30:00.000Z",
    updatedAt: "2024-01-16T09:30:00.000Z"
  },
  {
    _id: "675b1234567890abcdef0005",
    userId: {
      _id: "675a1234567890abcdef0005",
      fullName: "Hoàng Văn Đức",
      email: "hoangvanduc@email.com",
      phone: "0901234571",
      avatar: "https://i.pravatar.cc/150?img=5"
    },
    bloodGroupId: {
      _id: "675c1234567890abcdef0005",
      name: "O-",
      type: "O-"
    },
    bloodComponent: "Máu toàn phần",
    quantity: 450,
    donationDate: "2024-01-16T11:30:00.000Z",
    status: "completed",
    isDivided: true,
    bloodDonationRegistrationId: {
      _id: "675d1234567890abcdef0005",
      facilityId: {
        _id: "675e1234567890abcdef0001",
        name: "Bệnh viện Bạch Mai",
        street: "78 Giải Phóng",
        city: "Hà Nội"
      },
      preferredDate: "2024-01-16T00:00:00.000Z",
      code: "REG005"
    },
    code: "DON005",
    notes: "Máu toàn phần đã phân chia hoàn thành",
    createdAt: "2024-01-16T11:00:00.000Z",
    updatedAt: "2024-01-16T13:00:00.000Z"
  }
];

// Mock data for blood units
const mockBloodUnits = {
  "675b1234567890abcdef0001": [], // Hồng cầu - chưa có units
  "675b1234567890abcdef0002": [   // Máu toàn phần đã phân chia
    {
      _id: "675f1234567890abcdef0001",
      donationId: "675b1234567890abcdef0002",
      facilityId: {
        _id: "675e1234567890abcdef0001",
        name: "Bệnh viện Bạch Mai",
        code: "BM001"
      },
      bloodGroupId: {
        _id: "675c1234567890abcdef0002",
        name: "O+",
        type: "O+"
      },
      component: "Huyết tương", // Từ máu toàn phần có thể tạo Huyết tương
      quantity: 200,
      collectedAt: "2024-01-15T14:30:00.000Z",
      expiresAt: "2024-02-15T14:30:00.000Z",
      status: "available",
      code: "UNIT001",
      testResults: {
        notes: "Kết quả xét nghiệm tốt"
      },
      processedAt: "2024-01-15T15:00:00.000Z",
      createdAt: "2024-01-15T15:00:00.000Z"
    },
    {
      _id: "675f1234567890abcdef0002",
      donationId: "675b1234567890abcdef0002",
      facilityId: {
        _id: "675e1234567890abcdef0001",
        name: "Bệnh viện Bạch Mai",
        code: "BM001"
      },
      bloodGroupId: {
        _id: "675c1234567890abcdef0002",
        name: "O+",
        type: "O+"
      },
      component: "Hồng cầu", // Từ máu toàn phần có thể tạo Hồng cầu
      quantity: 250,
      collectedAt: "2024-01-15T14:30:00.000Z",
      expiresAt: "2024-02-15T14:30:00.000Z",
      status: "testing",
      code: "UNIT002",
      testResults: {
        notes: "Đang xét nghiệm"
      },
      processedAt: "2024-01-15T15:10:00.000Z",
      createdAt: "2024-01-15T15:10:00.000Z"
    }
  ],
  "675b1234567890abcdef0003": [], // Huyết tương - chưa có units
  "675b1234567890abcdef0004": [], // Tiểu cầu - chưa có units
  "675b1234567890abcdef0005": [   // Máu toàn phần đã phân chia
    {
      _id: "675f1234567890abcdef0003",
      donationId: "675b1234567890abcdef0005",
      facilityId: {
        _id: "675e1234567890abcdef0001",
        name: "Bệnh viện Bạch Mai",
        code: "BM001"
      },
      bloodGroupId: {
        _id: "675c1234567890abcdef0005",
        name: "O-",
        type: "O-"
      },
      component: "Hồng cầu", // Từ máu toàn phần tạo Hồng cầu
      quantity: 250,
      collectedAt: "2024-01-16T11:30:00.000Z",
      expiresAt: "2024-02-16T11:30:00.000Z",
      status: "available",
      code: "UNIT003",
      testResults: {
        notes: "Chất lượng cao"
      },
      processedAt: "2024-01-16T12:00:00.000Z",
      createdAt: "2024-01-16T12:00:00.000Z"
    },
    {
      _id: "675f1234567890abcdef0004",
      donationId: "675b1234567890abcdef0005",
      facilityId: {
        _id: "675e1234567890abcdef0001",
        name: "Bệnh viện Bạch Mai",
        code: "BM001"
      },
      bloodGroupId: {
        _id: "675c1234567890abcdef0005",
        name: "O-",
        type: "O-"
      },
      component: "Tiểu cầu", // Từ máu toàn phần tạo Tiểu cầu
      quantity: 200,
      collectedAt: "2024-01-16T11:30:00.000Z",
      expiresAt: "2024-02-16T11:30:00.000Z",
      status: "available",
      code: "UNIT004",
      testResults: {
        notes: "Đạt tiêu chuẩn"
      },
      processedAt: "2024-01-16T12:10:00.000Z",
      createdAt: "2024-01-16T12:10:00.000Z"
    }
  ]
};

// Mock API functions
class MockBloodDonationAPI {
  HandleBloodDonation = async (url = '', data, method = 'get') => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      if (method === 'get') {
        // Handle /doctor endpoint - get blood donations for doctor
        if (url.includes('/doctor')) {
          const urlParams = new URLSearchParams(url.split('?')[1] || '');
          const status = urlParams.get('status');
          const isDivided = urlParams.get('isDivided');
          const page = parseInt(urlParams.get('page')) || 1;
          const limit = parseInt(urlParams.get('limit')) || 10;

          let filteredDonations = [...mockBloodDonations];

          // Filter by status
          if (status) {
            filteredDonations = filteredDonations.filter(d => d.status === status);
          }

          // Filter by isDivided
          if (isDivided !== null && isDivided !== undefined && isDivided !== 'all') {
            const isDividedBool = isDivided === 'true';
            filteredDonations = filteredDonations.filter(d => d.isDivided === isDividedBool);
          }

          // Pagination
          const startIndex = (page - 1) * limit;
          const endIndex = startIndex + limit;
          const paginatedData = filteredDonations.slice(startIndex, endIndex);

          return {
            data: {
              data: paginatedData,
              pagination: {
                currentPage: page,
                totalPages: Math.ceil(filteredDonations.length / limit),
                totalItems: filteredDonations.length,
                limit: limit
              }
            }
          };
        }

        // Handle get donation detail by ID
        if (url.startsWith('/675b')) {
          const donationId = url.substring(1);
          const donation = mockBloodDonations.find(d => d._id === donationId);
          
          if (!donation) {
            throw new Error('Donation not found');
          }

          return {
            data: donation
          };
        }
      }

      if (method === 'patch') {
        // Handle mark as divided
        if (url.includes('/mark-divided')) {
          const donationId = url.split('/')[2];
          const donationIndex = mockBloodDonations.findIndex(d => d._id === donationId);
          
          if (donationIndex === -1) {
            throw new Error('Donation not found');
          }

          // Update mock data
          mockBloodDonations[donationIndex].isDivided = true;
          mockBloodDonations[donationIndex].updatedAt = new Date().toISOString();

          return {
            data: mockBloodDonations[donationIndex]
          };
        }
      }

      throw new Error('API endpoint not found');
    } catch (error) {
      throw {
        response: {
          data: {
            message: error.message || 'Mock API Error'
          }
        }
      };
    }
  };
}

class MockBloodUnitAPI {
  HandleBloodUnit = async (url = '', data, method = 'get') => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      if (method === 'get') {
        // Handle get blood units by donation ID
        if (url.startsWith('/donation/')) {
          const donationId = url.substring('/donation/'.length);
          const units = mockBloodUnits[donationId] || [];

          return {
            data: {
              data: units,
              pagination: {
                currentPage: 1,
                totalPages: 1,
                totalItems: units.length,
                limit: 10
              }
            }
          };
        }
      }

      if (method === 'post') {
        // Handle create blood unit
        const { donationId, units } = data;
        
        if (!donationId || !units || !Array.isArray(units)) {
          throw new Error('Invalid data format');
        }

        const newUnits = units.map((unit, index) => ({
          _id: `675f${Date.now()}${index}`,
          donationId: donationId,
          facilityId: {
            _id: "675e1234567890abcdef0001",
            name: "Bệnh viện Bạch Mai",
            code: "BM001"
          },
          bloodGroupId: {
            _id: "675c1234567890abcdef0001",
            name: "A+",
            type: "A+"
          },
          component: unit.component,
          quantity: unit.quantity,
          collectedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          status: "testing",
          code: `UNIT${Date.now()}${index}`,
          testResults: {
            notes: "Đang xử lý"
          },
          processedAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        }));

        // Add to mock data
        if (!mockBloodUnits[donationId]) {
          mockBloodUnits[donationId] = [];
        }
        mockBloodUnits[donationId].push(...newUnits);

        return {
          data: newUnits
        };
      }

      throw new Error('Blood Unit API endpoint not found');
    } catch (error) {
      throw {
        response: {
          data: {
            message: error.message || 'Mock Blood Unit API Error'
          }
        }
      };
    }
  };
}

// Export mock APIs
export const mockBloodDonationAPI = new MockBloodDonationAPI();
export const mockBloodUnitAPI = new MockBloodUnitAPI();

// Export mock data for direct access if needed
export { mockBloodDonations, mockBloodUnits }; 