import axiosClient from "@/apis/axiosClient";

class BloodRequestAPI {
    HandleBloodRequest = async (
        url = '',
        data,
        method = 'get',
    ) => {
        return await axiosClient(`/blood-request${url}`, {
            method: method ?? 'get',
            data,
        });
    };
}

const bloodRequestAPI = new BloodRequestAPI();

export default bloodRequestAPI;
