import React, { useEffect, useRef, useState } from "react";
import { FaSearch } from "react-icons/fa";
import styles from "./ChatPanel.module.css";
import { useDispatch, useSelector } from "react-redux";
import { getPartnerById } from "src/components/redux/reducers/partner";
import {
    addMessage,
    getMessages,
} from "src/components/redux/reducers/messenger/messenger";
import { localUrl, userId } from "../../../../utils/util";

const ChatPanel = () => {
    const [menuIndex, setMenuIndex] = useState(null);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const dispatch = useDispatch();
    const socket = useRef(null);
    const partner = useSelector((state) => state.partner.data);
    const receiverId = useSelector((state) => state.messenger.activeReceiverId);
    const messages = useSelector((state) => state.messenger.messages);
    const bottomRef = useRef(null);

    useEffect(() => {
        if (receiverId) {
            const payload = {
                userId1: receiverId,
                userId2: userId,
            };
            dispatch(getMessages(payload));
        }
    }, [receiverId, dispatch]);

    useEffect(() => {
        if (receiverId) {
            dispatch(getPartnerById(receiverId));
        }
    }, [receiverId, dispatch]);

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    useEffect(() => {
        socket.current = window.io(`${localUrl}`);

        const handleNewMessage = (newMessage) => {
            if (
                newMessage.sender === receiverId ||
                newMessage.receiver === receiverId
            ) {
                dispatch(addMessage(newMessage));
            }
        };

        socket.current.on("newMessage", handleNewMessage);

        return () => {
            socket.current.off("newMessage", handleNewMessage);
        };
    }, [dispatch, receiverId]);

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp?.$date || timestamp);
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    const filteredMessages = messages.filter((msg) =>
        msg.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className={styles.chatPanel}>
            <div className={styles.chatHeader}>
                <div>
                    <div className={styles.chatName}>{partner?.name}</div>
                    {messages.length > 0 && (
                        <div className={styles.status}>
                            {partner?.isOnline ? "Active" : "Not Active"}
                        </div>
                    )}
                </div>

                <div className={styles.chatIcons}>
                    <button
                        className={styles.iconBtn}
                        onClick={() => setShowSearch(!showSearch)}
                        title="Search messages"
                    >
                        <FaSearch />
                    </button>
                </div>
            </div>

            {showSearch && (
                <input
                    type="text"
                    className={`${styles.searchInput} ${!showSearch ? styles.hide : ""}`}
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            )}


            <div className={styles.chatMessages}>
                {messages.length === 0 ? (
                    <div className={styles.noMessagesContainer}>
                        <img
                            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcxj4fPibWnMDRzETm3_SjKXfX94zZexEX0A&s"
                            alt="No messages found"
                            className={styles.noMessagesImage}
                        />
                    </div>
                ) : (
                    <>
                        {filteredMessages.map((msg, index) => {
                            const senderId = msg.sender?.$oid || msg.sender;
                            const isCurrentUser = senderId === userId;

                            return (
                                <div
                                    key={msg._id?.$oid || index}
                                    className={`${styles.message} ${isCurrentUser
                                        ? styles.messageRight
                                        : styles.messageLeft
                                        }`}
                                >
                                    <div className={styles.bubble}>
                                        <div className={styles.bubbleContent}>
                                            <div className={styles.messageText}>{msg.content}</div>
                                        </div>
                                    </div>
                                    <div className={styles.timestamp}>
                                        {formatTimestamp(msg.timestamp)}
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={bottomRef} />
                    </>
                )}
            </div>
        </div>
    );
};

export default ChatPanel;
