"use client";
import { useState } from "react";
import { useSocket } from "../context/SocketProvider";
import classes from "./page.module.css";

export default function Home() {
  const { sendMessage, messages } = useSocket(); //it will give us the state of the socket context, so there we have taken the context of useContext(socketContext) and socketContext has created a context of type ISocketContext or null and inside the ISocketContext type we have a sendMessage function which will take the message as an input so in the button component we have sent sendMessage(message) meas send the current message, and it will get message array to
  const [message, setMessage] = useState("");

  return (
    <div>
      <div>
        <input
          type="text"
          placeholder="Message..."
          className={classes["chat-input"]}
          onChange={(e) => setMessage(e.target.value)}
          value={message}
        />
        <button
          className={classes["button"]}
          onClick={(e) => sendMessage(message)}
        >
          Send
        </button>
      </div>
      <div>
        {messages.map((e) => (
          <li>{e}</li>
        ))}
      </div>
    </div>
  );
}
