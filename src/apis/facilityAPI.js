import axiosClient from '@/apis/axiosClient';

class FacilityAPI {
    HandleFacility = async (
        url = '',
        data,
        method = 'get',
    ) => {
        return await axiosClient(`/facility${url}`, {
            method: method ?? 'get',
            data,
        });
    };
}

const facilityAPI = new FacilityAPI();

export default facilityAPI;
