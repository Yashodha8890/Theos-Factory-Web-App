import axiosClient from './axiosClient';

export const bookAppointment = async (data, token) => {
  const response = await axiosClient.post('/appointments', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getMyAppointments = async (token) => {
  const response = await axiosClient.get('/appointments/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
