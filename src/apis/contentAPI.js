import axiosClient from "@/apis/axiosClient";

class ContentAPI {
  HandleContent = async (url = "", data, method = "get") => {
    return await axiosClient(`/content${url}`, {
      method: method ?? "get",
      data,
    });
  };
}

const contentAPI = new ContentAPI();

export default contentAPI;
