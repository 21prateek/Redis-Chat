import http from "http";
import SocketService from "./services/socket";

async function init() {
  const socket = new SocketService();
  const httpServer = http.createServer();
  const PORT = process.env.PORT ? process.env.PORT : 8000;

  socket.socket.attach(httpServer); //here we will attach our http server to that socket, and .socket this is a get function

  httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  socket.initListners(); //we will initilize the socket listner, means here we will listen to the events which are coming from the client side like message, connect, disconnect etc
}
init();
