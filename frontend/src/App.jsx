import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./layouts/Layout";
import DashLayout from "./layouts/DashLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Restaurants from "./pages/Restaurants";
import RestaurantDetails from "./pages/RestaurantDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import NotFound from "./pages/NotFound";
import Orders from "./pages/customer/Orders";
import OrderDetails from "./pages/customer/OrderDetails";
import Profile from "./pages/customer/Profile";
import RaDashboard from "./pages/restaurantAdmin/Dashboard";
import RestaurantForm from "./pages/restaurantAdmin/RestaurantForm";
import Categories from "./pages/restaurantAdmin/Categories";
import Menu from "./pages/restaurantAdmin/Menu";
import RestaurantOrders from "./pages/restaurantAdmin/RestaurantOrders";
import AdminDashboard from "./pages/admin/Dashboard";
import Users from "./pages/admin/Users";
import AdminRestaurants from "./pages/admin/Restaurants";
import AdminOrders from "./pages/admin/Orders";

const customerLinks = [
  { to: "/customer/orders", text: "My orders" },
  { to: "/customer/profile", text: "Profile" },
  { to: "/cart", text: "Cart" },
];
const raLinks = [
  { to: "/restaurant-admin", text: "Dashboard", end: true },
  { to: "/restaurant-admin/restaurant", text: "Restaurant" },
  { to: "/restaurant-admin/categories", text: "Categories" },
  { to: "/restaurant-admin/menu", text: "Menu" },
  { to: "/restaurant-admin/orders", text: "Orders" },
];
const adminLinks = [
  { to: "/admin", text: "Overview", end: true },
  { to: "/admin/users", text: "Users" },
  { to: "/admin/restaurants", text: "Restaurants" },
  { to: "/admin/orders", text: "Orders" },
];

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="restaurants" element={<Restaurants />} />
        <Route path="restaurants/:restaurantId" element={<RestaurantDetails />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />

        <Route element={<ProtectedRoute roles={["customer"]} />}>
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="order-success/:orderId" element={<OrderSuccess />} />
          <Route path="customer" element={<DashLayout title="My account" links={customerLinks} />}>
            <Route index element={<Navigate to="orders" replace />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:orderId" element={<OrderDetails />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={["restaurant_admin", "super_admin"]} />}>
          <Route path="restaurant-admin" element={<DashLayout title="Restaurant" links={raLinks} />}>
            <Route index element={<RaDashboard />} />
            <Route path="restaurant" element={<RestaurantForm />} />
            <Route path="categories" element={<Categories />} />
            <Route path="menu" element={<Menu />} />
            <Route path="orders" element={<RestaurantOrders />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={["super_admin"]} />}>
          <Route path="admin" element={<DashLayout title="Super admin" links={adminLinks} />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="restaurants" element={<AdminRestaurants />} />
            <Route path="orders" element={<AdminOrders />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
