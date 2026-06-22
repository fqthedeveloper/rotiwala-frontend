import {
  useEffect,
  useState,
} from "react";

import {
  getShops,
} from "../../../service/shopService";


import { Link } from "react-router-dom";
import Swal from "sweetalert2";

const Shops = () => {

  const [shops, setShops] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadShops();
    document.title = "Shops | Roti Wala";
  }, []);

  const loadShops = async () => {

    try {

      setLoading(true);

      console.log(
        "Access:",
        localStorage.getItem(
          "access"
        )
      );

      const data =
        await getShops();

      console.log(
        "Shop Data:",
        data
      );

      setShops(data);

    } catch (err) {

      console.error(err);

      setError(
        err?.response?.data?.detail ||
        "Failed to load shops"
      );

    } finally {

      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <div
          className="spinner-border text-warning"
        />
      </div>
    );
  }

  return (
    <div className="card shadow-sm border-0">

      <div className="card-header bg-white d-flex justify-content-between align-items-center">

        <h5 className="mb-0">
          Shops
        </h5>

       <Link to="add-shop">
          <button
            className="btn btn-warning"
          >
            Add Shop
          </button>
        </Link>

      </div>

      <div className="card-body">

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        <div className="table-responsive">

          <table className="table table-hover align-middle">

            <thead>

              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Status</th>
                <th width="120">
                  Action
                </th>
              </tr>

            </thead>

            <tbody>

              {shops.length > 0 ? (

                shops.map(
                  (shop) => (

                      <tr key={shop.id}>

                        <td>{shop.id}</td>

                        <td>{shop.name}</td>

                        <td>{shop.phone}</td>

                        <td>{shop.email}</td>

                        <td>

                          {
                            shop.is_active
                            ? (
                              <span className="badge bg-success">
                                Active
                              </span>
                            )
                            : (
        <span className="badge bg-danger">
          Inactive
        </span>
      )
    }

  </td>

  <td>

    <Link
      to={`/admin/shops/edit/${shop.id}`}
      className="btn btn-sm btn-primary"
    >
      <i className="bi bi-pencil-square"></i>
    </Link>

  </td>

</tr>
                  )
                )

              ) : (

                <tr>

                  <td
                    colSpan="5"
                    className="text-center"
                  >
                    No Shops Found
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
};

export default Shops;