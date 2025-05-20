import React, { useState, useEffect } from "react";
import MainNavigator from "@/navigators/MainNavigator";
import AuthNavigator from "@/navigators/AuthNavigator";
import {
  useAsyncStorage,
} from "@react-native-async-storage/async-storage";
import { addAuth, authSelector } from "@/redux/reducers/authReducer";
import { useDispatch, useSelector } from "react-redux";

export default function AppRouters() {
  const auth = useSelector(authSelector);
  const { getItem: getToken } = useAsyncStorage("token");
  const { getItem: getUserData } = useAsyncStorage("userData");
  const dispatch = useDispatch();

  useEffect(() => {
    handleGetData();
  }, []);

  const handleGetData = async () => {
    await checkLogin();
  };

  const checkLogin = async () => {
    const token = await getToken();
    const userData = await getUserData();
    token &&
      userData &&
      dispatch(addAuth({ token, user: JSON.parse(userData) }));
  };

  return auth.token ? <MainNavigator /> : <AuthNavigator />;
}
