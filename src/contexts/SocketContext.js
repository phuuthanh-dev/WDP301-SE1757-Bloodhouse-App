/* eslint-disable react/prop-types */
import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import { authSelector } from "@/redux/reducers/authReducer";
import { BASE_WS } from "@/configs/globalVariables";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import bloodDeliveryAPI from "@/apis/bloodDeliveryAPI";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";

const LOCATION_TRACKING = "location-tracking";
const TRACKING_INFO_KEY = "@tracking_info";

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

TaskManager.defineTask(
  LOCATION_TRACKING,
  async ({ data: { locations }, error }) => {
    if (error) {
      console.error("Error in location tracking:", error);
      return;
    }
    const socket = global.socket;
    if (socket && locations.length > 0) {
      const location = locations[locations.length - 1];
      socket.emit("transporter:location", {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        deliveryId: global.currentDeliveryId,
        timestamp: new Date().toISOString(),
      });

      // Lưu location cuối cùng để resume
      try {
        await AsyncStorage.setItem(
          "@last_location",
          JSON.stringify({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            timestamp: new Date().toISOString(),
          })
        );
      } catch (error) {
        console.error("Error saving last location:", error);
      }
    }
  }
);

const setupSocketListeners = (socket) => {
  // Xử lý sự kiện tracking resumed
  socket.on("tracking:resumed", (data) => {
    Toast.show({
      type: "success",
      text1: "Đã tiếp tục theo dõi",
      text2: `Đã tiếp tục theo dõi sau ${data.downtime} phút gián đoạn`,
      position: "top",
      visibilityTime: 4000,
    });
  });

  // Xử lý các sự kiện lỗi
  socket.on("error", (error) => {
    Toast.show({
      type: "error",
      text1: "Error",
      text2: error.message,
      position: "top",
      visibilityTime: 4000,
    });
  });

  // Xử lý sự kiện authenticated
  socket.on("authenticated", (data) => {
    console.log("Socket authenticated:", data.message);
  });

  // Cleanup function để remove listeners
  return () => {
    socket.off("tracking:resumed");
    socket.off("error");
    socket.off("authenticated");
  };
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { token } = useSelector(authSelector);
  const dispatch = useDispatch();
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    if (token) {
      const socketio = io(BASE_WS, {
        auth: { token },
        transports: ["websocket"],
      });

      // Store socket in global scope for background task
      global.socket = socketio;
      setSocket(socketio);

      // Setup socket event listeners và lưu cleanup function
      const cleanup = setupSocketListeners(socketio);

      // Check và resume tracking nếu cần
      checkAndResumeTracking(socketio);

      return () => {
        cleanup(); // Remove all listeners
        socketio.close();
        global.socket = null;
        setSocket(null);
      };
    }
  }, [token]);

  const checkAndResumeTracking = async (socketio) => {
    try {
      const trackingInfo = await AsyncStorage.getItem(TRACKING_INFO_KEY);
      if (trackingInfo) {
        const { deliveryId, startTime } = JSON.parse(trackingInfo);
        const lastLocation = await AsyncStorage.getItem("@last_location");

        // Kiểm tra xem delivery có đang active không
        // const response = await fetch(`${BASE_URL}/api/deliveries/${deliveryId}`);
        const response = await bloodDeliveryAPI.HandleBloodDelivery(
          `/${deliveryId}`
        );
        const delivery = response.data;
        if (delivery.status === "in_transit") {
          // Resume tracking
          await startLocationTracking(deliveryId);
          setIsTracking(true);

          // Gửi thông tin resume
          if (lastLocation) {
            socketio.emit("transporter:resume_tracking", {
              deliveryId,
              lastLocation: JSON.parse(lastLocation),
              startTime,
              resumeTime: new Date().toISOString(),
            });
          }
        } else {
          // Nếu delivery không còn active, clear tracking info
          await AsyncStorage.removeItem(TRACKING_INFO_KEY);
          await AsyncStorage.removeItem("@last_location");
        }
      }
    } catch (error) {
      console.error("Error resuming tracking:", error);
    }
  };

  const startLocationTracking = async (deliveryId) => {
    try {
      if (isTracking) return;
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Location permission denied");
      }

      await Location.requestBackgroundPermissionsAsync();
      global.currentDeliveryId = deliveryId;

      // Lưu thông tin tracking để có thể resume
      await AsyncStorage.setItem(
        TRACKING_INFO_KEY,
        JSON.stringify({
          deliveryId,
          startTime: new Date().toISOString(),
        })
      );

      // Cập nhật vị trí trong foreground(khi app đang mở)
      //   Location.watchPositionAsync(
      //     {
      //       accuracy: Location.Accuracy.High,
      //       timeInterval: 60000,
      //       distanceInterval: 50,
      //     },
      //     (location) => {
      //       if (socket) {
      //         socket.emit("transporter:location", {
      //           latitude: location.coords.latitude,
      //           longitude: location.coords.longitude,
      //           deliveryId,
      //           timestamp: new Date().toISOString(),
      //         });
      //       }
      //     }
      //   );

      // Cập nhật vị trí trong background(khi app đang ở nền)
      await Location.startLocationUpdatesAsync(LOCATION_TRACKING, {
        accuracy: Location.Accuracy.High,
        // timeInterval: 10000,
        // distanceInterval: 50,
        deferredUpdatesInterval: 60000,
        deferredUpdatesDistance: 50,
        deferredUpdatesTimeout: 10000,
        foregroundService: {
          notificationTitle: "Blood House Delivery",
          notificationBody: "Tracking your location for delivery",
        },
        pausesUpdatesAutomatically: true,
        showsBackgroundLocationIndicator: true,
      });

      setIsTracking(true);
    } catch (error) {
      console.error("Error starting location tracking:", error);
      throw error;
    }
  };

  const stopLocationTracking = async () => {
    try {
      await Location.stopLocationUpdatesAsync(LOCATION_TRACKING);
      global.currentDeliveryId = null;

      // Clear tracking info
      await AsyncStorage.removeItem(TRACKING_INFO_KEY);
      await AsyncStorage.removeItem("@last_location");

      setIsTracking(false);
    } catch (error) {
      console.error("Error stopping location tracking:", error);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        startLocationTracking,
        stopLocationTracking,
        isTracking,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
