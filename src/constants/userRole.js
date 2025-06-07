export const USER_ROLE = {
  MANAGER: 'MANAGER',
  DOCTOR: 'DOCTOR',
  NURSE: 'NURSE',
  MEMBER: 'MEMBER',
  TRANSPORTER: 'TRANSPORTER',
};

export const STAFF_ROLES = [USER_ROLE.MANAGER, USER_ROLE.DOCTOR, USER_ROLE.NURSE, USER_ROLE.TRANSPORTER ];

export const getRoleName = (role) => {
  switch (role) {
    case USER_ROLE.MANAGER:
      return 'Quản lý';
    case USER_ROLE.DOCTOR:
      return 'Bác sĩ';
    case USER_ROLE.NURSE:
      return 'Y tá';
    case USER_ROLE.MEMBER:
      return 'Thành viên';
    case USER_ROLE.TRANSPORTER:
      return 'Vận chuyển';
    default:
      return 'Tất cả';
  }
}; 