import api from "../../service/api";

import ProductForm
from "../../components/forms/ProductForm";

import Swal from "sweetalert2";

const AddProduct = () => {

  const submitProduct =
  async (data) => {

    try {

      await api.post(
        "/products",
        data
      );

      Swal.fire(
        "Success",
        "Product Added",
        "success"
      );

    } catch {

      Swal.fire(
        "Error",
        "Failed",
        "error"
      );
    }
  };

  return (

    <div className="card">

      <div className="card-body">

        <h3>
          Add Product
        </h3>

        <ProductForm
          onSubmit={submitProduct}
        />

      </div>

    </div>

  );
};

export default AddProduct;