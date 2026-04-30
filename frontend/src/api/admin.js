import axiosClient from './axiosClient';

export const loginAdmin = async (data) => {
  const response = await axiosClient.post('/auth/admin/login', data);
  return response.data;
};

export const getAdminOverview = async (token) => {
  const response = await axiosClient.get('/admin/overview', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getAdminInventory = async (token, params = {}) => {
  const response = await axiosClient.get('/admin/inventory', {
    params,
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const createAdminInventoryItem = async (token, data) => {
  const response = await axiosClient.post('/admin/inventory', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateAdminInventoryItem = async (token, id, data) => {
  const response = await axiosClient.patch(`/admin/inventory/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deleteAdminInventoryItem = async (token, id) => {
  const response = await axiosClient.delete(`/admin/inventory/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
