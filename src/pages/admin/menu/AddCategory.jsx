import { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";

import Swal from "sweetalert2";

import { createCategory } from "../../../service/categoryService";

import { getShops } from "../../../service/shopService";

const AddCategory = () => {
  const navigate = useNavigate();

  const [shops, setShops] = useState([]);

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    shop: "",
    name: "",
    image: null,
    is_active: true,
  });

  useEffect(() => {
    loadShops();
    document.title = "Add Category | Roti Wala";
  }, []);

  const loadShops = async () => {
    const data = await getShops();

    setShops(data);
  };

  const handleChange = (e) => {
    const { name, value, checked, type, files } = e.target;

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

      await createCategory(data);

      Swal.fire({
        icon: "success",

        title: "Category Created",
      });

      navigate("/admin/categories");
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
              <h4>Add Category</h4>
            </div>

            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label>Shop</label>

                  <select
                    name="shop"
                    className="form-select"
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Shop</option>

                    {shops.map((shop) => (
                      <option key={shop.id} value={shop.id}>
                        {shop.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label>Category Name</label>

                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    onChange={handleChange}
                    required
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

                <div className="form-check mb-4">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                  />

                  <label className="form-check-label">Active</label>
                </div>

                <button className="btn btn-warning w-100" disabled={loading}>
                  {loading ? "Saving..." : "Create Category"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCategory;
