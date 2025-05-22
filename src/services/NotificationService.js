import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import userAPI from "@/apis/userAPI";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export class NotificationService {
  static async setupNotifications(userId) {
    let permissionGranted = false;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF6B6B",
      });
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    permissionGranted = finalStatus === "granted";

    if (permissionGranted) {
      // Get push token only if permission is granted
      if (Device.isDevice) {
        try {
          const token = await Notifications.getExpoPushTokenAsync({
            projectId: Constants.expoConfig.extra.eas.projectId,
          });
          const response = await userAPI.HandleUser("/update-expo-token", {
            expoPushToken: token.data,
          }, "post");
          if (response.status === 200) {
            return { granted: true, token: token.data };
          } else {
            return { granted: false, token: null };
          }
        } catch (error) {
          return { granted: true, token: null };
        }
      } else {
        return { granted: true, token: null };
      }
    }

    return { granted: false, token: null };
  }

  static async scheduleDonationReminder(donationDate) {
    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Nhắc nhở hiến máu",
          body: "Bạn có lịch hẹn hiến máu vào ngày mai. Hãy đảm bảo nghỉ ngơi đầy đủ nhé!",
          data: { type: "donation_reminder" },
        },
        trigger: {
          seconds: 5, // Test notification after 5 seconds
        },
      });
      return identifier;
    } catch (error) {
      console.error("Error scheduling donation reminder:", error);
      return false;
    }
  }

  static async scheduleNextDonationEligibility(
    lastDonationDate,
    gender = "male"
  ) {
    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Bạn đã đủ điều kiện hiến máu",
          body: "Đã đến lúc bạn có thể hiến máu lại rồi! Hãy đặt lịch hẹn ngay nhé.",
          data: { type: "eligibility_reminder" },
        },
        trigger: {
          seconds: 10, // Test notification after 10 seconds
        },
      });
      return identifier;
    } catch (error) {
      console.error("Error scheduling eligibility reminder:", error);
      return false;
    }
  }

  static async sendEmergencyNotification(bloodType, location) {
    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Yêu cầu hiến máu khẩn cấp",
          body: `Cần gấp nhóm máu ${bloodType} tại ${location}. Bạn có thể giúp đỡ không?`,
          data: { type: "emergency_request" },
        },
        trigger: null, // Send immediately
      });
      return identifier;
    } catch (error) {
      console.error("Error sending emergency notification:", error);
      return false;
    }
  }

  static async getAllScheduledNotifications() {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  static async cancelNotification(identifier) {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  }

  static async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
}
