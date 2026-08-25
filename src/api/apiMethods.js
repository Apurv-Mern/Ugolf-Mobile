import client from './client';

export const getApi = async (endpoint, params) => {
  try {
    const response = await client.get(endpoint, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const postApi = async (endpoint, data) => {
  try {
    const response = await client.post(endpoint, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const putApi = async (endpoint, data) => {
  try {
    const response = await client.put(endpoint, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const patchApi = async (endpoint, data) => {
  try {
    const response = await client.patch(endpoint, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteApi = async endpoint => {
  try {
    const response = await client.delete(endpoint);
    return response.data;
  } catch (error) {
    throw error;
  }
};