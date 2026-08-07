import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { getCategories, deleteCategory } from "../../../service/categoryService";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
    document.title = "Categories | Roti Wala";
  }, []);

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(Array.isArray(data) ? data : data?.results || []);
    } catch (error) {
      console.error(error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Category?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Delete",
    });
    if (!result.isConfirmed) return;

    try {
      await deleteCategory(id);
      Swal.fire({ icon: "success", title: "Deleted Successfully", timer: 1500, showConfirmButton: false });
      loadCategories();
    } catch (error) {
      Swal.fire({ icon: "error", title: "Delete Failed", text: error?.message || "Something went wrong" });
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "300px" }}>
        <div className="spinner-border text-warning" style={{ width: "3rem", height: "3rem" }} />
      </div>
    );
  }

  return (
    <div className="container-fluid py-3 py-md-4">
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-header bg-white border-0 p-3 p-md-4">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
            <div>
              <h4 className="fw-bold mb-1">Categories</h4>
              <small className="text-muted">Manage your global categories</small>
            </div>
            <Link to="/admin/categories/add" className="btn btn-warning fw-semibold px-4 py-2">
              <i className="fas fa-plus me-2"></i>Add Category
            </Link>
          </div>
        </div>

        <div className="card-body p-3 p-md-4">
          {categories.length === 0 ? (
            <div className="text-center py-5">
              <img src="https://cdn-icons-png.flaticon.com/512/4076/4076478.png" alt="" width="120" className="mb-3 opacity-75" />
              <h5>No Categories Found</h5>
              <p className="text-muted">Create your first category to get started.</p>
              <Link to="/admin/categories/add" className="btn btn-warning">Add Category</Link>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="table-responsive d-none d-lg-block">
                <table className="table align-middle table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Name</th>
                      <th>Status</th>
                      <th width="180">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category) => (
                      <tr key={category.id}>
                        <td><span className="fw-bold">{category.name}</span></td>
                        <td>
                          {category.is_active ? (
                            <span className="badge bg-success">Active</span>
                          ) : (
                            <span className="badge bg-danger">Inactive</span>
                          )}
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <Link to={`/admin/categories/edit/${category.id}`} className="btn btn-sm btn-warning">Edit</Link>
                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(category.id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile + Tablet Cards */}
              <div className="d-lg-none">
                <div className="row g-3">
                  {categories.map((category) => (
                    <div className="col-12 col-sm-6" key={category.id}>
                      <div className="card border-0 shadow-sm h-100 rounded-4">
                        <div className="card-body">
                          
                          <h5 className="fw-bold text-center">{category.name}</h5>
                          <div className="text-center mb-3">
                            {category.is_active === true ? (
                              <span className="badge bg-success">Active</span>
                            ) : (
                              <span className="badge bg-danger">Inactive</span>
                            )}
                          </div>
                          <div className="d-grid gap-2">
                            <Link to={`/admin/categories/edit/${category.id}`} className="btn btn-warning">Edit</Link>
                            <button className="btn btn-danger" onClick={() => handleDelete(category.id)}>Delete</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Categories;