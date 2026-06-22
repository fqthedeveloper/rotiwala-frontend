import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import Swal from "sweetalert2";

import { getManagers, assignManager } from "../../../../service/managerService";

import { getShops } from "../../../../service/shopService";

const Managers = () => {
  const [managers, setManagers] = useState([]);

  const [shops, setShops] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    document.title = "Managers | Roti Wala";
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const managerData = await getManagers();

      const shopData = await getShops();

      setManagers(
        managerData.map((manager) => ({
          ...manager,

          selected_shop: "",
        })),
      );

      setShops(shopData);
    } catch (error) {
      console.log(error);

      Swal.fire({
        icon: "error",

        title: "Error",

        text: "Failed to load managers",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShopChange = (managerId, shopId) => {
    setManagers(
      managers.map((manager) =>
        manager.id === managerId
          ? {
              ...manager,
              selected_shop: shopId,
            }
          : manager,
      ),
    );
  };

  const handleAssign = async (managerId, shopId) => {
    if (!shopId) {
      Swal.fire({
        icon: "warning",

        title: "Select Shop",

        text: "Please select a shop",
      });

      return;
    }

    try {
      await assignManager({
        manager_id: managerId,

        shop_id: shopId,
      });

      Swal.fire({
        icon: "success",

        title: "Assigned",

        text: "Manager assigned successfully",

        timer: 2000,

        showConfirmButton: false,
      });

      loadData();
    } catch {
      Swal.fire({
        icon: "error",

        title: "Failed",

        text: "Unable to assign manager",
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-warning" />
      </div>
    );
  }

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-header bg-white d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h5 className="mb-0">Managers</h5>

        <Link to="/admin/managers/add" className="btn btn-warning">
          Add Manager
        </Link>
      </div>

      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>Name</th>

                <th>Phone</th>

                <th>Email</th>

                <th>Current Shop</th>

                <th
                  style={{
                    minWidth: "250px",
                  }}
                >
                  Assign Shop
                </th>

                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {managers.length > 0 ? (
                managers.map((manager) => (
                  <tr key={manager.id}>
                    <td>
                      {manager.first_name} {manager.last_name}
                    </td>

                    <td>{manager.phone}</td>

                    <td>{manager.email}</td>

                    <td>
                      {manager.shop_name ? (
                        <span className="badge bg-success">
                          {manager.shop_name}
                        </span>
                      ) : (
                        <span className="badge bg-danger">Not Assigned</span>
                      )}
                    </td>

                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={manager.selected_shop}
                        onChange={(e) =>
                          handleShopChange(manager.id, e.target.value)
                        }
                      >
                        <option value="">Select Shop</option>

                        {shops.map((shop) => (
                          <option key={shop.id} value={shop.id}>
                            {shop.name}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td>
                      <div className="d-flex gap-2 flex-wrap">
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() =>
                            handleAssign(manager.id, manager.selected_shop)
                          }
                        >
                          Assign
                        </button>

                        <Link
                          to={`/admin/managers/edit/${manager.id}`}
                          className="btn btn-warning btn-sm"
                        >
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    No Managers Found
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

export default Managers;
