export const RECEIVE_BLOOD_STATUS = {
  PENDING_APPROVAL: "pending_approval",
  REJECTED_REGISTRATION: "rejected_registration",
  APPROVED: "approved",
  ASSIGNED: "assigned",
  READY_FOR_HANDOVER: "ready_for_handover",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

export const RECEIVE_BLOOD_STATUS_NAME = [
  RECEIVE_BLOOD_STATUS.PENDING_APPROVAL,
  RECEIVE_BLOOD_STATUS.REJECTED_REGISTRATION,
  RECEIVE_BLOOD_STATUS.APPROVED,
  RECEIVE_BLOOD_STATUS.ASSIGNED,
  RECEIVE_BLOOD_STATUS.READY_FOR_HANDOVER,
  RECEIVE_BLOOD_STATUS.COMPLETED,
  RECEIVE_BLOOD_STATUS.CANCELLED,
];

export const RECEIVE_BLOOD_STATUS_NAME_LABELS = [
  {
    label: "Tất cả",
    value: "all",
  },
  {
    label: "Chờ phê duyệt",
    value: RECEIVE_BLOOD_STATUS.PENDING_APPROVAL,
  },
  {
    label: "Từ chối đăng ký",
    value: RECEIVE_BLOOD_STATUS.REJECTED_REGISTRATION,
  },
  {
    label: "Đã phê duyệt",
    value: RECEIVE_BLOOD_STATUS.APPROVED,
  },
  {
    label: "Đã phân phối",
    value: RECEIVE_BLOOD_STATUS.ASSIGNED,
  },
  {
    label: "Sẵn sàng chuyển giao",
    value: RECEIVE_BLOOD_STATUS.READY_FOR_HANDOVER,
  },
  {
    label: "Đã hoàn tất",
    value: RECEIVE_BLOOD_STATUS.COMPLETED,
  },
  {
    label: "Đã hủy",
    value: RECEIVE_BLOOD_STATUS.CANCELLED,
  },
];

export const getStatusReceiveBloodName = (status) => {
  switch (status) {
    case RECEIVE_BLOOD_STATUS.PENDING_APPROVAL:
      return "Chờ phê duyệt";
    case RECEIVE_BLOOD_STATUS.REJECTED_REGISTRATION:
      return "Từ chối đăng ký";
    case RECEIVE_BLOOD_STATUS.APPROVED:
      return "Đã phê duyệt";
    case RECEIVE_BLOOD_STATUS.ASSIGNED:
      return "Đã phân phối";
    case RECEIVE_BLOOD_STATUS.READY_FOR_HANDOVER:
      return "Sẵn sàng chuyển giao";
    case RECEIVE_BLOOD_STATUS.COMPLETED:
      return "Đã hoàn tất";
    case RECEIVE_BLOOD_STATUS.CANCELLED:
      return "Đã hủy";
    default:
      return "Tất cả";
  }
};

export const getStatusReceiveBloodColor = (status) => {
  switch (status) {
    case RECEIVE_BLOOD_STATUS.PENDING_APPROVAL:
      return "#95A5A6";
    case RECEIVE_BLOOD_STATUS.REJECTED_REGISTRATION:
      return "#FF4757";
    case RECEIVE_BLOOD_STATUS.APPROVED:
      return "#FFA502";
    case RECEIVE_BLOOD_STATUS.ASSIGNED:
      return "#FFA502";
    case RECEIVE_BLOOD_STATUS.READY_FOR_HANDOVER:
      return "#1E90FF";
    case RECEIVE_BLOOD_STATUS.COMPLETED:
      return "#2ED573";
    case RECEIVE_BLOOD_STATUS.CANCELLED:
      return "#FF6B6B";
    default:
      return "#FFC107";
  }
};
