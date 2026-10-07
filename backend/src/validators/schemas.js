const Joi = require("joi");

const phone = Joi.string().pattern(/^\+?[0-9\s-]{10,15}$/).messages({ "string.pattern.base": "phone must be a valid phone number" });
const time = Joi.string().pattern(/^([01]\d|2[0-3]):[0-5]\d$/).messages({ "string.pattern.base": "time must look like 09:30" });
const text = (max = 600) => Joi.string().trim().allow("").max(max);
const url = Joi.string().trim().allow("").max(500);
const id = Joi.string().hex().length(24);

exports.register = Joi.object({
  name: Joi.string().trim().min(2).max(80).required(),
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().min(8).max(72).required(),
  phone: phone.required(),
});
exports.login = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().required(),
});
exports.updateMe = Joi.object({ name: Joi.string().trim().min(2).max(80), phone }).min(1);
exports.changePassword = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).max(72).required(),
});

const restaurantFields = {
  name: Joi.string().trim().min(2).max(100),
  description: text(),
  phone: phone.allow(""),
  email: Joi.string().trim().email().allow(""),
  address: Joi.string().trim().min(3).max(200),
  city: Joi.string().trim().min(2).max(60),
  image: url,
  openingTime: time,
  closingTime: time,
  isOpen: Joi.boolean(),
};
exports.createRestaurant = Joi.object({
  ...restaurantFields,
  name: restaurantFields.name.required(),
  address: restaurantFields.address.required(),
  city: restaurantFields.city.required(),
});
exports.updateRestaurant = Joi.object(restaurantFields).min(1);

exports.createCategory = Joi.object({
  name: Joi.string().trim().min(2).max(60).required(),
  description: text(300),
  image: url,
  sortOrder: Joi.number().integer().min(0).max(999),
  isActive: Joi.boolean(),
});
exports.updateCategory = Joi.object({
  name: Joi.string().trim().min(2).max(60),
  description: text(300),
  image: url,
  sortOrder: Joi.number().integer().min(0).max(999),
  isActive: Joi.boolean(),
}).min(1);

const menuFields = {
  category: id,
  name: Joi.string().trim().min(2).max(100),
  description: text(),
  price: Joi.number().min(1).max(1000000),
  discountPrice: Joi.number().min(0).max(1000000),
  image: url,
  ingredients: Joi.array().items(Joi.string().trim().max(60)).max(30),
  isAvailable: Joi.boolean(),
  preparationTime: Joi.number().integer().min(1).max(240),
};
exports.createMenuItem = Joi.object({
  ...menuFields,
  category: id.required(),
  name: menuFields.name.required(),
  price: menuFields.price.required(),
});
exports.updateMenuItem = Joi.object(menuFields).min(1);
exports.availability = Joi.object({ isAvailable: Joi.boolean().required() });

exports.cartAdd = Joi.object({ menuItemId: id.required(), quantity: Joi.number().integer().min(1).max(50).default(1) });
exports.cartUpdate = Joi.object({ quantity: Joi.number().integer().min(1).max(50).required() });

exports.placeOrder = Joi.object({
  deliveryAddress: Joi.object({
    address: Joi.string().trim().min(5).max(200).required(),
    city: Joi.string().trim().min(2).max(60).required(),
    postalCode: Joi.string().trim().allow("").max(12),
  }).required(),
  phone: phone.required(),
  paymentMethod: Joi.string().valid("cash_on_delivery").default("cash_on_delivery"),
  notes: text(300),
});
exports.orderStatus = Joi.object({
  orderStatus: Joi.string().valid("confirmed", "preparing", "ready", "out_for_delivery", "delivered", "cancelled", "rejected").required(),
});
exports.blockUser = Joi.object({ isBlocked: Joi.boolean().required() });
exports.restaurantStatus = Joi.object({ isActive: Joi.boolean().required() });
