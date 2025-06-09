import axiosClient from '@/apis/axiosClient';

class UserBadgeAPI {
    HandleUserBadge = async (
        url = '',
        data,
        method = 'get',
    ) => {
        return await axiosClient(`/user-badge${url}`, {
            method: method ?? 'get',
            data,
        });
    };
}

const userBadgeAPI = new UserBadgeAPI();

export default userBadgeAPI;
