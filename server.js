const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const imageDetailsRouter = require("./routes/image_details");

const app = express();

app.use(express.json());

app.use(cors());

// connectDB();

app.use("/api/image-details", imageDetailsRouter);

const PORT = 5000;
app.listen(PORT, () => console.log("listening on port " + PORT));
