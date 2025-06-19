import React, { createContext, useContext, useEffect, useState } from "react";
import { NotificationService } from "@/services/NotificationService";
import * as Notifications from "expo-notifications";
import { authSelector } from "@/redux/reducers/authReducer";
import { useSelector } from "react-redux";

const NotificationContext = createContext();

export function useNotification() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
  const [hasPermission, setHasPermission] = useState(false);
  const [pushToken, setPushToken] = useState(null);
  const [scheduledNotifications, setScheduledNotifications] = useState([]);
  const { user } = useSelector(authSelector);

  useEffect(() => {
    if (user) {
      setupNotifications();
      setupNotificationListeners();
    }
  }, [user]);

  const setupNotifications = async () => {
    const result = await NotificationService.setupNotifications(user._id);

    setHasPermission(result.granted);
    if (result.token) {
      setPushToken(result.token);
    }
    if (result.granted) {
      refreshScheduledNotifications();
    }
  };

  const setupNotificationListeners = () => {
    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        // console.log("Received notification:", notification);
      }
    );

    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const { type } = response.notification.request.content.data;
        handleNotificationResponse(type);
      });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  };

  const refreshScheduledNotifications = async () => {
    const notifications =
      await NotificationService.getAllScheduledNotifications();
    setScheduledNotifications(notifications);
  };

  const handleNotificationResponse = (type) => {
    // Handle different notification types
    switch (type) {
      case "donation_reminder":
        // Navigate to donation appointment screen
        break;
      case "eligibility_reminder":
        // Navigate to donation registration screen
        break;
      case "emergency_request":
        // Navigate to emergency request details
        break;
      default:
        break;
    }
  };

  const scheduleDonationReminder = async (donationDate) => {
    if (!hasPermission) {
      console.log("Notification permissions not granted");
      return false;
    }

    const identifier = await NotificationService.scheduleDonationReminder(
      donationDate
    );
    if (identifier) {
      await refreshScheduledNotifications();
      return true;
    }
    return false;
  };

  const scheduleNextDonationEligibility = async (lastDonationDate, gender) => {
    if (!hasPermission) {
      console.log("Notification permissions not granted");
      return false;
    }

    const identifier =
      await NotificationService.scheduleNextDonationEligibility(
        lastDonationDate,
        gender
      );
    if (identifier) {
      await refreshScheduledNotifications();
      return true;
    }
    return false;
  };

  const sendEmergencyNotification = async (bloodType, location) => {
    if (!hasPermission) {
      console.log("Notification permissions not granted");
      return false;
    }

    const identifier = await NotificationService.sendEmergencyNotification(
      bloodType,
      location
    );
    if (identifier) {
      await refreshScheduledNotifications();
      return true;
    }
    return false;
  };

  const cancelNotification = async (identifier) => {
    await NotificationService.cancelNotification(identifier);
    await refreshScheduledNotifications();
  };

  const cancelAllNotifications = async () => {
    await NotificationService.cancelAllNotifications();
    setScheduledNotifications([]);
  };

  const value = {
    hasPermission,
    pushToken,
    scheduledNotifications,
    scheduleDonationReminder,
    scheduleNextDonationEligibility,
    sendEmergencyNotification,
    cancelNotification,
    cancelAllNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
