import axiosClient from "@/apis/axiosClient";

class EmergencyCampaignAPI {
  HandleEmergencyCampaign = async (url = "", data, method = "get") => {
    return await axiosClient(`/emergency-campaign${url}`, {
      method: method ?? "get",
      data,
    });
  };
}

const emergencyCampaignAPI = new EmergencyCampaignAPI();

export default emergencyCampaignAPI;
