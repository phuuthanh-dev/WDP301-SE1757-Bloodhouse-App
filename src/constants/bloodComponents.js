// Blood Component Constants từ Backend Enum
export const BLOOD_COMPONENT = {
  WHOLE: "Máu toàn phần",
  RED_CELLS: "Hồng cầu",
  PLASMA: "Huyết tương",
  PLATELETS: "Tiểu cầu",
};

// Component options cho phân chia
export const getAvailableComponents = (donationComponent) => {
  // Nếu là máu toàn phần, có thể phân chia thành tất cả các component khác
  if (donationComponent === BLOOD_COMPONENT.WHOLE) {
    return [
      BLOOD_COMPONENT.RED_CELLS,
      BLOOD_COMPONENT.PLASMA,
      BLOOD_COMPONENT.PLATELETS,
    ];
  }
  
  // Nếu là component cụ thể, chỉ có thể chia thành cùng component đó
  return [donationComponent];
};

// Kiểm tra có thể phân chia không
export const canBeDivided = (donationComponent) => {
  // Tất cả các loại máu đều có thể phân chia
  return Object.values(BLOOD_COMPONENT).includes(donationComponent);
}; 