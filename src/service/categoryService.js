import api from "./api";

export const getCategories =
  async () => {

    const res =
      await api.get(
        "/menu/categories/"
      );

    return res.data;
  };

export const createCategory =
  async (formData) => {

    const res =
      await api.post(
        "/menu/categories/",
        formData,
        {
          headers:{
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

    return res.data;
  };

export const updateCategory =
  async (
    id,
    formData
  ) => {

    const res =
      await api.put(
        `/menu/categories/${id}/`,
        formData,
        {
          headers:{
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

    return res.data;
  };

export const deleteCategory =
  async (id) => {

    const res =
      await api.delete(
        `/menu/categories/${id}/`
      );

    return res.data;
  };

export const getCategoryById =
  async (id) => {

    const res =
      await api.get(
        `/menu/categories/${id}/`
      );

    return res.data;
  };