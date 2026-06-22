import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useNavigate,
} from "react-router-dom";

import Swal from "sweetalert2";

import {
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaTruck,
  FaShoppingBag,
} from "react-icons/fa";

import {
  getOrderDetail,
  cancelOrder,
} from "../../service/orderService";

export default function OrderDetail() {

  const { id } =
    useParams();

  const navigate =
    useNavigate();

  const [loading, setLoading] =
    useState(true);

  const [order, setOrder] =
    useState(null);

  useEffect(() => {

    loadOrder();

  }, []);

  const loadOrder =
    async () => {

      try {

        const data =
          await getOrderDetail(id);

        setOrder(data);

      } catch {

        Swal.fire(
          "Error",
          "Unable to load order",
          "error"
        );

      } finally {

        setLoading(false);

      }
    };

  const handleCancel =
    async () => {

      const result =
        await Swal.fire({

          title:
            "Cancel Order?",

          icon:
            "warning",

          showCancelButton:
            true,

          confirmButtonText:
            "Cancel Order",

        });

      if (!result.isConfirmed)
        return;

      try {

        await cancelOrder(
          order.id
        );

        Swal.fire(
          "Cancelled",
          "Order cancelled",
          "success"
        );

        loadOrder();

      } catch (error) {

        Swal.fire(
          "Error",
          error?.response?.data
            ?.error ||
            "Unable to cancel",
          "error"
        );
      }
    };

  if (loading) {

    return (
      <div className="container py-5">
        Loading...
      </div>
    );
  }

  return (

    <div className="container py-4">

      <div className="card border-0 shadow">

        <div className="card-body">

          <h2>
            Order Details
          </h2>

          <hr />

          <h5>

            Order #

            {
              order.order_number
            }

          </h5>

          <p>

            Amount :

            ₹
            {
              order.total_amount
            }

          </p>

          <p>

            Payment :

            {
              order.payment_method
            }

          </p>

          <p>

            Payment Status :

            {
              order.payment_status
            }

          </p>

          <p>

            Pickup :

            {
              new Date(
                order.pickup_time
              ).toLocaleString()
            }

          </p>

          <hr />

          <h4>
            Items
          </h4>

          {
            order.items.map(
              (item) => (

                <div
                  key={item.id}
                  className="d-flex justify-content-between border-bottom py-2"
                >

                  <div>

                    {
                      item.quantity
                    }

                    x

                    {
                      item.item_name
                    }

                  </div>

                  <div>

                    ₹
                    {
                      item.total_price
                    }

                  </div>

                </div>

              )
            )
          }

          <hr />

          <h4>
            Order Tracking
          </h4>

          <div className="mt-4">

            <StatusStep
              active={true}
              title="Pending"
              icon={<FaClock />}
            />

            <StatusStep
              active={[
                "accepted",
                "preparing",
                "ready",
                "collected",
              ].includes(
                order.status
              )}
              title="Accepted"
              icon={
                <FaCheckCircle />
              }
            />

            <StatusStep
              active={[
                "preparing",
                "ready",
                "collected",
              ].includes(
                order.status
              )}
              title="Preparing"
              icon={
                <FaShoppingBag />
              }
            />

            <StatusStep
              active={[
                "ready",
                "collected",
              ].includes(
                order.status
              )}
              title="Ready"
              icon={<FaTruck />}
            />

            <StatusStep
              active={
                order.status ===
                "collected"
              }
              title="Collected"
              icon={
                <FaCheckCircle />
              }
            />

          </div>

          {[
            "pending",
            "accepted",
          ].includes(
            order.status
          ) && (

            <button
              className="btn btn-danger mt-4"
              onClick={
                handleCancel
              }
            >
              Cancel Order
            </button>

          )}

          <button
            className="btn btn-secondary mt-4 ms-2"
            onClick={() =>
              navigate(
                "/my-orders"
              )
            }
          >
            Back
          </button>

        </div>

      </div>

    </div>

  );
}

function StatusStep({
  active,
  title,
  icon,
}) {

  return (

    <div
      className={`d-flex align-items-center mb-3 ${
        active
          ? "text-success"
          : "text-secondary"
      }`}
    >

      <div
        className="me-3 fs-4"
      >
        {icon}
      </div>

      <div>
        <strong>
          {title}
        </strong>
      </div>

    </div>

  );
}