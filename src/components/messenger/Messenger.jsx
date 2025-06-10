import React, { useState, useEffect, useRef } from "react";
import styles from "./Messenger.module.css";
import Sidebar from "./Sidebar/Sidebar";
import ChatPanel from "./ChatPanel/ChatPanel";
import ChatInput from "./ChatInput/ChatInput";
import { userId } from "../../../utils/util";
import { useDispatch, useSelector } from "react-redux";
import { sendMessages } from "../redux/reducers/messenger/messenger";
import { toast } from "react-toastify";

const Messenger = () => {
    const [activeTab, setActiveTab] = useState("Contacts");
    const [searchQuery, setSearchQuery] = useState("");
    const [message, setMessage] = useState("");
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [filePreviews, setFilePreviews] = useState([]);

    const dispatch = useDispatch();
    const receiverId = useSelector((state) => state.messenger.activeReceiverId);
    const reduxMessages = useSelector((state) => state.messenger.messages);
    const senderId = userId;

    const socket = useRef(null);

    // Connect socket and handle listeners
    useEffect(() => {
        socket.current = window.io("https://hotel-backend-tge7.onrender.com");

        if (senderId) {
            socket.current.emit("registerUser", senderId);
            socket.current.emit("userStatus", { senderId, isOnline: true });
        }

        socket.current.on("newMessage", handleNewMessage);
        socket.current.on("messageDeleted", handleMessageDeleted);
        socket.current.on("userStatusUpdate", (statusUpdate) => {
        });
        socket.current.on("messageSeen", (seenInfo) => {
        });

        return () => {
            if (senderId) {
                socket.current.emit("userStatus", { senderId, isOnline: false });
            }
            socket.current.disconnect();
        };
    }, [senderId]);

    // Emit from frontend after sending message
    const handleSendMessage = async (event) => {
        event.preventDefault();

        if (!receiverId) return toast.error("No contact selected.");
        if (!message.trim() && selectedFiles.length === 0)
            return toast.error("Please enter a message or select a file.");

        const formData = new FormData();
        formData.append("senderId", senderId);
        formData.append("receiverId", receiverId);
        formData.append("content", message.trim());
        formData.append("timestamp", new Date().toISOString());
        formData.append("seen", false);
        selectedFiles.forEach((file) => formData.append("images", file));

        try {
            await dispatch(sendMessages(formData));

            socket.current.emit("newMessage", {
                content: message.trim(),
                images: selectedFiles.map((file) => URL.createObjectURL(file)),
                senderId,
                receiverId,
                timestamp: new Date().toISOString()
            });

            setMessage("");
            setSelectedFiles([]);
            setFilePreviews([]);
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("Failed to send message.");
        }
    };

    const handleNewMessage = (newMsg) => {
        // Optionally filter by current chat receiver
        if (newMsg.senderId === receiverId || newMsg.receiverId === receiverId) {
            dispatch({ type: "messenger/addMessage", payload: newMsg });
        }
    };

    

    const handleMessageDeleted = (deletedId) => {
        // Optional future enhancement
    };

    return (
        <div className={styles.messengerWrapper}>
            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
            />

            <div className={styles.chatArea}>
                <ChatPanel messages={reduxMessages} />
                <ChatInput
                    message={message}
                    setMessage={setMessage}
                    onSend={handleSendMessage}
                    selectedFiles={selectedFiles}
                    setSelectedFiles={setSelectedFiles}
                    filePreviews={filePreviews}
                    setFilePreviews={setFilePreviews}
                />
            </div>
        </div>
    );
};

export default Messenger;
