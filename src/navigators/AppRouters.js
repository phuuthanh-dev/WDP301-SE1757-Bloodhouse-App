import React, { useState, useEffect } from "react";
import AuthNavigator from "@/navigators/AuthNavigator";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { addAuth, authSelector } from "@/redux/reducers/authReducer";
import { useDispatch, useSelector } from "react-redux";
import MainNavigatorMember from "./member/MainNavigatorMember";
import MainNavigatorManager from "./manager/MainNavigatorManager";
import MainNavigatorDoctor from "./doctor/MainNavigatorDoctor";
import MainNavigatorNurse from "./nurse/MainNavigatorNurse";
import MainNavigatorTransporter from "./transporter/MainNavigatorTransporter";

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

  if (!auth.token) return <AuthNavigator />;
  if (auth.user.role === "MEMBER") return <MainNavigatorMember />;
  if (auth.user.role === "NURSE") return <MainNavigatorNurse />;
  if (auth.user.role === "MANAGER") return <MainNavigatorManager />;
  if (auth.user.role === "DOCTOR") return <MainNavigatorDoctor />;
  if (auth.user.role === "TRANSPORTER") return <MainNavigatorTransporter />;

  return <AuthNavigator />;
}
