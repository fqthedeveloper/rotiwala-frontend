import {
  useForm,
} from "react-hook-form";

import {
  yupResolver,
} from "@hookform/resolvers/yup";

import {
  productSchema,
} from "../../validation/productSchema";

const ProductForm = ({
  onSubmit,
  defaultValues,
}) => {

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({

    resolver:
      yupResolver(productSchema),

    defaultValues,
  });

  return (

    <form
      onSubmit={handleSubmit(onSubmit)}
    >

      <div className="mb-3">

        <label>
          Product Name
        </label>

        <input
          {...register("name")}
          className="form-control"
        />

        <small className="text-danger">
          {errors.name?.message}
        </small>

      </div>

      <div className="mb-3">

        <label>
          Category
        </label>

        <input
          {...register("category")}
          className="form-control"
        />

        <small className="text-danger">
          {errors.category?.message}
        </small>

      </div>

      <div className="mb-3">

        <label>
          Price
        </label>

        <input
          type="number"
          {...register("price")}
          className="form-control"
        />

      </div>

      <div className="mb-3">

        <label>
          Description
        </label>

        <textarea
          rows="4"
          {...register(
            "description"
          )}
          className="form-control"
        />

      </div>

      <button
        className="btn btn-primary-custom"
      >
        Save Product
      </button>

    </form>

  );
};

export default ProductForm;