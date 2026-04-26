import axiosClient from './axiosClient';

export const requestQuotation = async (data, token) => {
  const response = await axiosClient.post('/quotations', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getMyQuotations = async (token) => {
  const response = await axiosClient.get('/quotations/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
