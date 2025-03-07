const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");
dotenv.config();
const imageDetailsRouter = require("./routes/image_detail_routes");

const app = express();

const limiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
  message: "Too many requests from this IP, please try again after a minute",
});

app.use(limiter);

app.use(express.json());

app.use(cors());

// connectDB();

app.use("/api/image-details", imageDetailsRouter);

app.get("/", (req, res) => {
  return res.send("Hello Welcome to WearPair!!!");
});

const PORT = 5000;
app.listen(PORT, () => console.log("listening on port " + PORT));
