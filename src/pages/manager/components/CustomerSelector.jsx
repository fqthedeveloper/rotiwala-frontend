import { FaUserPlus } from "react-icons/fa";
import "./CSS/CustomerSelector.css";

export default function CustomerSelector({
  carts,
  selectedCartId,
  setSelectedCartId,
  onCreateNew,
  loading,
}) {
  return (
    <div className="customer-selector">
      <select
        value={selectedCartId || ""}
        onChange={(e) => setSelectedCartId(Number(e.target.value))}
        disabled={loading}
      >
        {carts.map((cart) => (
          <option key={cart.id} value={cart.id}>
            {cart.customer_name || "Unnamed"} – {cart.customer_phone || "No phone"}
          </option>
        ))}
      </select>
      <button onClick={onCreateNew} disabled={loading}>
        <FaUserPlus /> New
      </button>
    </div>
  );
}