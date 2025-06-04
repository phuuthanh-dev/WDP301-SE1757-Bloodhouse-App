const formatPrice = (price) => {
  return price.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });
};

// Format datetime với local time (dd/MM/yyyy HH:mm)
const formatDateTime = (date) => {
  const d = new Date(date);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};

// Format date với local time (dd/MM/yyyy)
const formatDate = (date) => {
  const d = new Date(date);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}`;
};

// Format time với local time (HH:mm)
const formatTime = (time) => {
  const d = new Date(time);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};

const formatDurationRoute = (minutes) => {
  if (minutes < 60) {
    return `${Math.round(minutes)} phút`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  return `${hours} giờ ${remainingMinutes} phút`;
};

const formatBloodPressure = (bloodPressure) => {
  const bpPattern = /^(\d{2,3})\/(\d{2,3})(\s*mmHg)?$/;
  const bpMatch = bloodPressure?.match(bpPattern);
  return bpMatch ? `${bpMatch[1]}/${bpMatch[2]} mmHg` : bloodPressure;
};


export { formatPrice, formatDateTime, formatDate, formatTime, formatDurationRoute, formatBloodPressure };
