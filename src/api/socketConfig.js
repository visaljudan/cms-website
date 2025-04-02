import { io } from "socket.io-client";
console.log(import.meta.env.VITE_SOCKET_IO);
const socket = io(import.meta.env.VITE_SOCKET_IO);
socket.on("connect", () => {
  console.log("Connected to Socket.IO server");
});

socket.on("disconnect", () => {
  console.log("Disconnected from Socket.IO server");
});

export default socket;
