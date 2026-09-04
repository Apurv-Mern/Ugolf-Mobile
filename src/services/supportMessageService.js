import { postApi } from '../api/apiMethods';
import { ENDPOINTS } from '../api/endpoints';

export const submitSupportMessageApi = async (data) => {
  return await postApi(ENDPOINTS.SUPPORT_MESSAGES, data);
};
