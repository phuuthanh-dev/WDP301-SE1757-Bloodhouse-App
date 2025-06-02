import axiosClient from "@/apis/axiosClient";

class BloodRequestSupportAPI {
  HandleBloodRequestSupport = async (url = "", data, method = "get") => {
    return await axiosClient(`/blood-request-support${url}`, {
      method: method ?? "get",
      data,
    });
  };
}

const bloodRequestSupportAPI = new BloodRequestSupportAPI();

export default bloodRequestSupportAPI;
