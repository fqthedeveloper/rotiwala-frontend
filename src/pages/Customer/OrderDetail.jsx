import {
  useEffect,
  useState,
  useCallback,
} from "react";

import {
  useParams,
  useNavigate,
} from "react-router-dom";

import Swal from "sweetalert2";

import { motion } from "framer-motion";

import {
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaTruck,
  FaShoppingBag,
  FaBoxOpen,
} from "react-icons/fa";

import {
  getOrderDetail,
  cancelOrder,
} from "../../service/orderService";

import useOrderSocket from "../../hooks/useOrderSocket";

import "./CSS/OrderDetail.css";

export default function OrderDetail() {

  const { id } = useParams();

  const navigate = useNavigate();

  const [loading, setLoading] =
    useState(true);

  const [order, setOrder] =
    useState(null);

  const loadOrder =
    useCallback(async () => {

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

    }, [id]);

  useEffect(() => {

    loadOrder();

  }, [loadOrder]);

  useOrderSocket(
    id,
    (data) => {

      setOrder(prev => ({
        ...prev,
        status: data.status,
        payment_status:
          data.payment_status,
      }));

    }
  );

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
            "Yes Cancel",

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
      <div className="container py-5 text-center">
        Loading...
      </div>
    );

  }

  const statuses = [
    "pending",
    "accepted",
    "preparing",
    "ready",
    "collected",
  ];

  const currentIndex =
    statuses.indexOf(
      order.status
    );

  return (

    <div className="container py-4">

      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="order-card"
      >

        <div className="order-header">

          <h2>
            Order #
            {
              order.order_number
            }
          </h2>

          <StatusBadge
            status={
              order.status
            }
          />

        </div>

        <div className="info-grid">

          <div>
            <strong>
              Amount
            </strong>
            <p>
              ₹
              {
                order.total_amount
              }
            </p>
          </div>

          <div>
            <strong>
              Payment
            </strong>
            <p>
              {
                order.payment_method
              }
            </p>
          </div>

          <div>
            <strong>
              Payment Status
            </strong>
            <p>
              {
                order.payment_status
              }
            </p>
          </div>

          <div>

            {order.pickup_by_other_person == true && (
            <div>
            <strong>Pickup Person</strong>

              <p>Name: {order.pickup_person_name || "N/A"}</p>
              <p>Contact: {order.pickup_person_phone || "N/A"}</p>
            </div>
          )}

          </div>

        </div>

        <hr />

        <h4>
          Items
        </h4>

        {
          order.items.map(
            (item) => (

              <motion.div
                key={item.id}
                className="item-row"
                whileHover={{
                  scale: 1.02,
                }}
              >

                <span>
                  {
                    item.quantity
                  } x {
                    item.item_name
                  }
                </span>

                <span>
                  ₹
                  {
                    item.total_price
                  }
                </span>

              </motion.div>

            )
          )
        }

        <hr />

        <h4>
          Live Tracking
        </h4>

        {
          order.status ===
          "rejected" ? (

            <motion.div
              className="reject-box"
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                repeat:
                  Infinity,
                duration: 2,
              }}
            >

              <FaTimesCircle
                size={70}
              />

              <h3>
                Order Rejected
              </h3>

              <p>
                {
                  order.rejection_reason
                }
              </p>

            </motion.div>

          ) : (

            <div className="timeline">

              <TimelineStep
                active={
                  currentIndex >= 0
                }
                icon={
                  <FaClock />
                }
                title="Pending"
              />

              <TimelineStep
                active={
                  currentIndex >= 1
                }
                icon={
                  <FaCheckCircle />
                }
                title="Accepted"
              />

              <TimelineStep
                active={
                  currentIndex >= 2
                }
                icon={
                  <FaShoppingBag />
                }
                title="Preparing"
              />

              <TimelineStep
                active={
                  currentIndex >= 3
                }
                icon={
                  <FaTruck />
                }
                title="Ready"
              />

              <TimelineStep
                active={
                  currentIndex >= 4
                }
                icon={
                  <FaBoxOpen />
                }
                title="Collected"
              />

            </div>

          )
        }

        {
          [
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

          )
        }

        <button
          className="btn btn-dark mt-4 ms-2"
          onClick={() =>
            navigate(
              "/my-orders"
            )
          }
        >
          Back
        </button>

      </motion.div>

    </div>

  );

}

function TimelineStep({

  active,
  title,
  icon,

}) {

  return (

    <motion.div
      className={
        active
          ? "step active"
          : "step"
      }
      animate={
        active
          ? {
              scale: [
                1,
                1.08,
                1,
              ],
            }
          : {}
      }
      transition={{
        duration: 1.5,
        repeat:
          Infinity,
      }}
    >

      <div>
        {icon}
      </div>

      <span>
        {title}
      </span>

    </motion.div>

  );

}

function StatusBadge({
  status,
}) {

  return (

    <span
      className={`status-badge ${status}`}
    >

      {status}

    </span>

  );

}