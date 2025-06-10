import React, { useEffect, useRef, useState } from "react";
import { FaEllipsisV } from "react-icons/fa";
import styles from "./ChatPanel.module.css";
import { useDispatch, useSelector } from "react-redux";
import { getPartnerById } from "src/components/redux/reducers/partner";
import { addMessage, getMessages } from "src/components/redux/reducers/messenger/messenger";
import { localUrl, userId } from "../../../../utils/util"; // assume this returns current user's MongoDB ID

const ChatPanel = () => {
    const [menuIndex, setMenuIndex] = useState(null);
    const dispatch = useDispatch();
    const socket = useRef(null);
    const partner = useSelector((state) => state.partner.data);
    const receiverId = useSelector((state) => state.messenger.activeReceiverId);
    const messages = useSelector((state) => state.messenger.messages);
    const bottomRef = useRef(null);

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        alert("Message copied!");
        setMenuIndex(null);
    };

    const handleUnsend = (index) => {
        alert(`Unsend message ${index}`);
        setMenuIndex(null);
    };
    console.log("here is my rec and user", userId, receiverId)
    useEffect(() => {
        if (receiverId) {
            const payload = {
                userId1: receiverId,
                userId2: userId
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

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp?.$date || timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    useEffect(() => {
    socket.current = window.io(`${localUrl}`);

        const handleNewMessage = (newMessage) => {
            console.log("Socket received:", newMessage);

            // Optional: filter only messages from/to current user
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
    return (
        <div className={styles.chatPanel}>
            <div className={styles.chatHeader}>
                <div>
                    <div className={styles.chatName}>{partner?.name}</div>
                    {
                        messages.length > 0 && <div className={styles.status}>
                            {partner?.isOnline ? "Active" : "Not Active"}</div>
                    }

                </div>
                <div className={styles.chatIcons}>
                    <span className={styles.circleIcon} />
                    <span className={styles.circleIcon} />
                    <span className={styles.circleIcon} />
                </div>
            </div>

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
                        {messages.map((msg, index) => {
                            const senderId = msg.sender?.$oid || msg.sender;
                            const isCurrentUser = senderId === userId;

                            return (
                                <div
                                    key={msg._id?.$oid || index}
                                    className={`${styles.message} ${isCurrentUser ? styles.messageRight : styles.messageLeft}`}
                                >
                                    <div className={styles.bubble}>
                                        <div className={styles.bubbleContent}>
                                            <div className={styles.messageText}>{msg.content}</div>
                                            {/* <div className={styles.menuWrapper}>
                                                <FaEllipsisV
                                                    className={styles.optionsIcon}
                                                    onClick={() => setMenuIndex(menuIndex === index ? null : index)}
                                                />
                                                {menuIndex === index && (
                                                    <div className={styles.optionsMenu}>
                                                        <div onClick={() => handleCopy(msg.content)}>Copy</div>
                                                        <div onClick={() => handleUnsend(index)}>Unsend</div>
                                                    </div>
                                                )}
                                            </div> */}
                                        </div>
                                    </div>
                                    <div className={styles.timestamp}>{formatTimestamp(msg.timestamp)}</div>
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
