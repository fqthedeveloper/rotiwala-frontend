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
  getCategories,
} from "../../../service/categoryService";

import {
  getMenuItemById,
  updateMenuItem,
} from "../../../service/menuItemService";

const EditMenuItem = () => {

  const { id } =
    useParams();

  const navigate =
    useNavigate();

  const [categories,setCategories] =
    useState([]);

  const [loading,setLoading] =
    useState(false);

  const [formData,setFormData] =
    useState({
      category:"",
      name:"",
      description:"",
      base_price:"",
      image:null,
      is_available:true,
      is_popular:false,
      display_order:0,
    });

  useEffect(()=>{

    loadData();

  },[]);

  const loadData =
    async ()=>{

      const item =
        await getMenuItemById(id);

      const cats =
        await getCategories();

      setCategories(cats);

      setFormData({

        category:
          item.category,

        name:
          item.name,

        description:
          item.description,

        base_price:
          item.base_price,

        image:null,

        is_available:
          item.is_available,

        is_popular:
          item.is_popular,

        display_order:
          item.display_order,

      });
    };

  const handleChange =
    (e)=>{

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
    async (e)=>{

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

        await updateMenuItem(
          id,
          data
        );

        Swal.fire({

          icon:"success",

          title:
            "Menu Item Updated",

        });

        navigate(
          "/admin/menu-items"
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
                Edit Menu Item
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
                    Category
                  </label>

                  <select
                    className="form-select"
                    name="category"
                    value={
                      formData.category
                    }
                    onChange={
                      handleChange
                    }
                  >

                    {
                      categories.map(
                        (cat)=>(
                          <option
                            key={cat.id}
                            value={cat.id}
                          >
                            {cat.name}
                          </option>
                        )
                      )
                    }

                  </select>

                </div>

                <div className="mb-3">

                  <label>
                    Item Name
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
                    Description
                  </label>

                  <textarea
                    rows="4"
                    className="form-control"
                    name="description"
                    value={
                      formData.description
                    }
                    onChange={
                      handleChange
                    }
                  />

                </div>

                <div className="mb-3">

                  <label>
                    Price
                  </label>

                  <input
                    type="number"
                    className="form-control"
                    name="base_price"
                    value={
                      formData.base_price
                    }
                    onChange={
                      handleChange
                    }
                  />

                </div>

                <div className="mb-3">

                  <label>
                    New Image
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

                <div className="form-check mb-2">

                  <input
                    type="checkbox"
                    className="form-check-input"
                    name="is_available"
                    checked={
                      formData.is_available
                    }
                    onChange={
                      handleChange
                    }
                  />

                  <label className="form-check-label">
                    Available
                  </label>

                </div>

                <div className="form-check mb-4">

                  <input
                    type="checkbox"
                    className="form-check-input"
                    name="is_popular"
                    checked={
                      formData.is_popular
                    }
                    onChange={
                      handleChange
                    }
                  />

                  <label className="form-check-label">
                    Popular Item
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
                    : "Update Menu Item"
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

export default EditMenuItem;