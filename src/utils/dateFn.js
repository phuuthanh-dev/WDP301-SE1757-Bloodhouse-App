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
export const formatDate = (date) => date.toISOString().split('T')[0];


  

