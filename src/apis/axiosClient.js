import { BASE_URL } from "@/configs/globalVariables";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import queryString from "query-string";
import { toast } from "sonner-native";

const getAccessToken = async () => {
  const res = await AsyncStorage.getItem("token");
  return res ? res : "";
};

const axiosClient = axios.create({
  baseURL: BASE_URL,
  paramsSerializer: (params) => queryString.stringify(params),
  headers: {
    Accept: "application/json",
  },
});

axiosClient.interceptors.request.use(async (config) => {
  try {
    const accessToken = await getAccessToken();
    config.headers = {
      ...config.headers,
      Authorization: accessToken ? `Bearer ${accessToken}` : "",
    };

    return config;
  } catch (error) {
    console.error("Request interceptor error:", error);
    return config;
  }
});

axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const errorMessage =
      error.response?.data?.message || error.message || "An error occurred";
    // toast.error(errorMessage);
    throw error;
  }
);

export default axiosClient;
