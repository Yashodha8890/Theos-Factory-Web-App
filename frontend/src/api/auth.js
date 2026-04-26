import axiosClient from './axiosClient';

export const registerUser = async (data) => {
  const response = await axiosClient.post('/auth/signup', data);
  return response.data;
};

export const loginUser = async (data) => {
  const response = await axiosClient.post('/auth/login', data);
  return response.data;
};

export const fetchProfile = async (token) => {
  const response = await axiosClient.get('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateUserProfile = async (token, data) => {
  const response = await axiosClient.patch('/users/me', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deleteUserAccount = async (token) => {
  const response = await axiosClient.delete('/users/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
