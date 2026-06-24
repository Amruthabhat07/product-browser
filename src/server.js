const express = require("express");

const productRoutes = require("./routes/productRoutes");

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    status: "ok"
  });
});

app.use("/products", productRoutes);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

