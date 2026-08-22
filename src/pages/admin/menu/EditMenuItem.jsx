// frontend/src/pages/manager/EditMenuItem.jsx

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { getCategories } from "../../../service/categoryService";
import { getMenuItemById, updateMenuItem } from "../../../service/menuItemService";
import { getShops } from "../../../service/shopService";

const EditMenuItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [shops, setShops] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    shop: "",
    category: "",
    name: "",
    description: "",
    base_price: "",
    image: null,
    is_available: true,
  });

  useEffect(() => {
    document.title = "Edit Menu Item | Roti Wala";
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [item, cats] = await Promise.all([
        getMenuItemById(id),
        getCategories(),
      ]);
      setCategories(cats);

      // Get user role and shops if super_admin
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserRole(user.role);
        if (user.role === "super_admin") {
          const shopsData = await getShops();
          setShops(shopsData);
        }
      }

      setFormData({
        shop: item.shop || "",
        category: item.category || "",
        name: item.name || "",
        description: item.description || "",
        base_price: item.base_price || "",
        image: null,
        is_available: item.is_available !== undefined ? item.is_available : true,
      });
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to load item data", "error");
      navigate("/manager/menu-items");
    }
  };

  const handleChange = (e) => {
    const { name, value, checked, files, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : type === "file" ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null && formData[key] !== "") {
        data.append(key, formData[key]);
      }
    });

    try {
      setLoading(true);
      await updateMenuItem(id, data);
      Swal.fire({
        icon: "success",
        title: "Menu Item Updated",
      });
      navigate("/manager/menu-items");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: error.response?.data?.detail || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-white border-0 p-4">
              <h4 className="fw-bold mb-0">Edit Menu Item</h4>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                {/* Shop dropdown – ONLY for super_admin */}
                {userRole === "super_admin" && (
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Shop</label>
                    <select
                      name="shop"
                      className="form-select"
                      required
                      value={formData.shop}
                      onChange={handleChange}
                    >
                      <option value="">Select Shop</option>
                      {shops.map((shop) => (
                        <option key={shop.id} value={shop.id}>
                          {shop.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label fw-semibold">Category</label>
                  <select
                    name="category"
                    className="form-select"
                    required
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Item Name</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    required
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Description</label>
                  <textarea
                    rows="3"
                    name="description"
                    className="form-control"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="base_price"
                    className="form-control"
                    required
                    value={formData.base_price}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">New Image (optional)</label>
                  <input
                    type="file"
                    name="image"
                    className="form-control"
                    accept="image/*"
                    onChange={handleChange}
                  />
                  <small className="text-muted">Leave empty to keep current image</small>
                </div>

                <div className="form-check mb-4">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    name="is_available"
                    checked={formData.is_available}
                    onChange={handleChange}
                    id="isAvailable"
                  />
                  <label className="form-check-label" htmlFor="isAvailable">
                    Available for sale
                  </label>
                </div>

                <button
                  type="submit"
                  className="btn btn-warning w-100 py-2 fw-bold"
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update Menu Item"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditMenuItem;