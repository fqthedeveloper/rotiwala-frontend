import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import Swal from "sweetalert2";

import {
  getCategoryById,
  updateCategory,
} from "../../../service/categoryService";

import {
  getShops,
} from "../../../service/shopService";

const EditCategory = () => {

  const { id } =
    useParams();

  const navigate =
    useNavigate();

  const [shops,setShops] =
    useState([]);

  const [loading,setLoading] =
    useState(false);

  const [formData,setFormData] =
    useState({
      shop:"",
      name:"",
      image:null,
      is_active:true,
    });

  useEffect(() => {

    loadData();

  }, []);

  const loadData =
    async () => {

      try {

        const category =
          await getCategoryById(id);

        const shopData =
          await getShops();

        setShops(shopData);

        setFormData({
          shop:
            category.shop,
          name:
            category.name,
          image:null,
          is_active:
            category.is_active,
        });

      } catch (error) {

        console.log(error);

      }
    };

  const handleChange =
    (e) => {

      const {
        name,
        value,
        checked,
        files,
        type,
      } = e.target;

      setFormData({

        ...formData,

        [name]:

          type === "checkbox"
          ? checked
          : type === "file"
          ? files[0]
          : value,

      });
    };

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      const data =
        new FormData();

      Object.keys(
        formData
      ).forEach((key)=>{

        if(
          formData[key] !== null
        ){
          data.append(
            key,
            formData[key]
          );
        }

      });

      try {

        setLoading(true);

        await updateCategory(
          id,
          data
        );

        Swal.fire({
          icon:"success",
          title:
            "Category Updated",
        });

        navigate(
          "/admin/categories"
        );

      } catch {

        Swal.fire({
          icon:"error",
          title:"Failed",
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

              <h4>
                Edit Category
              </h4>

            </div>

            <div className="card-body">

              <form
                onSubmit={
                  handleSubmit
                }
              >

                <div className="mb-3">

                  <label>
                    Shop
                  </label>

                  <select
                    className="form-select"
                    name="shop"
                    value={
                      formData.shop
                    }
                    onChange={
                      handleChange
                    }
                  >

                    {
                      shops.map(
                        (shop)=>(

                        <option
                          key={shop.id}
                          value={shop.id}
                        >
                          {shop.name}
                        </option>

                      ))
                    }

                  </select>

                </div>

                <div className="mb-3">

                  <label>
                    Category Name
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={
                      formData.name
                    }
                    onChange={
                      handleChange
                    }
                  />

                </div>

                <div className="mb-3">

                  <label>
                    Image
                  </label>

                  <input
                    type="file"
                    className="form-control"
                    name="image"
                    onChange={
                      handleChange
                    }
                  />

                </div>

                <div className="form-check mb-4">

                  <input
                    type="checkbox"
                    className="form-check-input"
                    name="is_active"
                    checked={
                      formData.is_active
                    }
                    onChange={
                      handleChange
                    }
                  />

                  <label className="form-check-label">
                    Active
                  </label>

                </div>

                <button
                  className="btn btn-warning w-100"
                  disabled={
                    loading
                  }
                >
                  {
                    loading
                    ? "Updating..."
                    : "Update Category"
                  }
                </button>

              </form>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default EditCategory;