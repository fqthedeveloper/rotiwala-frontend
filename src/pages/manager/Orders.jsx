import { useEffect, useMemo, useRef, useState } from "react";

import Swal from "sweetalert2";

import {
  FaCheck,
  FaTimes,
  FaFire,
  FaBoxOpen,
  FaMoneyBill,
  FaCheckCircle,
  FaSearch,
  FaCalendarAlt,
  FaShoppingBag,
  FaClock,
  FaRupeeSign,
  FaUsers,
  FaBell,
  FaPhone,
  FaUser,
  FaStickyNote,
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

import "./CSS/Orders.css";

export default function Orders() {

  const [orders, setOrders] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [selectedDate, setSelectedDate] =
    useState(
      new Date()
        .toISOString()
        .split("T")[0]
    );

  const [socketConnected, setSocketConnected] =
    useState(false);

  const socketRef =
    useRef(null);

  useEffect(() => {

    document.title =
      "Manager Orders";

    loadOrders();

    connectSocket();

    const interval =
      setInterval(() => {

        loadOrders();

      }, 30000);

    return () => {

      clearInterval(
        interval
      );

      if (
        socketRef.current
      ) {
        socketRef.current.close();
      }
    };

  }, []);

  useEffect(() => {

    loadOrders();

  }, [selectedDate]);

  const connectSocket =
    () => {

      try {

        const protocol =
          window.location.protocol ===
          "https:"
            ? "wss"
            : "ws";

        socketRef.current =
          new WebSocket(
            `${protocol}://${window.location.host}/ws/manager/orders/`
          );

        socketRef.current.onopen =
          () => {

            setSocketConnected(
              true
            );

            console.log(
              "Manager WebSocket Connected"
            );
          };

        socketRef.current.onclose =
          () => {

            setSocketConnected(
              false
            );

            setTimeout(
              () => {

                connectSocket();

              },
              5000
            );
          };

        socketRef.current.onerror =
          () => {

            setSocketConnected(
              false
            );
          };

        socketRef.current.onmessage =
          (event) => {

            const data =
              JSON.parse(
                event.data
              );

            if (
              data.type ===
              "new_order"
            ) {

              Swal.fire({

                toast: true,

                position:
                  "top-end",

                icon:
                  "success",

                title:
                  "🔥 New Order Received",

                text:
                  `Order #${data.order_number}`,

                timer:
                  5000,

                showConfirmButton:
                  false,

              });

              loadOrders();
            }

            if (
              data.type ===
              "order_update"
            ) {

              loadOrders();
            }
          };

      } catch (
        error
      ) {

        console.log(
          error
        );
      }
    };

  const loadOrders =
    async () => {

      try {

        const data =
          await getManagerOrders(
            selectedDate
          );

        setOrders(data);

      } catch {

        Swal.fire(
          "Error",
          "Unable to load orders",
          "error"
        );

      } finally {

        setLoading(false);
      }
    };

  const handleAction =
    async (
      action,
      id
    ) => {

      try {

        switch (
          action
        ) {

          case "accept":

            await acceptOrder(
              id
            );

            break;

          case "preparing":

            await preparingOrder(
              id
            );

            break;

          case "ready":

            await readyOrder(
              id
            );

            break;

          case "payment":

            await paymentReceived(
              id
            );

            break;

          case "collected":

            await collectedOrder(
              id
            );

            break;

          default:
            break;
        }

        loadOrders();

      } catch (
        error
      ) {

        Swal.fire(
          "Error",
          error?.response?.data
            ?.error ||
            "Failed",
          "error"
        );
      }
    };

  const handleReject =
    async (id) => {

      const result =
        await Swal.fire({

          title:
            "Reject Order",

          input:
            "text",

          inputLabel:
            "Reason",

          inputPlaceholder:
            "Enter reason",

          showCancelButton:
            true,

        });

      if (
        !result.isConfirmed
      ) {
        return;
      }

      try {

        await rejectOrder(
          id,
          result.value
        );

        loadOrders();

      } catch {

        Swal.fire(
          "Error",
          "Unable to reject order",
          "error"
        );
      }
    };

      const filteredOrders =
    useMemo(() => {

      return orders.filter(
        (order) => {

          const keyword =
            search.toLowerCase();

          return (

            order.order_number
              ?.toLowerCase()
              .includes(
                keyword
              ) ||

            order.customer_name
              ?.toLowerCase()
              .includes(
                keyword
              ) ||

            order.customer_phone
              ?.toLowerCase()
              .includes(
                keyword
              ) ||

            order.status
              ?.toLowerCase()
              .includes(
                keyword
              )
          );
        }
      );

    }, [
      orders,
      search,
    ]);

  const stats =
    useMemo(() => {

      return {

        total:
          orders.length,

        pending:
          orders.filter(
            (o) =>
              o.status ===
              "pending"
          ).length,

        accepted:
          orders.filter(
            (o) =>
              o.status ===
              "accepted"
          ).length,

        preparing:
          orders.filter(
            (o) =>
              o.status ===
              "preparing"
          ).length,

        ready:
          orders.filter(
            (o) =>
              o.status ===
              "ready"
          ).length,

        collected:
          orders.filter(
            (o) =>
              o.status ===
              "collected"
          ).length,

        revenue:
          orders.reduce(
            (
              total,
              order
            ) =>
              total +
              Number(
                order.total_amount
              ),
            0
          ),

      };

    }, [orders]);

  if (loading) {

    return (

      <div className="orders-loading">

        <div className="loading-spinner"></div>

        <h5 className="mt-4">
          Loading Orders...
        </h5>

      </div>

    );
  }

  return (
    <>

    <div className="orders-page">

      <div className="container-fluid">

        <div className="orders-topbar">

          <div>

            <h2 className="orders-title">

              Orders Management

            </h2>

            <p className="orders-subtitle">

              Real-Time Manager Dashboard

            </p>

          </div>

          <div
            className={`socket-status ${
              socketConnected
                ? "online"
                : "offline"
            }`}
          >

            <FaBell />

            {
              socketConnected
                ? "LIVE"
                : "OFFLINE"
            }

          </div>

        </div>

        <div className="row g-3 mb-4">

          <div className="col-lg-2 col-md-4 col-6">

            <div className="stat-card">

              <FaShoppingBag />

              <h3>
                {stats.total}
              </h3>

              <span>
                Orders
              </span>

            </div>

          </div>

          <div className="col-lg-2 col-md-4 col-6">

            <div className="stat-card pending">

              <FaClock />

              <h3>
                {stats.pending}
              </h3>

              <span>
                Pending
              </span>

            </div>

          </div>

          <div className="col-lg-2 col-md-4 col-6">

            <div className="stat-card accepted">

              <FaCheck />

              <h3>
                {stats.accepted}
              </h3>

              <span>
                Accepted
              </span>

            </div>

          </div>

          <div className="col-lg-2 col-md-4 col-6">

            <div className="stat-card preparing">

              <FaFire />

              <h3>
                {stats.preparing}
              </h3>

              <span>
                Preparing
              </span>

            </div>

          </div>

          <div className="col-lg-2 col-md-4 col-6">

            <div className="stat-card ready">

              <FaBoxOpen />

              <h3>
                {stats.ready}
              </h3>

              <span>
                Ready
              </span>

            </div>

          </div>

          <div className="col-lg-2 col-md-4 col-6">

            <div className="stat-card revenue">

              <FaRupeeSign />

              <h3>
                ₹{stats.revenue}
              </h3>

              <span>
                Revenue
              </span>

            </div>

          </div>

        </div>

        <div className="filters-card">

          <div className="row g-3">

            <div className="col-lg-8">

              <div className="search-box">

                <FaSearch />

                <input
                  type="text"
                  placeholder="Search Order, Customer, Phone..."
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                />

              </div>

            </div>

            <div className="col-lg-4">

              <div className="date-box">

                <FaCalendarAlt />

                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) =>
                    setSelectedDate(
                      e.target.value
                    )
                  }
                />

              </div>

            </div>

          </div>

        </div>

        <div className="row g-4 mt-1">
                  {filteredOrders.length === 0 && (

            <div className="col-12">

              <div className="empty-orders">

                <h4>
                  No Orders Found
                </h4>

                <p>
                  No orders available for selected filters.
                </p>

              </div>

            </div>

          )}

          {filteredOrders.map(
            (order) => (

              <div
                className="col-xl-6"
                key={order.id}
              >

                <div className="order-card">

                  <div className="order-header">

                    <div>

                      <h5>

                        #
                        {
                          order.order_number
                        }

                      </h5>

                      <small>

                        {
                          order.ordered_at
                            ? new Date(
                                order.ordered_at
                              ).toLocaleString()
                            : "-"
                        }

                      </small>

                    </div>

                    <span
                      className={`status-badge ${order.status}`}
                    >

                      {
                        order.status
                      }

                    </span>

                  </div>

                  <div className="customer-box">

                    <h6>

                      <FaUser />

                      Customer

                    </h6>

                    <div className="detail-row">

                      <span>
                        Name
                      </span>

                      <strong>

                        {
                          order.customer_name ||
                          "Customer"
                        }

                      </strong>

                    </div>

                    <div className="detail-row">

                      <span>
                        Phone
                      </span>

                      <strong>

                        {
                          order.customer_phone ||
                          "-"
                        }

                      </strong>

                    </div>

                    <div className="detail-row">

                      <span>
                        Amount
                      </span>

                      <strong>

                        ₹
                        {
                          order.total_amount
                        }

                      </strong>

                    </div>

                    <div className="detail-row">

                      <span>
                        Payment
                      </span>

                      <strong>

                        {
                          order.payment_method
                        }

                      </strong>

                    </div>

                    <div className="detail-row">

                      <span>
                        Payment Status
                      </span>

                      <strong>

                        {
                          order.payment_status
                        }

                      </strong>

                    </div>

                  </div>

                  {order.pickup_by_other_person && (

                    <div className="pickup-box">

                      <h6>

                        <FaPhone />

                        Pickup Person

                      </h6>

                      <div className="detail-row">

                        <span>
                          Name
                        </span>

                        <strong>

                          {
                            order.pickup_person_name
                          }

                        </strong>

                      </div>

                      <div className="detail-row">

                        <span>
                          Phone
                        </span>

                        <strong>

                          {
                            order.pickup_person_phone
                          }

                        </strong>

                      </div>

                    </div>

                  )}

                  <div className="items-box">

                    <h6>

                      <FaShoppingBag />

                      Items

                    </h6>

                    {order.items?.map(
                      (item) => (

                        <div
                          key={item.id}
                          className="item-row"
                        >

                          <span>

                            {
                              item.quantity
                            }x{" "}

                            {
                              item.item_name
                            }

                          </span>

                          <strong>

                            ₹
                            {
                              item.total_price
                            }

                          </strong>

                        </div>

                      )
                    )}

                  </div>

                  {order.notes && (

                    <div className="notes-box">

                      <h6>

                        <FaStickyNote />

                        Notes

                      </h6>

                      <p>

                        {
                          order.notes
                        }

                      </p>

                    </div>

                  )}

                  <div className="actions-box">

                    {order.status ===
                      "pending" && (

                      <>

                        <button
                          className="btn btn-success action-btn"
                          onClick={() =>
                            handleAction(
                              "accept",
                              order.id
                            )
                          }
                        >

                          <FaCheck />

                          Accept

                        </button>

                        <button
                          className="btn btn-danger action-btn"
                          onClick={() =>
                            handleReject(
                              order.id
                            )
                          }
                        >

                          <FaTimes />

                          Reject

                        </button>

                      </>

                    )}

                    {order.status ===
                      "accepted" && (

                      <button
                        className="btn btn-primary action-btn"
                        onClick={() =>
                          handleAction(
                            "preparing",
                            order.id
                          )
                        }
                      >

                        <FaFire />

                        Preparing

                      </button>

                    )}

                    {order.status ===
                      "preparing" && (

                      <button
                        className="btn btn-success action-btn"
                        onClick={() =>
                          handleAction(
                            "ready",
                            order.id
                          )
                        }
                      >

                        <FaBoxOpen />

                        Ready

                      </button>

                    )}

                    {order.status ===
                      "ready" &&
                      order.payment_status !==
                        "paid" && (

                      <button
                        className="btn btn-warning action-btn"
                        onClick={() =>
                          handleAction(
                            "payment",
                            order.id
                          )
                        }
                      >

                        <FaMoneyBill />

                        Payment Received

                      </button>

                    )}

                    {order.status ===
                      "ready" &&
                      order.payment_status ===
                        "paid" && (

                      <button
                        className="btn btn-dark action-btn"
                        onClick={() =>
                          handleAction(
                            "collected",
                            order.id
                          )
                        }
                      >

                        <FaCheckCircle />

                        Collected

                      </button>

                    )}

                  </div>

                </div>

              </div>

            )
          )}

        </div>

      </div>

    </div>
    </>

  );

}