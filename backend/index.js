// index.js
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

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`cart server listening at port number ${PORT}`);
});

// application specific middleware
const appMiddleware = (req, res, next) => {
  console.log("inside application middleware ->", req.method, req.path);
  next();
};

server.use(appMiddleware);

// token verify middleware
const jwtMiddleware = (req, res, next) => {
  console.log("inside router specific middleware");
  const token = req.headers["access-token"];
  console.log("access-token:", token);
  try {
    const data = jwt.verify(token, "B68DC6BECCF4A68C3D8D78FE742E2");
    req.email = data.email;
    console.log("valid token for", data.email);
    next();
  } catch (err) {
    console.log("invalid token", err?.message);
    res.status(401).json({
      message: "Please Login!",
    });
  }
};

// register api call
server.post("/register", (req, res) => {
  console.log("inside register api", req.body);
  dataService
    .register(req.body.username, req.body.email, req.body.password)
    .then((result) => {
      res.status(result.statusCode).json(result);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ statusCode: 500, message: "Server error" });
    });
});

// login api call
server.post("/login", (req, res) => {
  console.log("inside login api", req.body);
  dataService.login(req.body.email, req.body.password).then((result) => {
    res.status(result.statusCode).json(result);
  });
});

// all products api
server.get("/all-products", (req, res) => {
  dataService.allProducts().then((result) => {
    res.status(result.statusCode).json(result);
  });
});

// search products (new)
server.get("/search/:key", (req, res) => {
  const key = req.params.key || "";
  console.log("search request for:", key);
  dataService.searchProducts(key).then((result) => {
    res.status(result.statusCode).json(result);
  });
});

// view product api
server.get("/view-product/:productId", (req, res) => {
  const id = req.params.productId;
  dataService.viewProduct(id).then((result) => {
    res.status(result.statusCode).json(result);
  });
});

// add to wishlist (requires login)
server.post("/addToWishlist", jwtMiddleware, (req, res) => {
  console.log("inside addtowishlist api", req.body);
  dataService
    .addToWishlist(req.body.email, req.body.productId)
    .then((result) => {
      res.status(result.statusCode).json(result);
    });
});

// removeFromWishlist
server.put("/removeFromWishlist", jwtMiddleware, (req, res) => {
  console.log("inside removeFromWishlist api", req.body);
  dataService
    .removeFromWishlist(req.body.email, req.body.productId)
    .then((result) => {
      res.status(result.statusCode).json(result);
    });
});

// addToCart
server.post("/addToCart", jwtMiddleware, (req, res) => {
  console.log("inside addToCart api", req.body);
  dataService
    .addToCart(req.body.email, req.body.productId, req.body.count)
    .then((result) => {
      res.status(result.statusCode).json(result);
    });
});

// removeFromCart
server.put("/removeFromCart", jwtMiddleware, (req, res) => {
  console.log("inside removeFromCart api", req.body);
  dataService
    .removeFromCart(req.body.email, req.body.productId)
    .then((result) => {
      res.status(result.statusCode).json(result);
    });
});

// updateCartItemCount
server.put("/updateCartItemCount", jwtMiddleware, (req, res) => {
  console.log("inside updateCartItemCount api", req.body);
  dataService
    .updateCartItemCount(req.body.email, req.body.productId, req.body.count)
    .then((result) => {
      res.status(result.statusCode).json(result);
    });
});

// emptyCart
server.put("/emptyCart", jwtMiddleware, (req, res) => {
  console.log("inside emptyCart api", req.body);
  dataService.emptyCart(req.body.email).then((result) => {
    res.status(result.statusCode).json(result);
  });
});

// get wishlist / my items
server.get("/getWishlist/:email", jwtMiddleware, (req, res) => {
  console.log("getWishlist for", req.params.email);
  dataService.getWishlist(req.params.email).then((result) => {
    res.status(result.statusCode).json(result);
  });
});

// get my orders
server.get("/getMyOrders/:email", jwtMiddleware, (req, res) => {
  dataService.getMyOrders(req.params.email).then((result) => {
    res.status(result.statusCode).json(result);
  });
});

// addToCheckout
server.post("/addToCheckout", jwtMiddleware, (req, res) => {
  console.log("inside addToCheckout api", req.body);
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
    .then((result) => {
      res.status(result.statusCode).json(result);
    });
});
