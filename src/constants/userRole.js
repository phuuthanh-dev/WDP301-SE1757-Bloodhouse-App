export const USER_ROLE = {
  MANAGER: 'MANAGER',
  DOCTOR: 'DOCTOR',
  NURSE: 'NURSE',
  MEMBER: 'MEMBER',
};

export const STAFF_ROLES = [USER_ROLE.MANAGER, USER_ROLE.DOCTOR, USER_ROLE.NURSE];

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
    default:
      return 'Tất cả';
  }
}; 