import {
  Link,
} from "react-router-dom";

import {
  useProducts,
} from "../../hooks/useProducts";

const Products = () => {

  const {
    data,
    isLoading,
  } = useProducts();

  if (isLoading) {
    return <h3>Loading...</h3>;
  }

  return (

    <div>

      <div
        className="
        d-flex
        justify-content-between
        mb-4"
      >

        <h2>
          Products
        </h2>

        <Link
          to="/admin/products/create"
          className="
          btn
          btn-primary-custom"
        >
          Add Product
        </Link>

      </div>

      <div className="table-responsive">

        <table
          className="
          table
          table-bordered"
        >

          <thead>

            <tr>

              <th>Name</th>

              <th>Category</th>

              <th>Price</th>

              <th>Actions</th>

            </tr>

          </thead>

          <tbody>

            {data?.map(
              (product) => (

              <tr
                key={product.id}
              >

                <td>
                  {product.name}
                </td>

                <td>
                  {product.category}
                </td>

                <td>
                  ₹{product.price}
                </td>

                <td>

                  <Link
                    className="
                    btn
                    btn-warning
                    btn-sm"
                  >
                    Edit
                  </Link>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );
};

export default Products;