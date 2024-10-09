import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("A user connected: ", socket.id);

  socket.on("join-room", (room: string) => {
    const rooms = Array.from(socket.rooms);
    if (!rooms.includes(room)) {
      socket.join(room);
      console.log(`Socket ${socket.id} joined room ${room}`);
    }
  });

  socket.on("leave-room", (room: string) => {
    socket.leave(room);
    console.log(`Socket ${socket.id} left room ${room}`);
    socket.to(room).emit("peer-left", socket.id); // Notify peers in the room
  });

  socket.on("offer", (offer: RTCSessionDescriptionInit, room: string) => {
    console.log(`Received offer for room ${room}`);
    socket.to(room).emit("offer", offer);
  });

  socket.on("answer", (answer: RTCSessionDescriptionInit, room: string) => {
    console.log(`Received answer for room ${room}`);
    socket.to(room).emit("answer", answer);
  });

  socket.on("candidate", (candidate: RTCIceCandidateInit, room: string) => {
    console.log(`Received ICE candidate for room ${room}`);
    socket.to(room).emit("candidate", candidate);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    socket.rooms.forEach((room) => {
      socket.to(room).emit("peer-left", socket.id);
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
