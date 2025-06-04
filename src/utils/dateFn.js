// Helper: Lấy ngày đầu tuần (thứ 2)
export function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Nếu chủ nhật thì -6, còn lại -day+1
  return new Date(d.setDate(diff));
}

// Helper: Lấy 7 ngày trong tuần hiện tại
export function getWeekDays(start) {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    days.push(day);
  }
  return days;
}

// Sử dụng local time thay vì UTC để tránh vấn đề timezone
export const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};


  

