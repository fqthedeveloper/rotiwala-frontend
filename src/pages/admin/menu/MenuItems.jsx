// frontend/src/pages/manager/MenuItems.jsx

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { getMenuItems, deleteMenuItem } from "../../../service/menuItemService";
import "./CSS/MenuItems.css"; // optional

const MenuItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Menu Items | Roti Wala";
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const data = await getMenuItems();
      setItems(data);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to load menu items", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Item?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Delete",
    });
    if (!result.isConfirmed) return;

    try {
      await deleteMenuItem(id);
      Swal.fire({
        icon: "success",
        title: "Deleted",
        timer: 1500,
        showConfirmButton: false,
      });
      loadItems();
    } catch (error) {
      Swal.fire("Error", "Failed to delete item", "error");
    }
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="card shadow-sm border-0 rounded-4">
        <div className="card-header bg-white d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h5 className="mb-0 fw-bold">Menu Items</h5>
          <Link to="/manager/menu-items/add" className="btn btn-warning">
            <i className="fas fa-plus me-2"></i>Add Item
          </Link>
        </div>

        <div className="card-body p-3 p-md-4">
          {items.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">No menu items found. Add your first item!</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Category</th>
                    <th>Available</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            width="50"
                            height="50"
                            className="rounded"
                            style={{ objectFit: "cover" }}
                          />
                        ) : (
                          <span className="text-muted">No image</span>
                        )}
                      </td>
                      <td>
                        <strong>{item.name}</strong>
                        &nbsp; &nbsp;
                        {item.description && (
                         
                          <small className="text-muted">{item.description.substring(0, 40)}</small>
                        )}
                      </td>
                      <td>₹{item.base_price}</td>
                      <td>{item.category_name || "—"}</td>
                      <td>
                        {item.is_available ? (
                          <span className="badge bg-success">Available</span>
                        ) : (
                          <span className="badge bg-danger">Out of Stock</span>
                        )}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Link
                            to={`/manager/menu-items/edit/${item.id}`}
                            className="btn btn-sm btn-warning"
                          >
                            Edit
                          </Link>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(item.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuItems;