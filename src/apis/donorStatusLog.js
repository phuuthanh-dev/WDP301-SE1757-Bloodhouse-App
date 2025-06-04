import axiosClient from "@/apis/axiosClient";
const donorStatusLogAPI = {
  HandleDonorStatusLog: async (url, data, method = 'GET') => {
    return await axiosClient({
      method,
      url: `/donor-status-log${url}`,
      data,
    });
  },
};

export default donorStatusLogAPI; 