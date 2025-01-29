import { Server } from "socket.io";
import Redis from "ioredis";

//so we need two thing from our redis one is to public the message and second is for suscribing
//so there thing are taken from our redis server which we made in avien
const pub = new Redis({
  host: "caching-a72fef-prateekgurung21-fdb3.g.aivencloud.com",
  port: 12726,
  username: "default",
  password: process.env.password,
});
const sub = new Redis({
  host: "caching-a72fef-prateekgurung21-fdb3.g.aivencloud.com",
  port: 12726,
  username: "default",
  password: process.env.password,
});

class SocketService {
  private io: Server;
  constructor() {
    console.log("Socket service initialized");
    //initialize socket.io server like we did in websockets
    this.io = new Server({
      cors: {
        //so we need to do this cors function so that it can connect to our frontend
        allowedHeaders: ["*"], //this * means allow eveything
        origin: "*",
      },
    });

    //so here we will suscirbe to our redis, means this socket will be subscribed to that redis channel so that it can put out the message
    //so it will subscribe to messages channel
    sub.subscribe("MESSAGES");
  }

  //getter function
  get socket() {
    return this.io;
  }

  //all the listners thing which will occure in socket.io will be in this
  public initListners() {
    const io = this.socket; //calling the getter function
    console.log("Initiliqzing socket listners");

    //when if connects
    io.on("connect", async (socket) => {
      //whenever a client is connected
      console.log("New socket connected with id ", socket.id);

      //when ever there is an event message from the front end means whenever frontend emmits a message
      socket.on("event:message", async ({ message }: { message: string }) => {
        console.log("New message received ", message);

        //so whenever message comes to the server we need to public this message to the redis , for that we need to install a package called ioredis
        //we will publish that message, so this pub is a redis and we are publishing in this redis
        //first parameter is in which channel we want to public here it is :MESSAGES (so in redis we have a channel called message on that we are publish), second paramerer will be the thing we want to publish so it will be a json string of message,so we are publishing our message to the redis server , so the frontend will send message to server and then this socket server will send message to the redis pub sub the server could have directly given it to its client but what if there was another user which is in socket 2 server and he has suscribed to the messages thing so he wont get the message so then we send it to redis pubsub and as redis pubsub is connected to that socket 2 server so message can travel to him, now that socket 2 server will pull the message from the redis pubsub so that it can send message to its users to socket 1 will also send message to its user but it will also send to redis and same goes in socket 2 server if someone from there send message socket 2 will send it to redis and then same process,
        await pub.publish("MESSAGES", JSON.stringify({ message }));
      });
    });

    //as we have suscribe to messages channel in the constructor only so sub.on message means whereever there is message
    //so other paramter is in which channel did the message come and what was the message
    sub.on("message", (channel, message) => {
      //so here if our subscriber get any message from reddis then we need to do this
      //check if MESSAGES as we have only one channel right now
      if (channel === "MESSAGES") {
        //so we need to forward this message to our client as it is
        //so socket io will emit a message, and we will emit that above particular message
        io.emit("message", message);
      }
    });
  }
}

export default SocketService;
