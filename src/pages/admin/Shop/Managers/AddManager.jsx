import { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";

import Swal from "sweetalert2";

import { createManager } from "../../../../service/managerService";

const AddManager = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,

      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await createManager(formData);

      Swal.fire({
        icon: "success",

        title: "Success",

        text: "Manager Created Successfully",
      });

      navigate("/admin/managers");
    } catch {
      Swal.fire({
        icon: "error",

        title: "Failed",

        text: "Unable To Create Manager",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Add Manager | Roti Wala";
  }, []);

  return (
    <div className="container-fluid">
      <div className="row justify-content-center">
        <div className="col-lg-7">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white">
              <h4>Add Manager</h4>
            </div>

            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label>First Name</label>

                    <input
                      type="text"
                      className="form-control"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label>Last Name</label>

                    <input
                      type="text"
                      className="form-control"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label>Phone</label>

                    <input
                      type="text"
                      className="form-control"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label>Email</label>

                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-12 mb-3">
                    <label>Password</label>

                    <input
                      type="password"
                      className="form-control"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-12">
                    <button
                      className="btn btn-warning w-100"
                      disabled={loading}
                    >
                      {loading ? "Creating..." : "Create Manager"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddManager;
