const router = require("express").Router();
const { authenticate, optionalAuth, authorize } = require("../middleware/auth");
const { validate, validateIds, authLimiter } = require("../middleware/common");
const s = require("../validators/schemas");
const auth = require("../controllers/auth.controller");
const rest = require("../controllers/restaurant.controller");
const cart = require("../controllers/cart.controller");
const order = require("../controllers/order.controller");
const admin = require("../controllers/admin.controller");

const customer = [authenticate, authorize("customer")];
const owners = [authenticate, authorize("restaurant_admin", "super_admin")];
const superAdmin = [authenticate, authorize("super_admin")];

// Auth
router.post("/auth/register", authLimiter, validate(s.register), auth.register);
router.post("/auth/login", authLimiter, validate(s.login), auth.login);
router.post("/auth/logout", authenticate, auth.logout);

// Users
router.get("/users/me", authenticate, auth.me);
router.patch("/users/me", authenticate, validate(s.updateMe), auth.updateMe);
router.patch("/users/change-password", authenticate, validate(s.changePassword), auth.changePassword);

// Restaurants
router.get("/restaurants", optionalAuth, rest.list);
router.post("/restaurants", owners, validate(s.createRestaurant), rest.create);
router.get("/restaurants/:restaurantId", validateIds("restaurantId"), optionalAuth, rest.get);
router.patch("/restaurants/:restaurantId", validateIds("restaurantId"), owners, validate(s.updateRestaurant), rest.update);
router.delete("/restaurants/:restaurantId", validateIds("restaurantId"), owners, rest.remove);

// Categories
router.get("/restaurants/:restaurantId/categories", validateIds("restaurantId"), optionalAuth, rest.listCategories);
router.post("/restaurants/:restaurantId/categories", validateIds("restaurantId"), owners, validate(s.createCategory), rest.createCategory);
router.get("/categories/:categoryId", validateIds("categoryId"), optionalAuth, rest.getCategory);
router.patch("/categories/:categoryId", validateIds("categoryId"), owners, validate(s.updateCategory), rest.updateCategory);
router.delete("/categories/:categoryId", validateIds("categoryId"), owners, rest.deleteCategory);

// Menu
router.get("/restaurants/:restaurantId/menu", validateIds("restaurantId"), optionalAuth, rest.listMenu);
router.post("/restaurants/:restaurantId/menu", validateIds("restaurantId"), owners, validate(s.createMenuItem), rest.createMenuItem);
router.get("/menu/:menuItemId", validateIds("menuItemId"), optionalAuth, rest.getMenuItem);
router.patch("/menu/:menuItemId/availability", validateIds("menuItemId"), owners, validate(s.availability), rest.setAvailability);
router.patch("/menu/:menuItemId", validateIds("menuItemId"), owners, validate(s.updateMenuItem), rest.updateMenuItem);
router.delete("/menu/:menuItemId", validateIds("menuItemId"), owners, rest.deleteMenuItem);

// Cart (sirf customer)
router.get("/cart", customer, cart.get);
router.post("/cart/items", customer, validate(s.cartAdd), cart.add);
router.patch("/cart/items/:menuItemId", validateIds("menuItemId"), customer, validate(s.cartUpdate), cart.update);
router.delete("/cart/items/:menuItemId", validateIds("menuItemId"), customer, cart.remove);
router.delete("/cart", customer, cart.clear);

// Orders
router.post("/orders", customer, validate(s.placeOrder), order.create);
router.get("/orders/my-orders", customer, order.mine);
router.get("/orders/:orderId", validateIds("orderId"), authenticate, order.get);
router.patch("/orders/:orderId/cancel", validateIds("orderId"), customer, order.cancel);
router.patch("/orders/:orderId/status", validateIds("orderId"), owners, validate(s.orderStatus), order.setStatus);
router.get("/restaurants/:restaurantId/orders", validateIds("restaurantId"), owners, rest.listOrders);

// Super admin
router.get("/admin/dashboard", superAdmin, admin.dashboard);
router.get("/admin/users", superAdmin, admin.users);
router.patch("/admin/users/:userId/block", validateIds("userId"), superAdmin, validate(s.blockUser), admin.blockUser);
router.get("/admin/restaurants", superAdmin, admin.restaurants);
router.patch("/admin/restaurants/:restaurantId/status", validateIds("restaurantId"), superAdmin, validate(s.restaurantStatus), admin.setRestaurantStatus);
router.get("/admin/orders", superAdmin, admin.orders);

module.exports = router;
