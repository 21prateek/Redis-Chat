"use client";

import { Socket } from "socket.io-client";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client"; //with the help of this io we can coonect to the socket server

//SocketProviderProps is a type which is a object which has a key children which is a react node
interface SocketProviderProps {
  children?: React.ReactNode;
}

//so this is a interface which is used to define the type of the context, inisde this we will put some utility function in which we can send message and receive it
interface IsocketContext {
  sendMessage: (message: string) => any; //so this is a function which will take a message as a string and return any
  messages: string[]; //so it will contain all the message, we have made a state of it and then in provide we have passed it that why we have to write it here also because that context provider is of type IsocketContext
}

const SocketContext = React.createContext<IsocketContext | null>(null); //creating a context it is used to pass the data from parent to child

//making custom hook
export const useSocket = () => {
  const state = useContext(SocketContext); //it will use the socket context, which will give us message and sendMessage there are passed in the context provider as values

  if (!state) throw new Error(`State is undefined`);

  //if state is there then just return state
  return state;
};

//so we have a socketProvider whose type is React.FC means functional component
//here parameter children type will be SocketProviderProps only
export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  //so it will contain the socket state
  const [socket, setSocket] = useState<Socket>();

  //it will be a string array of messages
  const [messages, setMessage] = useState<string[]>([]);

  //so this send message will take the message and will send it to the socket server for this we need to use the socket.io client library
  //here we will make a sendMessage funtion whose type is IsocketContext['sendMessage'] which is a function which will take a message as a string and return any and useCallback function is used to memoize the function it helps in performance optimization,it will only change if input have change if input have not change then it has stored the value in cache and will return that only to us
  //so when this sendMessage is called from any front end it will run this call back function
  const sendMessage: IsocketContext["sendMessage"] = useCallback(
    (msg: string) => {
      //this is a function which will take a message as a string and return any
      console.log("Message sent ", msg);

      //if we have socket
      if (socket) {
        //now here we need to emmit an event, so in our socket.ts we have written an event called event:message that will be our event
        socket.emit("event:message", { message: msg }); //so when ehe event emmit message we will pass the message as msg which we go in the useCallback
        //so we are able to emit the message to socket server
      }
    },
    [socket]
  ); //and here we need to give dependency array

  //this will run whenever we will get message back from the server
  const onMessageReceived = useCallback((msg: string) => {
    console.log("from server message received ", msg);
    //so here it is extracting the message from the message object
    const { message } = JSON.parse(msg) as { message: string };

    //so it will set new message as well as pervious message in the message state
    setMessage((prev) => [...prev, message]);
  }, []);

  //when it mount it will try to make socket connection with it
  useEffect(() => {
    const _socket = io("http://localhost:8000"); //here we are connecting to the socket server,io is a function which will take the url of the server and return a socket object

    //so here it says that if there is any message comming from the server we will run this onMessageReceived function
    _socket.on("message", onMessageReceived);

    //after connection is done set the socket
    setSocket(_socket);

    //clean up function
    return () => {
      _socket.off("message", onMessageReceived); //we also need to turn it off
      _socket.disconnect(); //this will disconnect the socket
      setSocket(undefined); //when we disconnect it we need to set it as undefined
    };
  }, []);
  return (
    //SocketContext.Provider is a provider which is used to pass the data from parent to child and value is null
    // value field will contain whatever context we want to pass it to the children so that children can use it
    <SocketContext.Provider value={{ sendMessage, messages }}>
      {children}
    </SocketContext.Provider>
  );
};
