import axiosClient from '@/apis/axiosClient';

class NotificationAPI {
    HandleNotification = async (
        url = '',
        data,
        method = 'get',
    ) => {
        return await axiosClient(`/notification${url}`, {
            method: method ?? 'get',
            data,
        });
    };
}

const notificationAPI = new NotificationAPI();

export default notificationAPI;
