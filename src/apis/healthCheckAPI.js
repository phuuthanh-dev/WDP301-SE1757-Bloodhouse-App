import axiosClient from '@/apis/axiosClient';

class HealthCheckAPI {
    HandleHealthCheck = async (
        url = '',
        data,
        method = 'get',
    ) => {
        return await axiosClient(`/health-check${url}`, {
            method: method ?? 'get',
            data,
        });
    };
}

const healthCheckAPI = new HealthCheckAPI();

export default healthCheckAPI;
