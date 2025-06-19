import axiosClient from "@/apis/axiosClient";
import { BASE_URL } from "@/configs/globalVariables";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

class BloodRequestAPI {
    HandleBloodRequest = async (
        url = '',
        data,
        method = 'get',
    ) => {
        return await axiosClient(`/blood-request${url}`, {
            method: method ?? 'get',
            data,
        });
    };

    HandleBloodRequestFormData = async (
        url = '',
        data,
        method = 'post',
    ) => {
        const accessToken = await AsyncStorage.getItem("token");
        return await axios.post(`${BASE_URL}/blood-request${url}`, data, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${accessToken}`,
            },
        });
    }
}

const bloodRequestAPI = new BloodRequestAPI();

export default bloodRequestAPI;
