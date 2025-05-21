import axiosClient from "@/apis/axiosClient";

class BloodDonationRegistrationAPI {
  HandleBloodDonationRegistration = async (
    url = '',
    data,
    method = 'get',
  ) => {
    return await axiosClient(`/blood-donation-registration${url}`, {
      method: method ?? 'get',
      data,
    });
  };
}

const bloodDonationRegistrationAPI = new BloodDonationRegistrationAPI();
export default bloodDonationRegistrationAPI;
