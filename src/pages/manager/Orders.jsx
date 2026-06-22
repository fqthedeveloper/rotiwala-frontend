import { useEffect, useState } from "react";

import Swal from "sweetalert2";

import {
  FaCheck,
  FaTimes,
  FaFire,
  FaBoxOpen,
  FaMoneyBill,
  FaCheckCircle,
} from "react-icons/fa";

import {
  getManagerOrders,
  acceptOrder,
  rejectOrder,
  preparingOrder,
  readyOrder,
  paymentReceived,
  collectedOrder,
} from "../../service/orderService";

export default function Orders() {
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Manager Orders";

    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await getManagerOrders();

      setOrders(data);
    } catch {
      Swal.fire("Error", "Unable to load orders", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action, id) => {
    try {
      switch (action) {
        case "accept":
          await acceptOrder(id);

          break;

        case "preparing":
          await preparingOrder(id);

          break;

        case "ready":
          await readyOrder(id);

          break;

        case "payment":
          await paymentReceived(id);

          break;

        case "collected":
          await collectedOrder(id);

          break;

        default:
          break;
      }

      loadOrders();
    } catch (error) {
      Swal.fire("Error", error?.response?.data?.error || "Failed", "error");
    }
  };

  const handleReject = async (id) => {
    const result = await Swal.fire({
      title: "Reject Order",

      input: "text",

      inputLabel: "Reason",

      showCancelButton: true,
    });

    if (!result.value) return;

    await rejectOrder(id, result.value);

    loadOrders();
  };

  if (loading) {
    return <div className="container py-5 text-center">Loading...</div>;
  }

  return (
    <div className="container-fluid py-4">
      <h2 className="mb-4">Orders Management</h2>

      <div className="row g-4">
        {orders.map((order) => (
          <div className="col-lg-6" key={order.id}>
            <div className="card shadow border-0 h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <h5>#{order.order_number}</h5>

                  <span
                    className={`badge ${
                      order.status === "pending"
                        ? "bg-warning text-dark"
                        : order.status === "accepted"
                          ? "bg-info"
                          : order.status === "preparing"
                            ? "bg-primary"
                            : order.status === "ready"
                              ? "bg-success"
                              : order.status === "collected"
                                ? "bg-dark"
                                : "bg-danger"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                <hr />

                <p>
                  Customer :
                  {order.customer_name || order.customer_phone || "Customer"}
                </p>

                <p>Amount : ₹{order.total_amount}</p>

                <p>Payment :{order.payment_method}</p>

                <p>
                  Payment Status :<strong>{order.payment_status}</strong>
                </p>

                <div className="mt-3">
                  {order.items?.map((item) => (
                    <div
                      key={item.id}
                      className="d-flex justify-content-between"
                    >
                      <span>
                        {item.quantity}x{item.item_name}
                      </span>

                      <span>₹{item.total_price}</span>
                    </div>
                  ))}
                </div>

                <hr />

                <div className="d-flex flex-wrap gap-2">
                  {order.status === "pending" && (
                    <>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleAction("accept", order.id)}
                      >
                        <FaCheck /> Accept
                      </button>

                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleReject(order.id)}
                      >
                        <FaTimes /> Reject
                      </button>
                    </>
                  )}

                  {order.status === "accepted" && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleAction("preparing", order.id)}
                    >
                      <FaFire /> Preparing
                    </button>
                  )}

                  {order.status === "preparing" && (
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleAction("ready", order.id)}
                    >
                      <FaBoxOpen /> Ready
                    </button>
                  )}

                  {order.status === "ready" &&
                    order.payment_status !== "paid" && (
                      <button
                        className="btn btn-warning btn-sm"
                        onClick={() => handleAction("payment", order.id)}
                      >
                        <FaMoneyBill /> Payment Received
                      </button>
                    )}

                  {order.status === "ready" &&
                    order.payment_status === "paid" && (
                      <button
                        className="btn btn-dark btn-sm"
                        onClick={() => handleAction("collected", order.id)}
                      >
                        <FaCheckCircle /> Collected
                      </button>
                    )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
