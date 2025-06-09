import axiosClient from "@/apis/axiosClient";

class BloodDeliveryAPI {
  HandleBloodDelivery = async (url = "", data, method = "get") => {
    return await axiosClient(`/blood-delivery${url}`, {
      method: method ?? "get",
      data,
    });
  };
}

const bloodDeliveryAPI = new BloodDeliveryAPI();

export default bloodDeliveryAPI;
