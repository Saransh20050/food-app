// services/dataServices.js
const db = require("./db");
const jwt = require("jsonwebtoken");

// all products
const allProducts = () => {
  return db.Product.find().then((result) => {
    if (result) {
      return {
        statusCode: 200,
        products: result,
      };
    } else {
      return {
        statusCode: 404,
        message: "Data is empty/server busy",
      };
    }
  });
};

// view product (coerce id to number)
const viewProduct = (id) => {
  const productId = isNaN(Number(id)) ? id : Number(id);
  return db.Product.findOne({ id: productId }).then((result) => {
    if (result) {
      return {
        statusCode: 200,
        product: result,
      };
    } else {
      return {
        statusCode: 404,
        message: "Product is unavailable",
      };
    }
  });
};

// search products by key (name, category, description)
const searchProducts = (key) => {
  const regex = new RegExp(key, "i"); // case-insensitive
  return db.Product.find({
    $or: [{ name: regex }, { category: regex }, { description: regex }],
  }).then((result) => {
    if (result && result.length > 0) {
      return { statusCode: 200, products: result };
    } else {
      return { statusCode: 404, message: "No products found" };
    }
  });
};

// register
const register = (username, email, password) => {
  console.log("Inside register function in dataservice");
  return db.User.findOne({ email }).then((result) => {
    if (result) {
      return {
        statusCode: 403,
        message: "Account Already Exists",
      };
    } else {
      const newUser = new db.User({
        username,
        email,
        password,
        checkout: [],
        wishlist: [],
        cart: [],
      });
      return newUser.save().then(() => {
        return {
          statusCode: 200,
          message: "Registration Successful",
        };
      });
    }
  });
};

// login
const login = (email, password) => {
  console.log("Inside login function in dataservice");
  return db.User.findOne({
    email,
    password,
  }).then((result) => {
    if (result) {
      const token = jwt.sign({ email }, "B68DC6BECCF4A68C3D8D78FE742E2", {
        algorithm: "HS256",
      });
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
    } else {
      return {
        statusCode: 403,
        message: "Invalid Account / Password",
      };
    }
  });
};

// addToWishlist
const addToWishlist = (email, id) => {
  console.log("Inside wishlist function in dataservice");
  let productId = Number(id);

  return db.User.findOne({ email }).then((result) => {
    if (result) {
      // avoid duplicates
      const exists = result.wishlist.some((w) => w.productId === productId);
      if (!exists) result.wishlist.push({ productId });
      return result.save().then(() => {
        return {
          statusCode: 200,
          message: `product id ${productId} added to wishlist`,
        };
      });
    } else {
      return {
        statusCode: 404,
        message: "Invalid / server error",
      };
    }
  });
};

// removeFromWishlist
const removeFromWishlist = (email, id) => {
  console.log("Inside removefromwishlist function in dataservice");
  let productId = Number(id);

  return db.User.updateOne(
    { email },
    {
      $pull: {
        wishlist: { productId },
      },
    }
  ).then((result) => {
    if (result) {
      return {
        statusCode: 200,
        message: `product id ${productId} removed from wishlist..`,
      };
    } else {
      return {
        statusCode: 404,
        message: "Invalid / server error",
      };
    }
  });
};

// addToCart
const addToCart = (email, id, count) => {
  console.log("Inside addToCart function in dataservice");
  let productId = Number(id);
  count = Number(count) || 1;

  return db.User.findOne({ email }).then((result) => {
    if (result) {
      // if product exists in cart update count, else push
      const cartItem = result.cart.find((c) => c.productId === productId);
      if (cartItem) {
        cartItem.count = (cartItem.count || 0) + count;
      } else {
        result.cart.push({ productId, count });
      }
      return result.save().then(() => {
        return {
          statusCode: 200,
          message: `product id ${productId} added to cart`,
        };
      });
    } else {
      return {
        statusCode: 404,
        message: "Invalid / server error",
      };
    }
  });
};

// removeFromCart
const removeFromCart = (email, id) => {
  console.log("Inside removeFromCart function in dataservice");
  let productId = Number(id);

  return db.User.updateOne(
    { email },
    {
      $pull: {
        cart: { productId },
      },
    }
  ).then((result) => {
    if (result) {
      return {
        statusCode: 200,
        message: `product id ${productId} removed from cart..`,
      };
    } else {
      return {
        statusCode: 404,
        message: "Invalid / server error",
      };
    }
  });
};

// emptyCart
const emptyCart = (email) => {
  console.log("Inside emptyCart function in dataservice");

  return db.User.findOneAndUpdate(
    { email },
    {
      $set: {
        cart: [],
      },
    }
  ).then((result) => {
    if (result) {
      return {
        statusCode: 200,
        message: `cart is empty..`,
      };
    } else {
      return {
        statusCode: 404,
        message: "Invalid / server error",
      };
    }
  });
};

// updateCartItemCount
const updateCartItemCount = (email, id, count) => {
  console.log("Inside updateCartItemCount function in dataservice");
  let productId = Number(id);
  count = Number(count);
  return db.User.findOneAndUpdate(
    { email, "cart.productId": productId },
    {
      $set: {
        "cart.$.count": count,
      },
    }
  ).then((result) => {
    if (result) {
      return {
        statusCode: 200,
        message: `product id ${productId} item count  updated..`,
      };
    } else {
      return {
        statusCode: 404,
        message: "Invalid / server error",
      };
    }
  });
};

// getWishlist
const getWishlist = (email) => {
  console.log("Inside getWishlist function in dataservice");
  return db.User.findOne({ email }).then((result) => {
    if (result) {
      const token = jwt.sign({ email }, "B68DC6BECCF4A68C3D8D78FE742E2", {
        algorithm: "HS256",
      });
      return {
        statusCode: 200,
        message: `got my items of ${result.username}`,
        username: result.username,
        checkout: result.checkout,
        wishlist: result.wishlist,
        cart: result.cart,
        email,
        token,
      };
    } else {
      return {
        statusCode: 403,
        message: "Invalid email / server issues",
      };
    }
  });
};

// getMyOrders
const getMyOrders = (email) => {
  console.log("Inside getMyOrders function in dataservice");
  return db.User.findOne({ email }).then((result) => {
    if (result) {
      return {
        statusCode: 200,
        message: `got orders of ${result.username}`,
        checkout: result.checkout,
      };
    } else {
      return {
        statusCode: 403,
        message: "Invalid email / server issues",
      };
    }
  });
};

// addToCheckout
const addToCheckout = (
  email,
  orderID,
  transactionID,
  dateAndTime,
  amount,
  status,
  products,
  detailes
) => {
  console.log("Inside addToCheckout function in dataservice");
  return db.User.findOne({ email }).then((result) => {
    if (result) {
      result.checkout.push({
        orderID,
        transactionID,
        dateAndTime,
        amount,
        status,
        products,
        detailes,
      });
      return result.save().then(() => {
        return {
          statusCode: 200,
          message: `transaction ${transactionID} added to checkout`,
          name: detailes.name,
          mobile: detailes.mobile,
          orderID,
          transactionID,
          dateAndTime,
          amount,
        };
      });
    } else {
      return {
        statusCode: 404,
        message: "Invalid / server error",
      };
    }
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
