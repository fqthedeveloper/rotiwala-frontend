import {
  FaShoppingBag,
  FaUsers,
  FaRupeeSign,
  FaUtensils,
} from "react-icons/fa";
import {useEffect} from "react";

const Dashboard = () => {

  useEffect(() => {
    document.title = "Dashboard | Roti Wala";
  }, []);

  const cards = [

    {
      title: "Total Orders",
      value: "1,250",
      icon: <FaShoppingBag />,
      color: "#3b82f6",
    },

    {
      title: "Customers",
      value: "845",
      icon: <FaUsers />,
      color: "#10b981",
    },

    {
      title: "Revenue",
      value: "₹95,000",
      icon: <FaRupeeSign />,
      color: "#f59e0b",
    },

    {
      title: "Products",
      value: "120",
      icon: <FaUtensils />,
      color: "#ef4444",
    },

  ];

  return (

    <div className="dashboard-page">

      <div className="dashboard-header">

        <div>

          <h2>
            Welcome Back 👋
          </h2>

          <p>
            Here's what's happening today
          </p>

        </div>

      </div>

      <div className="dashboard-cards">

        {cards.map((card,index)=>(

          <div
            key={index}
            className="dashboard-card"
          >

            <div
              className="card-icon"
              style={{
                background:card.color
              }}
            >

              {card.icon}

            </div>

            <div>

              <span>

                {card.title}

              </span>

              <h3>

                {card.value}

              </h3>

            </div>

          </div>

        ))}

      </div>

      <div className="dashboard-row">

        <div className="dashboard-box">

          <h4>
            Recent Orders
          </h4>

          <table className="table">

            <tbody>

              <tr>
                <td>#1001</td>
                <td>Paneer Roll</td>
                <td>₹120</td>
              </tr>

              <tr>
                <td>#1002</td>
                <td>Veg Thali</td>
                <td>₹250</td>
              </tr>

              <tr>
                <td>#1003</td>
                <td>Roti Combo</td>
                <td>₹180</td>
              </tr>

            </tbody>

          </table>

        </div>

        <div className="dashboard-box">

          <h4>
            Today's Summary
          </h4>

          <div className="summary-item">
            Orders Completed: 87
          </div>

          <div className="summary-item">
            Pending Orders: 15
          </div>

          <div className="summary-item">
            Revenue: ₹12,500
          </div>

          <div className="summary-item">
            Active Customers: 48
          </div>

        </div>

      </div>

    </div>

  );

};

export default Dashboard;