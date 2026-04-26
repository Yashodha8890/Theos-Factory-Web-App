import axiosClient from './axiosClient';

export const getRentalItems = async (params = {}) => {
  const response = await axiosClient.get('/rentals', { params });
  return response.data;
};

export const bookRentalItem = async (data, token) => {
  const response = await axiosClient.post('/rentals/book', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getMyRentals = async (token) => {
  const response = await axiosClient.get('/rentals/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
