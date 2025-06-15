import axiosClient from '@/apis/axiosClient';

class EventAPI {
    HandleEvent = async (
        url = '',
        data,
        method = 'get',
    ) => {
        return await axiosClient(`/event${url}`, {
            method: method ?? 'get',
            data,
        });
    };
}

const eventAPI = new EventAPI();

export default eventAPI;
