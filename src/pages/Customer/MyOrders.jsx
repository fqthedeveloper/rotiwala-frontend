import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import { getMyOrders } from "../../service/orderService";

import Swal from "sweetalert2";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await getMyOrders();

      setOrders(data);
    } catch {
      Swal.fire("Error", "Unable to load orders", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container py-5 text-center">Loading...</div>;
  }

  return (
    <div className="container py-4">
      <h2 className="mb-4">My Orders</h2>

      {orders.length === 0 ? (
        <div className="alert alert-warning">No orders found</div>
      ) : (
        orders.map((order) => (
          <div key={order.id} className="card shadow-sm border-0 mb-3">
            <div className="card-body">
              <div className="row">
                <div className="col-md-8">
                  <h5>#{order.order_number}</h5>

                  <p className="mb-1">Amount: ₹{order.total_amount}</p>

                  <p className="mb-1">
                    Payment:
                    {order.payment_method}
                  </p>

                  <p className="mb-0">
                    Pickup:
                    {order.pickup_time}
                  </p>
                </div>

                <div className="col-md-4 text-md-end">
                  <span
                    className={`badge px-3 py-2 ${
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

                  <br />

                  <Link
                    to={`/my-orders/${order.id}`}
                    className="btn btn-warning btn-sm mt-3"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
