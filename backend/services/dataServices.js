const db = require("./db");
const jwt = require("jsonwebtoken");

// All products
const allProducts = () => {
  return db.Product.find().then((result) => {
    if (result) return { statusCode: 200, products: result };
    return { statusCode: 404, message: "Data is empty/server busy" };
  });
};

// View product
const viewProduct = (id) => {
  return db.Product.findOne({ id }).then((result) => {
    if (result) return { statusCode: 200, product: result };
    return { statusCode: 404, message: "Product is unavailable" };
  });
};

// Search product
const searchProducts = (key) => {
  const regex = new RegExp(key, "i");
  return db.Product.find({ name: regex }).then((result) => {
    if (result && result.length > 0) return { statusCode: 200, products: result };
    return { statusCode: 404, message: "No products found" };
  });
};

// Register
const register = (username, email, password) => {
  return db.User.findOne({ email }).then((result) => {
    if (result) return { statusCode: 403, message: "Account Already Exists" };
    const newUser = new db.User({ username, email, password, checkout: [], wishlist: [], cart: [] });
    newUser.save();
    return { statusCode: 200, message: "Registration Successful" };
  });
};

// Login
const login = (email, password) => {
  return db.User.findOne({ email, password }).then((result) => {
    if (result) {
      const token = jwt.sign({ email }, "B68DC6BECCF4A68C3D8D78FE742E2", { algorithm: "HS256" });
      return {
        statusCode: 200,
        message: "Login Successful",
        username: result.username,
        checkout: result.checkout,
        wishlist: result.wishlist,
        cart: result.cart,
        email,
        token,
      };
    }
    return { statusCode: 403, message: "Invalid Account / Password" };
  });
};

// Wishlist
const addToWishlist = (email, id) => {
  let productId = Number(id);
  return db.User.findOne({ email }).then((result) => {
    if (result) {
      result.wishlist.push({ productId });
      result.save();
      return { statusCode: 200, message: `product id ${productId} added to wishlist` };
    }
    return { statusCode: 404, message: "Invalid / server error" };
  });
};

const removeFromWishlist = (email, id) => {
  let productId = Number(id);
  return db.User.updateOne({ email }, { $pull: { wishlist: { productId } } }).then((result) => {
    if (result) return { statusCode: 200, message: `product id ${productId} removed from wishlist` };
    return { statusCode: 404, message: "Invalid / server error" };
  });
};

// Cart
const addToCart = (email, id, count) => {
  let productId = Number(id);
  return db.User.findOne({ email }).then((result) => {
    if (result) {
      result.cart.push({ productId, count });
      result.save();
      return { statusCode: 200, message: `product id ${productId} added to cart` };
    }
    return { statusCode: 404, message: "Invalid / server error" };
  });
};

const removeFromCart = (email, id) => {
  let productId = Number(id);
  return db.User.updateOne({ email }, { $pull: { cart: { productId } } }).then((result) => {
    if (result) return { statusCode: 200, message: `product id ${productId} removed from cart` };
    return { statusCode: 404, message: "Invalid / server error" };
  });
};

const emptyCart = (email) => {
  return db.User.findOneAndUpdate({ email }, { $set: { cart: [] } }).then((result) => {
    if (result) return { statusCode: 200, message: "cart is empty" };
    return { statusCode: 404, message: "Invalid / server error" };
  });
};

const updateCartItemCount = (email, id, count) => {
  let productId = Number(id);
  count = Number(count);
  return db.User.findOneAndUpdate({ email, "cart.productId": productId }, { $set: { "cart.$.count": count } }).then((result) => {
    if (result) return { statusCode: 200, message: `product id ${productId} item count updated` };
    return { statusCode: 404, message: "Invalid / server error" };
  });
};

// Get wishlist / orders
const getWishlist = (email) => {
  return db.User.findOne({ email }).then((result) => {
    if (result) {
      const token = jwt.sign({ email }, "B68DC6BECCF4A68C3D8D78FE742E2", { algorithm: "HS256" });
      return { statusCode: 200, message: `got my items of ${result.username}`, username: result.username, checkout: result.checkout, wishlist: result.wishlist, cart: result.cart, email, token };
    }
    return { statusCode: 403, message: "Invalid email / server issues" };
  });
};

const getMyOrders = (email) => {
  return db.User.findOne({ email }).then((result) => {
    if (result) {
      const token = jwt.sign({ email }, "B68DC6BECCF4A68C3D8D78FE742E2", { algorithm: "HS256" });
      return { statusCode: 200, message: `got orders of ${result.username}`, checkout: result.checkout };
    }
    return { statusCode: 403, message: "Invalid email / server issues" };
  });
};

// Add to checkout
const addToCheckout = (email, orderID, transactionID, dateAndTime, amount, status, products, detailes) => {
  return db.User.findOne({ email }).then((result) => {
    if (result) {
      result.checkout.push({ orderID, transactionID, dateAndTime, amount, status, products, detailes });
      result.save();
      return { statusCode: 200, message: `transaction ${transactionID} added to checkout`, name: detailes.name, mobile: detailes.mobile, orderID, transactionID, dateAndTime, amount };
    }
    return { statusCode: 404, message: "Invalid / server error" };
  });
};

module.exports = {
  allProducts,
  viewProduct,
  searchProducts,
  register,
  login,
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  addToCart,
  removeFromCart,
  updateCartItemCount,
  emptyCart,
  addToCheckout,
  getMyOrders,
};
