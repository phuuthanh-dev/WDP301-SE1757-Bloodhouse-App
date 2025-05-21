import axiosClient from '@/apis/axiosClient';

class FacilityStaffAPI {
    HandleFacilityStaff = async (
        url = '',
        data,
        method = 'get',
    ) => {
        return await axiosClient(`/facility-staff${url}`, {
            method: method ?? 'get',
            data,
        });
    };
}

const facilityStaffAPI = new FacilityStaffAPI();

export default facilityStaffAPI;
