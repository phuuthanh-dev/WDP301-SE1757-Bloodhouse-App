import axiosClient from "@/apis/axiosClient";

class BloodInventoryAPI {
    HandleBloodInventory = async (
        url = '',
        data,
        method = 'get',
    ) => {
        return await axiosClient(`/blood-inventory${url}`, {
            method: method ?? 'get',
            data,
        });
    };
}

const bloodInventoryAPI = new BloodInventoryAPI();

export default bloodInventoryAPI;
