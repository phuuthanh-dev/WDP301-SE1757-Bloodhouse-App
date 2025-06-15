export const EVENT_STATUS = {
    DRAFT: "draft",
    SCHEDULED: "scheduled",
    IN_PROGRESS: "in_progress",
    CANCELLED: "cancelled",
    COMPLETED: "completed",
  };
  
  export const getStatusEventColor = (status) => {
    switch (status) {
      case EVENT_STATUS.DRAFT:
        return {
          bg: "#FFF4E5",
          text: "#FF8B00",
          icon: "file-document-edit"
        };
      case EVENT_STATUS.SCHEDULED:
        return {
          bg: "#E3FCEF",
          text: "#00B074",
          icon: "calendar-check"
        };
      case EVENT_STATUS.IN_PROGRESS:
        return {
          bg: "#E8F4FF",
          text: "#0085FF",
          icon: "progress-clock"
        };
      case EVENT_STATUS.CANCELLED:
        return {
          bg: "#FFE8E8",
          text: "#FF4D4F",
          icon: "close-circle"
        };
      case EVENT_STATUS.COMPLETED:
        return {
          bg: "#F0F0F0",
          text: "#2D3436",
          icon: "check-circle"
        };
      default:
        return {
          bg: "#F0F0F0",
          text: "#909090",
          icon: "information"
        };
    }
  };