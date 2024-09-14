const express = require("express");
const app = express();
const PORT = 4000;
const cors = require("cors");
const UserRoutes = require("./routes/userRoute");
require("dotenv").config();
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use("/api/v1", UserRoutes);

const { connect } = require("./config/database");
connect();

app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "Your server is up and running....",
  });
});

app.listen(PORT, () => {
  console.log(`App is running at ${PORT}`);
});