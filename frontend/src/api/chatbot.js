import axiosClient from './axiosClient';

export const sendChatbotMessage = async (payload) => {
  const response = await axiosClient.post('/chatbot/message', payload);
  return response.data;
};
