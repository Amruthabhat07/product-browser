const express = require("express");

const productRoutes = require("./routes/productRoutes");

const app = express();

app.use(express.json());

app.use("/products", productRoutes);

app.get("/health", (req, res) => {
  res.json({
    status: "ok"
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

