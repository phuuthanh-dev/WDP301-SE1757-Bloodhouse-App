import axiosClient from '@/apis/axiosClient';

class EventRegistrationAPI {
    HandleEventRegistration = async (
        url = '',
        data,
        method = 'get',
    ) => {
        return await axiosClient(`/event-registration${url}`, {
            method: method ?? 'get',
            data,
        });
    };
}

const eventRegistrationAPI = new EventRegistrationAPI();

export default eventRegistrationAPI;
