import axiosClient from "./axiosClient";

class BloodGroupAPI {
    HandleBloodGroup = async (
        url = '',
        data,
        method = 'get',
    ) => {
        return await axiosClient(`/blood-group${url}`, {
            method: method ?? 'get',
            data,
        });
    };
}

const bloodGroupAPI = new BloodGroupAPI();

export default bloodGroupAPI;
