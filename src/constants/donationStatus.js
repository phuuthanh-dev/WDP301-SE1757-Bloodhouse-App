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
