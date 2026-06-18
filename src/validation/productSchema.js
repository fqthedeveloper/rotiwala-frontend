import * as yup from "yup";

export const productSchema =
  yup.object({

    name: yup
      .string()
      .required("Name required"),

    category: yup
      .string()
      .required("Category required"),

    price: yup
      .number()
      .required("Price required"),

    description: yup
      .string()
      .required("Description required"),

  });