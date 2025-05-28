import axiosClient from '@/apis/axiosClient';

class BloodDonationAPI {
    HandleBloodDonation = async (
        url = '',
        data,
        method = 'get',
    ) => {
        return await axiosClient(`/blood-donation${url}`, {
            method: method ?? 'get',
            data,
        });
    };
}

const bloodDonationAPI = new BloodDonationAPI();

export default bloodDonationAPI;
