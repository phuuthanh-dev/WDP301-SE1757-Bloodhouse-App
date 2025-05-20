import axiosClient from "@/apis/axiosClient";

class BloodComponentAPI {
  HandleBloodComponent = async (url = "", data, method = "get") => {
    return await axiosClient(`/blood-component${url}`, {
      method: method ?? "get",
      data,
    });
  };
}

const bloodComponentAPI = new BloodComponentAPI();

export default bloodComponentAPI;
