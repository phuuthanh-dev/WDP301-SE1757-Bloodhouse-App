import axios from 'axios';
import axiosClient from './axiosClient';

class BloodCompatibilityAPI {
    HandleBloodCompatibility = async (
        url = '',
        data,
        method = 'get',
    ) => {
        const response = await axiosClient(`/blood-compatibility${url}`, {
            method: method ?? 'get',
            data,
        });
        return response;
    };
}

const bloodCompatibilityAPI = new BloodCompatibilityAPI();

export default bloodCompatibilityAPI;