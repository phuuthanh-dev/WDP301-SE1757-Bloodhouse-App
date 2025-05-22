export const DONATION_STATUS = {
  PENDING_APPROVAL: "pending_approval",
  REJECTED_REGISTRATION: "rejected_registration",
  REGISTERED: "registered",
  CHECKED_IN: "checked_in",
  IN_CONSULT: "in_consult",
  REJECTED: "rejected",
  WAITING_DONATION: "waiting_donation",
  DONATING: "donating",
  DONATED: "donated",
  RESTING: "resting",
  POST_REST_CHECK: "post_rest_check",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

export const DONATION_STATUS_NAME = [
  DONATION_STATUS.PENDING_APPROVAL,
  DONATION_STATUS.REJECTED_REGISTRATION,
  DONATION_STATUS.REGISTERED,
  DONATION_STATUS.CHECKED_IN,
  DONATION_STATUS.IN_CONSULT,
  DONATION_STATUS.REJECTED,
  DONATION_STATUS.WAITING_DONATION,
  DONATION_STATUS.DONATING,
  DONATION_STATUS.DONATED,
  DONATION_STATUS.RESTING,
  DONATION_STATUS.POST_REST_CHECK,
  DONATION_STATUS.COMPLETED,
  DONATION_STATUS.CANCELLED,
];

export const DONATION_STATUS_NAME_LABELS = [
  {
    label: "Tất cả",
    value: "all",
  },
  {
    label: "Chờ phê duyệt",
    value: DONATION_STATUS.PENDING_APPROVAL,
  },
  {
    label: "Từ chối đăng ký",
    value: DONATION_STATUS.REJECTED_REGISTRATION,
  },
  {
    label: "Đã đăng ký",
    value: DONATION_STATUS.REGISTERED,
  },
  {
    label: "Đã điểm danh",
    value: DONATION_STATUS.CHECKED_IN,
  },
  {
    label: "Đang khám",
    value: DONATION_STATUS.IN_CONSULT,
  },
  {
    label: "Không đủ điều kiện",
    value: DONATION_STATUS.REJECTED,
  },
  {
    label: "Chờ hiến máu",
    value: DONATION_STATUS.WAITING_DONATION,
  },
  {
    label: "Đang hiến máu",
    value: DONATION_STATUS.DONATING,
  },
  {
    label: "Đã hiến máu",
    value: DONATION_STATUS.DONATED,
  },
  {
    label: "Đang nghỉ",
    value: DONATION_STATUS.RESTING,
  },
  {
    label: "Đang kiểm tra sau nghỉ",
    value: DONATION_STATUS.POST_REST_CHECK,
  },
  {
    label: "Đã hoàn tất",
    value: DONATION_STATUS.COMPLETED,
  },
  {
    label: "Đã hủy",
    value: DONATION_STATUS.CANCELLED,
  },
];

export const getStatusName = (status) => {
  switch (status) {
    case DONATION_STATUS.PENDING_APPROVAL:
      return "Chờ phê duyệt";
    case DONATION_STATUS.REJECTED_REGISTRATION:
      return "Từ chối đăng ký";
    case DONATION_STATUS.REGISTERED:
      return "Đã Đăng ký";
    case DONATION_STATUS.CHECKED_IN:
      return "Đã điểm danh";
    case DONATION_STATUS.IN_CONSULT:
      return "Đang khám";
    case DONATION_STATUS.REJECTED:
      return "Không đủ điều kiện";
    case DONATION_STATUS.WAITING_DONATION:
      return "Chờ hiến máu";
    case DONATION_STATUS.DONATING:
      return "Đang hiến máu";
    case DONATION_STATUS.DONATED:
      return "Đã hiến máu";
    case DONATION_STATUS.RESTING:
      return "Đang nghỉ";
    case DONATION_STATUS.POST_REST_CHECK:
      return "Đang kiểm tra sau nghỉ";
    case DONATION_STATUS.COMPLETED:
      return "Đã hoàn tất";
    case DONATION_STATUS.CANCELLED:
      return "Đã hủy";
    default:
      return "Tất cả";
  }
};

export const getStatusColor = (status) => {
  switch (status) {
    case DONATION_STATUS.PENDING_APPROVAL:
      return "#95A5A6";
    case DONATION_STATUS.REJECTED_REGISTRATION:
      return "#FF4757";
    case DONATION_STATUS.REGISTERED:
      return "#FFA502";
    case DONATION_STATUS.CHECKED_IN:
      return "#FFA502";
    case DONATION_STATUS.IN_CONSULT:
      return "#1E90FF";
    case DONATION_STATUS.REJECTED:
      return "#FF4757";
    case DONATION_STATUS.WAITING_DONATION:
      return "#1E90FF";
    case DONATION_STATUS.DONATING:
      return "#FF6B6B";
    case DONATION_STATUS.DONATED:
      return "#20C997";
    case DONATION_STATUS.RESTING:
      return "#2ED573";
    case DONATION_STATUS.POST_REST_CHECK:
      return "#FFB300";
    case DONATION_STATUS.COMPLETED:
      return "#2ED573";
    case DONATION_STATUS.CANCELLED:
      return "#95A5A6";
    default:
      return "#FFC107";
  }
};
