const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const { chats } = require("./data/data");
const colors = require("colors");
const userRoutes = require("./routes/user");
const { notFound, errorHandler } = require("./middleware/errorMiddleWare");

const app = express();
dotenv.config();
connectDB();

app.use(
  cors({
    origin: "http://192.168.1.8:3000",
  })
);
app.use(express.json());
app.get("/", (req, res) => {
  res.send(chats);
});

app.use("/api/user", userRoutes);
const PORT = process.env.PORT || 3000;

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`UP on port ${PORT}`.yellow.bold);
});
