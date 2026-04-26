import axiosClient from './axiosClient';

export const getGalleryItems = async () => {
  const response = await axiosClient.get('/gallery');
  return response.data;
};
