const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const { chats } = require("./data/data");
const colors = require("colors");
const userRoutes = require("./routes/user");
const { notFound, errorHandler } = require("./middleware/errorMiddleWare");
const chatRoutes = require("./routes/chat");
const messageRoutes = require("./routes/message");
const path = require("path");

const app = express();
dotenv.config();
connectDB();

app.use(
  cors({
    origin: "http://localhost:3001",
  })
);
app.use(express.json());

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

app.get("/", (req, res) => {
  res.send("Api Running...");
});
// // Doply
// const __dirname1 = path.resolve();
// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname1, "../client/build")));
//   console.log(__dirname1);
//   app.get("*", (req, res) => {
//     res.sendFile(path.resolve(__dirname1, "client/build", "index.html"));
//   });
// } else {

// }
const PORT = process.env.PORT || 3000;

app.use(notFound);
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`UP on port ${PORT}`.yellow.bold);
});

const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3001",
    // methods: ["GET", "POST"],
    // allowedHeaders: ["my-custom-header"],
    // credentials: true,
  },
});
io.on("connection", (socket) => {
  console.log("Connected to socket.io");
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;
    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      console.log(user._id);
      console.log(newMessageRecieved.sender._id);

      if (user._id == newMessageRecieved.sender._id) return;

      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});
