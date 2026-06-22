import api from "./api";

export const getContactInfo =
  async () => {

    const response =
      await api.get(
        "/contact/"
      );

    return response.data;
};

export const submitFeedback =
  async (data) => {

    const response =
      await api.post(
        "/contact/feedback/",
        data
      );

    return response.data;
};