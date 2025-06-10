// src/socket.js
import { io } from "socket.io-client";
import { localUrl } from "./util";

const socket = io(`${localUrl}`); // Replace with your backend URL
export default socket;
