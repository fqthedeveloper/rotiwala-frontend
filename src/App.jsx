// src/App.js
import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useLoading } from "./context/LoadingContext";

// Global Styles
import "./index.css";
import "./styles/responsive.css";
import "./styles/forms.css";
import "./styles/pages.css";
import "./styles/theme.css";


// Layouts
import MainLayout from "./components/layout/MainLayout";
import AdminLayout from "./components/admin/AdminLayout";

// Auth Routes
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";
import AuthRoute from "./routes/AuthRoute";

// Public Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Menu from "./pages/Menu";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const getPageTitle = (pathname) => {
  const titles = {
    "/": "Home - Roti Wala",
    "/menu": "Menu - Roti Wala",
    "/about": "About Us - Roti Wala",
    "/contact": "Contact Us - Roti Wala",
    "/login": "Login - Roti Wala",
    "/register": "Register - Roti Wala",
    "/privacy": "Privacy Policy - Roti Wala",
    "/terms": "Terms & Conditions - Roti Wala",
    "/refund": "Refund Policy - Roti Wala",
    "/cart": "Cart - Roti Wala",
    "/checkout": "Checkout - Roti Wala",
    "/my-orders": "My Orders - Roti Wala",
    "/admin/shops": "Shops - Roti Wala",
    "/admin/shops/add-shop": "Add Shop - Roti Wala",
    "/admin/managers": "Managers - Roti Wala",
    "/admin/managers/add": "Add Manager - Roti Wala",
    "/admin/categories": "Categories - Roti Wala",
    "/admin/categories/add": "Add Category - Roti Wala",
    "/admin/menu-items": "Menu Items - Roti Wala",
    "/admin/menu-items/add": "Add Menu Item - Roti Wala",
    "/admin/products/create": "Add Product - Roti Wala",
    "/admin/dashboard": "Dashboard - Roti Wala",
    "/admin/orders": "Orders - Roti Wala",
    "/admin/products": "Products - Roti Wala",
    "/admin/customer": "Customer Management - Roti Wala",
    "/admin/coupons": "Coupons - Roti Wala",
    "/admin/coupons/add": "Add Coupon - Roti Wala",
    "/admin/discounts": "Discounts - Roti Wala",
    "/admin/discounts/add": "Add Discount - Roti Wala",
    "/admin/discounts/usage": "Discount Usage - Roti Wala",
    "/admin/expenses": "Expenses - Roti Wala",
    "/admin/expenses/add": "Add Expense - Roti Wala",
    "/admin/maintenance/add": "Add Maintenance - Roti Wala",
    "/admin/reports": "Reports - Roti Wala",
    "/manager/dashboard": "Manager Dashboard - Roti Wala",
    "/manager/orders": "Manager Orders - Roti Wala",
    "/manager/walkin": "Walk-in Orders - Roti Wala",
    "/manager/discounts/usage": "Discount Usage - Roti Wala",
    "/manager/customers": "Customer Management - Roti Wala",
    "/manager/expenses": "Manager Expenses - Roti Wala",
    "/manager/expenses/add": "Add Expense - Roti Wala",
    "/manager/reports": "Reports - Roti Wala",
    "/profile": "Profile - Roti Wala",
    "/forgot-password": "Forgot Password - Roti Wala",
    "/change-password": "Change Password - Roti Wala",
  };

  if (titles[pathname]) return titles[pathname];
  if (pathname.startsWith("/my-orders/")) return "Order Detail - Roti Wala";
  if (pathname.startsWith("/admin/shops/edit")) return "Edit Shop - Roti Wala";
  if (pathname.startsWith("/admin/managers/edit")) return "Edit Manager - Roti Wala";
  if (pathname.startsWith("/admin/categories/edit")) return "Edit Category - Roti Wala";
  if (pathname.startsWith("/admin/menu-items/edit")) return "Edit Menu Item - Roti Wala";
  if (pathname.startsWith("/admin/coupons/edit")) return "Edit Coupon - Roti Wala";
  if (pathname.startsWith("/admin/discounts/edit")) return "Edit Discount - Roti Wala";
  if (pathname.startsWith("/admin/expenses/edit")) return "Edit Expense - Roti Wala";
  if (pathname.startsWith("/manager/expenses/edit")) return "Edit Expense - Roti Wala";
  if (pathname.startsWith("/admin/shops")) return "Shops - Roti Wala";
  if (pathname.startsWith("/admin/managers")) return "Managers - Roti Wala";
  if (pathname.startsWith("/admin/categories")) return "Categories - Roti Wala";
  if (pathname.startsWith("/admin/menu-items")) return "Menu Items - Roti Wala";
  if (pathname.startsWith("/admin/coupons")) return "Coupons - Roti Wala";
  if (pathname.startsWith("/admin/discounts")) return "Discounts - Roti Wala";
  if (pathname.startsWith("/admin/expenses")) return "Expenses - Roti Wala";
  if (pathname.startsWith("/manager/expenses")) return "Manager Expenses - Roti Wala";
  if (pathname.startsWith("/manager")) return "Manager - Roti Wala";
  return "Roti Wala";
};

// Admin Pages
import Dashboard from "./pages/admin/Dashboard";
import Orders from "./pages/admin/Orders";
import Products from "./pages/admin/Products";
import Customer from "./pages/admin/CustomerManagement";
import AddProduct from "./pages/admin/AddProduct";
import Shops from "./pages/admin/Shop/Shops";
import AddShop from "./pages/admin/Shop/AddShop";
import EditShop from "./pages/admin/Shop/EditShop";
import Managers from "./pages/admin/Shop/Managers/Managers";
import AddManager from "./pages/admin/Shop/Managers/AddManager";
import EditManager from "./pages/admin/Shop/Managers/EditManager";
import AddCategory from "./pages/admin/menu/AddCategory";
import Categories from "./pages/admin/menu/Categories";
import MenuItems from "./pages/admin/menu/MenuItems";
import AddMenuItem from "./pages/admin/menu/AddMenuItem";
import EditCategory from "./pages/admin/menu/EditCategory";
import EditMenuItem from "./pages/admin/menu/EditMenuItem";
import Coupons from "./pages/admin/Coupons/Coupons";
import CouponForm from "./pages/admin/Coupons/CouponForm";
import Discounts from "./pages/admin/Discount/Discounts";
import DiscountForm from "./pages/admin/Discount/DiscountForm";
import UsageAnalytics from "./pages/admin/Usage-Discount/UsageAnalytics";
import AdminExpenses from "./pages/admin/Expenses/AdminExpenses";
import AddExpense from "./pages/admin/Expenses/AddExpense";
import EditExpense from "./pages/admin/Expenses/EditExpense";
import AddMaintenance from "./pages/admin/Expenses/AddMaintenance";
import Report from './pages/Report';  // add import


// Customer Pages
import Cart from "./pages/Customer/Cart";
import Checkout from "./pages/Customer/Checkout";
import MyOrders from "./pages/Customer/MyOrders";
import OrderDetail from "./pages/Customer/OrderDetail";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Refund from "./pages/Refund";
import Profile from './pages/Customer/Profile';
import ForgotPassword from './pages/ForgotPassword';
import ChangePassword from './Components/Profile/ChangePassword';

// Manager Pages
import ManagerLayout from "./components/Manager/ManagerLayout";
import ManagerDashboard from "./pages/manager/Dashboard";
import ManagerOrders from "./pages/manager/Orders";
import WalkInOrder from "./pages/manager/WalkInOrder";
import CustomerManagement from "./pages/manager/CustomerManagement";
import ManagerExpenses from "./pages/manager/Expenses/ManagerExpenses";

function App() {
  const location = useLocation();
  const { showLoading, hideLoading } = useLoading();

  // Show loader only if route change takes a little time; hide quickly if the new page is already ready.
  useEffect(() => {
    document.title = getPageTitle(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    const showTimer = setTimeout(() => {
      showLoading('Loading page...', 'warm', 'md');
    }, 80);

    const autoHideTimer = setTimeout(() => {
      hideLoading();
    }, 250);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(autoHideTimer);
      hideLoading();
    };
  }, [location.pathname, showLoading, hideLoading]);

  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/refund" element={<Refund />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route
          path="/login"
          element={
            <AuthRoute>
              <Login />
            </AuthRoute>
          }
        />
        <Route
          path="/register"
          element={
            <AuthRoute>
              <Register />
            </AuthRoute>
          }
        />

        <Route path="*" element={<NotFound />} />

        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-orders"
          element={
            <ProtectedRoute>
              <MyOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-orders/:id"
          element={
            <ProtectedRoute>
              <OrderDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
                <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
                <ChangePassword />
            </ProtectedRoute>
          }
        />
      </Route>


      {/* ADMIN ROUTES */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <RoleRoute role="super_admin">
              <AdminLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route path="shops" element={<Shops />} />
        <Route path="shops/add-shop" element={<AddShop />} />
        <Route path="shops/edit/:id" element={<EditShop />} />
        <Route path="managers" element={<Managers />} />
        <Route path="managers/add" element={<AddManager />} />
        <Route path="managers/edit/:id" element={<EditManager />} />
        <Route path="categories" element={<Categories />} />
        <Route path="categories/add" element={<AddCategory />} />
        <Route path="menu-items" element={<MenuItems />} />
        <Route path="menu-items/add" element={<AddMenuItem />} />
        <Route path="categories/edit/:id" element={<EditCategory />} />
        <Route path="menu-items/edit/:id" element={<EditMenuItem />} />
        <Route path="products/create" element={<AddProduct />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="orders" element={<Orders />} />
        <Route path="products" element={<Products />} />
        <Route path="customer" element={<Customer />} />
        <Route path="coupons" element={<Coupons />} />
        <Route path="coupons/add" element={<CouponForm />} />
        <Route path="coupons/edit/:id" element={<CouponForm />} />
        <Route path="discounts" element={<Discounts />} />
        <Route path="discounts/add" element={<DiscountForm />} />
        <Route path="discounts/edit/:id" element={<DiscountForm />} />
        <Route path="discounts/usage" element={<UsageAnalytics />} />
        <Route path="expenses" element={<AdminExpenses />} />
        <Route path="expenses/add" element={<AddExpense />} />
        <Route path="expenses/edit/:id" element={<EditExpense />} />
        <Route path="maintenance/add" element={<AddMaintenance />} />
        <Route path="reports" element={<Report />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* MANAGER ROUTES */}
      <Route
        path="/manager"
        element={
          <ProtectedRoute>
            <RoleRoute role="manager">
              <ManagerLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<ManagerDashboard />} />
        <Route path="orders" element={<ManagerOrders />} />
        <Route path="walkin" element={<WalkInOrder />} />
        <Route path="discounts/usage" element={<UsageAnalytics />} />
        <Route path="customers" element={<CustomerManagement />} />
        <Route path="expenses" element={<ManagerExpenses />} />
        <Route path="expenses/add" element={<AddExpense />} />
        <Route path="expenses/edit/:id" element={<EditExpense />} />
        <Route path="expenses/maintenance/add" element={<AddMaintenance />} />
        <Route path="reports" element={<Report />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;