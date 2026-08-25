import { getApi, postApi, patchApi, deleteApi } from '../api/apiMethods';
import { ENDPOINTS } from '../api/endpoints';

// GET paginated list of notifications
export const getNotificationsApi = async (params = { page: 1, limit: 20 }) => {
  return await getApi(ENDPOINTS.NOTIFICATIONS, params);
};

// GET unread notifications count
export const getUnreadNotificationsCountApi = async () => {
  return await getApi(ENDPOINTS.NOTIFICATIONS_UNREAD_COUNT);
};

// POST mark all notifications as read
export const markAllNotificationsReadApi = async () => {
  return await postApi(ENDPOINTS.NOTIFICATIONS_READ_ALL);
};

// DELETE clear all notifications API (/api/v1/mobile/notifications/read)
export const clearAllNotificationsApi = async () => {
  return await postApi(ENDPOINTS.NOTIFICATIONS_CLEAR_ALL);
};

// GET notification details by ID
export const getNotificationByIdApi = async (id) => {
  return await getApi(ENDPOINTS.NOTIFICATION_BY_ID(id));
};

// PATCH mark single notification as read
export const markNotificationReadApi = async (id) => {
  return await patchApi(ENDPOINTS.NOTIFICATION_READ(id));
};

// POST respond to a notification (accept / decline action)
export const respondToNotificationApi = async (id, data) => {
  return await postApi(ENDPOINTS.NOTIFICATION_RESPOND(id), data);
};
