import axiosClient from '@/apis/axiosClient';

class BloodUnitAPI {
    HandleBloodUnit = async (
        url = '',
        data,
        method = 'get',
    ) => {
        return await axiosClient(`/blood-unit${url}`, {
            method: method ?? 'get',
            data,
        });
    };
}

const bloodUnitAPI = new BloodUnitAPI();

export default bloodUnitAPI; 