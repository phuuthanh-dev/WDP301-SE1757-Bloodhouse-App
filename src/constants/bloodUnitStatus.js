// Blood Unit Status Constants từ Backend Enum
export const BLOOD_UNIT_STATUS = {
  TESTING: "testing",
  AVAILABLE: "available", 
  RESERVED: "reserved",
  USED: "used",
  EXPIRED: "expired",
  REJECTED: "rejected",
};

export const TEST_RESULT = {
  PENDING: "pending",
  NEGATIVE: "negative",
  POSITIVE: "positive", 
};

// Status options với display label và style
export const BLOOD_UNIT_STATUS_OPTIONS = [
  { 
    value: BLOOD_UNIT_STATUS.TESTING, 
    label: 'Đang xét nghiệm', 
    color: '#4A90E2', 
    icon: 'test-tube',
    description: 'Đơn vị máu đang được xét nghiệm'
  },
  { 
    value: BLOOD_UNIT_STATUS.AVAILABLE, 
    label: 'Sẵn sàng', 
    color: '#2ED573', 
    icon: 'check-circle',
    description: 'Đơn vị máu đã qua xét nghiệm và sẵn sàng sử dụng'
  },
  { 
    value: BLOOD_UNIT_STATUS.RESERVED, 
    label: 'Đã đặt trước', 
    color: '#FFA726', 
    icon: 'bookmark',
    description: 'Đơn vị máu đã được đặt trước cho bệnh nhân'
  },
  { 
    value: BLOOD_UNIT_STATUS.USED, 
    label: 'Đã sử dụng', 
    color: '#6C5CE7', 
    icon: 'check-all',
    description: 'Đơn vị máu đã được sử dụng'
  },
  { 
    value: BLOOD_UNIT_STATUS.EXPIRED, 
    label: 'Hết hạn', 
    color: '#95A5A6', 
    icon: 'calendar-remove',
    description: 'Đơn vị máu đã hết hạn sử dụng'
  },
  { 
    value: BLOOD_UNIT_STATUS.REJECTED, 
    label: 'Từ chối', 
    color: '#FF4757', 
    icon: 'close-circle',
    description: 'Đơn vị máu bị từ chối do không đạt tiêu chuẩn'
  },
];

// Test result options
export const TEST_RESULT_OPTIONS = [
  { 
    value: TEST_RESULT.PENDING, 
    label: 'Chờ kết quả', 
    color: '#4A90E2', 
    icon: 'clock-outline' 
  },
  { 
    value: TEST_RESULT.NEGATIVE, 
    label: 'Âm tính', 
    color: '#2ED573', 
    icon: 'check-circle' 
  },
  { 
    value: TEST_RESULT.POSITIVE, 
    label: 'Dương tính', 
    color: '#FF4757', 
    icon: 'alert-circle' 
  },
];

// Helper functions
export const getStatusInfo = (status) => {
  return BLOOD_UNIT_STATUS_OPTIONS.find(option => option.value === status) || BLOOD_UNIT_STATUS_OPTIONS[0];
};

export const getTestResultInfo = (result) => {
  return TEST_RESULT_OPTIONS.find(option => option.value === result) || TEST_RESULT_OPTIONS[0];
};

export const getTestResultColor = (result) => {
  const info = getTestResultInfo(result);
  return info.color;
};

export const getTestResultLabel = (result) => {
  const info = getTestResultInfo(result);
  return info.label;
}; 