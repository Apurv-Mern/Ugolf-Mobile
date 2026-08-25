import { postApi, getApi } from '../api/apiMethods';
import { ENDPOINTS } from '../api/endpoints';
import { getStorageData } from '../storage/storage';

export const registerApi = async data => {
  return await postApi(ENDPOINTS.REGISTER, data);
};

export const loginApi = async data => {
  return await postApi(ENDPOINTS.LOGIN, data);
};

export const forgotPasswordApi = async data => {
  return await postApi(ENDPOINTS.ForgotPassword, data);
};

export const sendVerificationOtpApi = async data => {
  return await postApi(ENDPOINTS.SEND_VERIFICATION_OTP, data);
};

export const verifyEmailApi = async data => {
  return await postApi(ENDPOINTS.VERIFY_EMAIL, data);
};

export const resetPasswordApi = async data => {
  return await postApi(ENDPOINTS.RESET_PASSWORD, data);
};

export const refreshTokenApi = async (refreshToken) => {
  return await postApi(ENDPOINTS.REFRESH, { refreshToken });
};

export const logoutApi = async () => {
  const refreshToken = await getStorageData('refreshToken');
  return await postApi(ENDPOINTS.LOGOUT, refreshToken ? { refreshToken } : {});
};

export const getAuthMeApi = async () => {
  return await getApi(ENDPOINTS.AUTH_ME);
};
