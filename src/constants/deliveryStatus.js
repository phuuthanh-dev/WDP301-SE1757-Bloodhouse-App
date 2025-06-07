export const BLOOD_DELIVERY_STATUS = {
  PENDING: "pending",
  IN_TRANSIT: "in_transit",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

export const BLOOD_DELIVERY_STATUS_NAME = [
  BLOOD_DELIVERY_STATUS.PENDING,
  BLOOD_DELIVERY_STATUS.IN_TRANSIT,
  BLOOD_DELIVERY_STATUS.DELIVERED,
];

export const DONATION_STATUS_NAME_LABELS = [
  {
    label: "Tất cả",
    value: "all",
  },
  {
    label: "Chờ giao",
    value: BLOOD_DELIVERY_STATUS.PENDING,
  },
  {
    label: "Đang vận chuyển",
    value: BLOOD_DELIVERY_STATUS.IN_TRANSIT,
  },
  {
    label: "Đã giao",
    value: BLOOD_DELIVERY_STATUS.DELIVERED,
  },
  {
    label: "Đã hủy",
    value: BLOOD_DELIVERY_STATUS.CANCELLED,
  },
];

export const getStatusNameDelivery = (status) => {
  switch (status) {
    case BLOOD_DELIVERY_STATUS.PENDING:
      return "Chờ giao";
    case BLOOD_DELIVERY_STATUS.IN_TRANSIT:
      return "Đang vận chuyển";
    case BLOOD_DELIVERY_STATUS.DELIVERED:
      return "Đã giao";
    case BLOOD_DELIVERY_STATUS.CANCELLED:
      return "Đã hủy";
    default:
      return "Tất cả";
  }
};

export const getStatusColorDelivery = (status) => {
  switch (status) {
    case BLOOD_DELIVERY_STATUS.PENDING:
      return "#FBBF24";
    case BLOOD_DELIVERY_STATUS.IN_TRANSIT:
      return "#0EA5E9";
    case BLOOD_DELIVERY_STATUS.DELIVERED:
      return "#2ED573";
    case BLOOD_DELIVERY_STATUS.CANCELLED:
      return "#FF4757";
    default:
      return "#FFC107";
  }
};
