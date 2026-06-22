import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import Swal from "sweetalert2";

import { getCategories } from "../../../service/categoryService";

import { createMenuItem } from "../../../service/menuItemService";

const AddMenuItem = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    category: "",
    name: "",
    description: "",
    base_price: "",
    image: null,
    is_available: true,
    is_popular: false,
    display_order: 0,
  });

  useEffect(() => {
    loadCategories();
    document.title = "Add Menu Item | Roti Wala";
  }, []);

  const loadCategories = async () => {
    const data = await getCategories();

    setCategories(data);
  };

  const handleChange = (e) => {
    const { name, value, checked, files, type } = e.target;

    setFormData({
      ...formData,

      [name]:
        type === "checkbox" ? checked : type === "file" ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();

    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });

    try {
      setLoading(true);

      await createMenuItem(data);

      Swal.fire({
        icon: "success",

        title: "Menu Item Created",
      });

      navigate("/admin/menu-items");
    } catch {
      Swal.fire({
        icon: "error",

        title: "Failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <h4>Add Menu Item</h4>
            </div>

            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label>Category</label>

                  <select
                    name="category"
                    className="form-select"
                    required
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
                  <label>Item Name</label>

                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    required
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-3">
                  <label>Description</label>

                  <textarea
                    rows="3"
                    name="description"
                    className="form-control"
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-3">
                  <label>Price</label>

                  <input
                    type="number"
                    step="0.01"
                    name="base_price"
                    className="form-control"
                    required
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-3">
                  <label>Image</label>

                  <input
                    type="file"
                    name="image"
                    className="form-control"
                    onChange={handleChange}
                  />
                </div>

                <div className="form-check mb-2">
                  <input
                    type="checkbox"
                    name="is_available"
                    className="form-check-input"
                    checked={formData.is_available}
                    onChange={handleChange}
                  />

                  <label className="form-check-label">Available</label>
                </div>

                <div className="form-check mb-4">
                  <input
                    type="checkbox"
                    name="is_popular"
                    className="form-check-input"
                    checked={formData.is_popular}
                    onChange={handleChange}
                  />

                  <label className="form-check-label">Popular Item</label>
                </div>

                <button className="btn btn-warning w-100" disabled={loading}>
                  {loading ? "Saving..." : "Create Menu Item"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMenuItem;
