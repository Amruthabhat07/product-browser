const express = require("express");

const productRoutes = require("./routes/productRoutes");

const app = express();

app.use(express.json());

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Product Browser API is running",
    endpoints: [
      "/health",
      "/products",
      "/products/categories"
    ]
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok"
  });
});

// Product routes
app.use("/products", productRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

