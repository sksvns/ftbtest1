const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/balance", require("./routes/balanceRoutes"));
app.use("/api/play", require("./routes/playRoutes"));
app.use("/api/withdraw", require("./routes/withdrawRoutes"));
app.use("/api/deposit", require("./routes/depositRoutes"));

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT || 5000, () =>
      console.log("Server running 🚀")
    );
  })
  .catch(err => console.log(err));
