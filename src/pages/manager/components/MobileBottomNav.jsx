import "./CSS/MobileBottomNav.css";

export default function MobileBottomNav({
    active,
    setActive,
}) {
    return (
        <nav className="mobile-nav">

            <button
                className={active === "customers" ? "active" : ""}
                onClick={() => setActive("customers")}
            >
                👥
                <span>Customers</span>
            </button>

            <button
                className={active === "menu" ? "active" : ""}
                onClick={() => setActive("menu")}
            >
                🍽️
                <span>Menu</span>
            </button>

            <button
                className={active === "cart" ? "active" : ""}
                onClick={() => setActive("cart")}
            >
                🛒
                <span>Cart</span>
            </button>

        </nav>
    );
}