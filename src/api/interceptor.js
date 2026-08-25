import client from './client';
import {
  getStorageData,
  setStorageData,
  clearStorage,
} from '../storage/storage';

import {
  navigationRef,
} from '../navigation/RootNavigator';
import Toast from 'react-native-toast-message';
import { ENDPOINTS } from './endpoints';
import { store } from '../redux/store';
import { logout } from '../redux/slices/authSlice';

let isLoggingOut = false;
let refreshPromise = null;

const AUTH_SKIP_REFRESH = [
  'login',
  'register',
  'forgot-password',
  'reset-password',
  'refresh',
];

const shouldSkipAuthRetry = (url = '') =>
  AUTH_SKIP_REFRESH.some((part) => String(url).includes(part));

const forceLogout = async (message, title = 'Session Expired') => {
  if (isLoggingOut) return;
  isLoggingOut = true;
  try {
    store.dispatch(logout());
  } catch (e) {
    console.log('Redux logout dispatch note:', e);
  }
  await clearStorage();
  Toast.show({
    type: 'error',
    text1: title,
    text2: message || 'Your session has expired. Please login again.',
  });
  const redirectToAuth = () => {
    if (navigationRef.isReady()) {
      navigationRef.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    } else {
      setTimeout(redirectToAuth, 100);
    }
  };
  redirectToAuth();
  setTimeout(() => {
    isLoggingOut = false;
  }, 1000);
};

const refreshAccessToken = async () => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const refreshToken = await getStorageData('refreshToken');
      if (!refreshToken) return null;

      const response = await client.post(
        ENDPOINTS.REFRESH,
        { refreshToken },
        { skipAuthRetry: true },
      );
      const data = response?.data || {};
      const accessToken = data.accessToken || data?.data?.accessToken;
      const nextRefresh = data.refreshToken || data?.data?.refreshToken || refreshToken;
      if (!accessToken) return null;

      await setStorageData('token', accessToken);
      await setStorageData('refreshToken', nextRefresh);
      return accessToken;
    } catch (err) {
      console.log('Token refresh failed:', err?.response?.status || err?.message);
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

// REQUEST
client.interceptors.request.use(
  async config => {
    if (config.skipAuthRetry || shouldSkipAuthRetry(config.url || '')) {
      return config;
    }

    const token = await getStorageData('token');

    console.log('REQUEST:', config.url);
    console.log('TOKEN =>', token);

    if (token) {
      if (!config.headers) {
        config.headers = {};
      }
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  error => Promise.reject(error),
);

// RESPONSE
client.interceptors.response.use(
  response => response,

  async error => {
    const status = error?.response?.status;
    const failedApi = error?.config?.url || '';
    const originalRequest = error?.config;
    const errorData = error?.response?.data;
    const errorMsg = String(
      errorData?.error || errorData?.message || errorData?.data?.message || error?.message || ''
    ).toLowerCase();

    console.log('FAILED API =>', failedApi);
    console.log('STATUS =>', status);

    // If account has been suspended (403 or suspension error)
    if (
      (status === 403 || errorMsg.includes('suspend') || errorMsg.includes('suspended')) &&
      !shouldSkipAuthRetry(failedApi)
    ) {
      console.log('ACCOUNT SUSPENDED → REDIRECT TO LOGIN');
      await forceLogout(
        errorData?.error || errorData?.message || 'Your account has been suspended. Please contact support.',
        'Account Suspended'
      );
      return Promise.reject(error);
    }

    if (
      status === 401 &&
      (failedApi.includes('verify-email') || failedApi.includes('send-verification-otp'))
    ) {
      console.log('VERIFICATION SESSION EXPIRED → REDIRECT TO LOGIN');
      await forceLogout('Your verification session has expired. Please log in again to receive a new verification code.');
      return Promise.reject(error);
    }

    if (
      failedApi.includes('verify-email') ||
      failedApi.includes('send-verification-otp')
    ) {
      return Promise.reject(error);
    }

    if (status === 401 && !shouldSkipAuthRetry(failedApi)) {
      if (originalRequest && !originalRequest._retry && !originalRequest.skipAuthRetry) {
        originalRequest._retry = true;
        const newToken = await refreshAccessToken();
        if (newToken) {
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          return client(originalRequest);
        }
      }

      await forceLogout('Your session has expired. Please login again.');
      return Promise.reject(error);
    }

    return Promise.reject(error);
  },
);
