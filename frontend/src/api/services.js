import axiosClient from './axiosClient';

export const getServices = async () => {
  const response = await axiosClient.get('/services');
  return response.data;
};

export const getServiceBySlug = async (slug) => {
  const response = await axiosClient.get(`/services/${slug}`);
  return response.data;
};
