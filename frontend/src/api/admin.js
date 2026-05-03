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

export const getAdminOrders = async (token, params = {}) => {
  const response = await axiosClient.get('/admin/orders', {
    params,
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateAdminOrderStatus = async (token, id, status) => {
  const response = await axiosClient.patch(`/admin/orders/${id}/status`, { status }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getAdminGallery = async (token, params = {}) => {
  const response = await axiosClient.get('/admin/gallery', {
    params,
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const createAdminGalleryItem = async (token, data) => {
  const response = await axiosClient.post('/admin/gallery', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateAdminGalleryItem = async (token, id, data) => {
  const response = await axiosClient.patch(`/admin/gallery/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deleteAdminGalleryItem = async (token, id) => {
  const response = await axiosClient.delete(`/admin/gallery/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getAdminBookings = async (token, params = {}) => {
  const response = await axiosClient.get('/admin/bookings', {
    params,
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateAdminBookingStatus = async (token, id, status) => {
  const response = await axiosClient.patch(`/admin/bookings/${id}/status`, { status }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const rescheduleAdminBooking = async (token, id, data) => {
  const response = await axiosClient.patch(`/admin/bookings/${id}/reschedule`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getAdminUsers = async (token, params = {}) => {
  const response = await axiosClient.get('/admin/users', {
    params,
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const createAdminUser = async (token, data) => {
  const response = await axiosClient.post('/admin/users', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateAdminUser = async (token, id, data) => {
  const response = await axiosClient.patch(`/admin/users/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getAdminQuotations = async (token, params = {}) => {
  const response = await axiosClient.get('/admin/quotations', {
    params,
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateAdminQuotationStatus = async (token, id, status) => {
  const response = await axiosClient.patch(`/admin/quotations/${id}/status`, { status }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
