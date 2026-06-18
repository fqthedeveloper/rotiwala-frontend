import {
  useEffect,
  useState,
} from "react";

import Swal from "sweetalert2";

import {
  Link,
} from "react-router-dom";

import {
  getMenuItems,
  deleteMenuItem,
} from "../../../service/menuItemService";

const MenuItems = () => {

  const [items,setItems] =
    useState([]);

  const [loading,setLoading] =
    useState(true);

  useEffect(()=>{

    loadItems();

  },[]);

  const loadItems =
    async ()=>{

      try{

        const data =
          await getMenuItems();

        setItems(data);

      }catch(error){

        console.log(error);

      }finally{

        setLoading(false);
      }
    };

  const handleDelete =
    async (id)=>{

      const result =
        await Swal.fire({

          title:
            "Delete Item?",

          icon:
            "warning",

          showCancelButton:
            true,

        });

      if(!result.isConfirmed)
        return;

      try{

        await deleteMenuItem(id);

        Swal.fire({

          icon:
            "success",

          title:
            "Deleted",

          timer:1500,

          showConfirmButton:false,

        });

        loadItems();

      }catch{

        Swal.fire({

          icon:"error",

          title:"Failed",

        });
      }
    };

  if(loading){

    return (

      <div className="text-center p-5">

        <div className="spinner-border text-warning"/>

      </div>

    );
  }

  return (

    <div className="card shadow-sm border-0">

      <div className="card-header bg-white d-flex justify-content-between align-items-center">

        <h5 className="mb-0">
          Menu Items
        </h5>

        <Link
          to="/admin/menu-items/add"
          className="btn btn-warning"
        >
          Add Item
        </Link>

      </div>

      <div className="card-body">

        <div className="table-responsive">

          <table className="table table-hover">

            <thead>

              <tr>

                <th>
                  Image
                </th>

                <th>
                  Name
                </th>

                <th>
                  Price
                </th>

                <th>
                  Popular
                </th>

                <th>
                  Available
                </th>

                <th>
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {
                items.map(
                  (item)=>(
                    <tr
                      key={item.id}
                    >

                      <td>

                        {
                          item.image_url &&
                          (
                            <img
                              src={
                                item.image_url
                              }
                              alt=""
                              width="60"
                              height="60"
                              className="rounded"
                            />
                          )
                        }

                      </td>

                      <td>
                        {item.name}
                      </td>

                      <td>
                        ₹{item.price}
                      </td>

                      <td>

                        {
                          item.is_popular

                          ?

                          <span className="badge bg-warning">
                            Popular
                          </span>

                          :

                          "-"
                        }

                      </td>

                      <td>

                        {
                          item.is_available

                          ?

                          <span className="badge bg-success">
                            Available
                          </span>

                          :

                          <span className="badge bg-danger">
                            Out
                          </span>
                        }

                      </td>

                      <td>

                        <div className="d-flex gap-2">

                          <Link
                            to={`/admin/menu-items/edit/${item.id}`}
                            className="btn btn-sm btn-warning"
                          >
                            Edit
                          </Link>

                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() =>
                              handleDelete(
                                item.id
                              )
                            }
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>
                  )
                )
              }

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
};

export default MenuItems;