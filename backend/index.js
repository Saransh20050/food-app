const express = require("express");
const cors = require("cors");
const dataService = require("./services/dataServices");
const server = express();
const jwt = require("jsonwebtoken");

server.use(
  cors({
    origin: "http://localhost:4200",
  })
);
server.use(express.json());

server.listen(3000, () => {
  console.log("cart server listening at port number 3000");
});

// Application specific middleware
const appMiddleware = (req, res, next) => {
  console.log("inside application middleware");
  next();
};

server.use(appMiddleware);

// Token verify middleware
const jwtMiddleware = (req, res, next) => {
  console.log("inside router specific middleware");
  const token = req.headers["access-token"];
  console.log(token);
  try {
    const data = jwt.verify(token, "B68DC6BECCF4A68C3D8D78FE742E2");
    req.email = data.email;
    console.log("valid token");
    next();
  } catch {
    console.log("invalid token");
    res.status(401).json({
      message: "Please Login!",
    });
  }
};

// ------------------- ROUTES ------------------- //

// Register
server.post("/register", (req, res) => {
  dataService
    .register(req.body.username, req.body.email, req.body.password)
    .then((result) => res.status(result.statusCode).json(result));
});

// Login
server.post("/login", (req, res) => {
  dataService
    .login(req.body.email, req.body.password)
    .then((result) => res.status(result.statusCode).json(result));
});

// All products
server.get("/all-products", (req, res) => {
  dataService.allProducts().then((result) => res.status(result.statusCode).json(result));
});

// View product
server.get("/view-product/:productId", (req, res) => {
  dataService.viewProduct(req.params.productId).then((result) =>
    res.status(result.statusCode).json(result)
  );
});

// Search product
server.get("/search/:key", (req, res) => {
  dataService.searchProducts(req.params.key).then((result) =>
    res.status(result.statusCode).json(result)
  );
});

// Wishlist
server.post("/addToWishlist", jwtMiddleware, (req, res) => {
  dataService
    .addToWishlist(req.body.email, req.body.productId)
    .then((result) => res.status(result.statusCode).json(result));
});

server.put("/removeFromWishlist", jwtMiddleware, (req, res) => {
  dataService
    .removeFromWishlist(req.body.email, req.body.productId)
    .then((result) => res.status(result.statusCode).json(result));
});

// Cart
server.post("/addToCart", jwtMiddleware, (req, res) => {
  dataService
    .addToCart(req.body.email, req.body.productId, req.body.count)
    .then((result) => res.status(result.statusCode).json(result));
});

server.put("/removeFromCart", jwtMiddleware, (req, res) => {
  dataService
    .removeFromCart(req.body.email, req.body.productId)
    .then((result) => res.status(result.statusCode).json(result));
});

server.put("/updateCartItemCount", jwtMiddleware, (req, res) => {
  dataService
    .updateCartItemCount(req.body.email, req.body.productId, req.body.count)
    .then((result) => res.status(result.statusCode).json(result));
});

server.put("/emptyCart", jwtMiddleware, (req, res) => {
  dataService.emptyCart(req.body.email).then((result) =>
    res.status(result.statusCode).json(result)
  );
});

// Get my wishlist / orders
server.get("/getWishlist/:email", jwtMiddleware, (req, res) => {
  dataService.getWishlist(req.params.email).then((result) =>
    res.status(result.statusCode).json(result)
  );
});

server.get("/getMyOrders/:email", jwtMiddleware, (req, res) => {
  dataService.getMyOrders(req.params.email).then((result) =>
    res.status(result.statusCode).json(result)
  );
});

// Add to Checkout
server.post("/addToCheckout", jwtMiddleware, (req, res) => {
  dataService
    .addToCheckout(
      req.body.email,
      req.body.orderID,
      req.body.transactionID,
      req.body.dateAndTime,
      req.body.amount,
      req.body.status,
      req.body.products,
      req.body.detailes
    )
    .then((result) => res.status(result.statusCode).json(result));
});

