import axiosClient from '@/apis/axiosClient';

class ProcessDonationLogAPI {
    HandleProcessDonationLog = async (
        url = '',
        data,
        method = 'get',
    ) => {
        return await axiosClient(`/process-donation-log${url}`, {
            method: method ?? 'get',
            data,
        });
    };
}

const processDonationLogAPI = new ProcessDonationLogAPI();

export default processDonationLogAPI;
