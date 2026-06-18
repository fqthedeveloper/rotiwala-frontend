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
  getManager,
  updateManager,
} from "../../../../service/managerService";

import {
  getShops,
} from "../../../../service/shopService";

const EditManager = () => {

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

      first_name:"",
      last_name:"",
      phone:"",
      email:"",
      password:"",
      shop_id:"",

    });

  useEffect(() => {

    loadData();

  }, []);

  const loadData =
    async () => {

      const manager =
        await getManager(id);

      const shopsData =
        await getShops();

      setShops(
        shopsData
      );

      setFormData({

        first_name:
          manager.first_name,

        last_name:
          manager.last_name,

        phone:
          manager.phone,

        email:
          manager.email,

        password:"",

        shop_id:"",
      });
    };

  const handleChange =
    (e) => {

      setFormData({

        ...formData,

        [e.target.name]:
          e.target.value,

      });
    };

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      try {

        setLoading(true);

        await updateManager(
          id,
          formData
        );

        Swal.fire({

          icon:"success",

          title:"Updated",

          text:
          "Manager Updated Successfully",

        });

        navigate(
          "/admin/managers"
        );

      } catch {

        Swal.fire({

          icon:"error",

          title:"Error",

          text:
          "Update Failed",

        });

      } finally {

        setLoading(false);
      }
    };

  return (

    <div className="container-fluid">

      <div className="row justify-content-center">

        <div className="col-lg-8">

          <div className="card shadow-sm border-0">

            <div className="card-header bg-white">

              <h4>
                Edit Manager
              </h4>

            </div>

            <div className="card-body">

              <form
                onSubmit={
                  handleSubmit
                }
              >

                <div className="row">

                  <div className="col-md-6 mb-3">

                    <label>
                      First Name
                    </label>

                    <input
                      className="form-control"
                      name="first_name"
                      value={
                        formData.first_name
                      }
                      onChange={
                        handleChange
                      }
                    />

                  </div>

                  <div className="col-md-6 mb-3">

                    <label>
                      Last Name
                    </label>

                    <input
                      className="form-control"
                      name="last_name"
                      value={
                        formData.last_name
                      }
                      onChange={
                        handleChange
                      }
                    />

                  </div>

                  <div className="col-md-6 mb-3">

                    <label>
                      Phone
                    </label>

                    <input
                      className="form-control"
                      name="phone"
                      value={
                        formData.phone
                      }
                      onChange={
                        handleChange
                      }
                    />

                  </div>

                  <div className="col-md-6 mb-3">

                    <label>
                      Email
                    </label>

                    <input
                      className="form-control"
                      name="email"
                      value={
                        formData.email
                      }
                      onChange={
                        handleChange
                      }
                    />

                  </div>

                  <div className="col-12 mb-3">

                    <label>
                      New Password
                    </label>

                    <input
                      type="password"
                      className="form-control"
                      name="password"
                      value={
                        formData.password
                      }
                      onChange={
                        handleChange
                      }
                    />

                  </div>

                  <div className="col-12 mb-3">

                    <label>
                      Assign Shop
                    </label>

                    <select
                      className="form-select"
                      name="shop_id"
                      value={
                        formData.shop_id
                      }
                      onChange={
                        handleChange
                      }
                    >

                      <option value="">
                        Select Shop
                      </option>

                      {
                        shops.map(
                          shop => (

                          <option
                            key={
                              shop.id
                            }
                            value={
                              shop.id
                            }
                          >
                            {
                              shop.name
                            }
                          </option>

                        ))
                      }

                    </select>

                  </div>

                  <div className="col-12">

                    <button
                      className="btn btn-warning w-100"
                    >

                      {
                        loading
                        ?
                        "Updating..."
                        :
                        "Update Manager"
                      }

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

export default EditManager;