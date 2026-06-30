import { FaUsers, FaUtensils, FaShoppingBag } from "react-icons/fa";
import "./CSS/MobileBottomNav.css";

export default function MobileBottomNav({ active, setActive }) {
  const tabs = [
    { key: "customers", icon: <FaUsers />, label: "Customers" },
    { key: "menu", icon: <FaUtensils />, label: "Menu" },
    { key: "cart", icon: <FaShoppingBag />, label: "Cart" },
  ];

  return (
    <nav className="mobile-nav">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={active === tab.key ? "active" : ""}
          onClick={() => setActive(tab.key)}
        >
          <span className="mn-icon">{tab.icon}</span>
          <span className="mn-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}