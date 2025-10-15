import React, { useState, useEffect, useRef } from "react";
import { FaSmile, FaPaperclip, FaPaperPlane, FaSearch, FaBell, FaPhone, FaVideo, FaEllipsisV, FaTimes } from "react-icons/fa";
import Picker from "emoji-picker-react";
import { useDispatch, useSelector } from "react-redux";
import { getPartnerById } from "src/components/redux/reducers/partner";
import {
  addMessage,
  getMessages,
  getChats,
  getContacts,
  setActiveReceiverId,
  sendMessages
} from "src/components/redux/reducers/messenger/messenger";
import { localUrl, userId, userName } from "../../../utils/util";
import { toast } from "react-toastify";
import { styles } from "./styles";


const ChatInput = ({
    message,
    setMessage,
    onSend,
    selectedFiles,
    setSelectedFiles,
    filePreviews,
    setFilePreviews,
}) => {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const fileInputRef = useRef(null);

    const handleEmojiClick = (emojiData) => {
        setMessage((prev) => prev + emojiData.emoji);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend(e);
        }
    };

    const handleInputChange = (e) => {
        setMessage(e.target.value);
        setIsTyping(e.target.value.length > 0);
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const newPreviews = files.map((file) => URL.createObjectURL(file));

        setSelectedFiles((prev) => [...prev, ...files]);
        setFilePreviews((prev) => [...prev, ...newPreviews]);

        e.target.value = null;
    };

    const handleRemoveFile = (index) => {
        const updatedFiles = [...selectedFiles];
        const updatedPreviews = [...filePreviews];

        updatedFiles.splice(index, 1);
        URL.revokeObjectURL(updatedPreviews[index]);
        updatedPreviews.splice(index, 1);

        setSelectedFiles(updatedFiles);
        setFilePreviews(updatedPreviews);
    };

    useEffect(() => {
        return () => {
            filePreviews.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [filePreviews]);

    return (
        <div style={styles.chatInputWrapper}>
            {filePreviews.length > 0 && (
                <div style={styles.previewContainer}>
                    {filePreviews.map((src, index) => (
                        <div key={index} style={styles.previewWrapper}>
                            <img
                                src={src}
                                alt={`preview-${index}`}
                                style={styles.previewImg}
                            />
                            <button
                                style={styles.removeBtn}
                                onClick={() => handleRemoveFile(index)}
                                aria-label="Remove image"
                            >
                                <FaTimes />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div style={{
                ...styles.chatInput,
                borderColor: isTyping ? '#667eea' : '#e2e8f0',
                backgroundColor: isTyping ? '#ffffff' : '#f8fafc'
            }}>
                <input
                    type="text"
                    placeholder="Type your message..."
                    value={message}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    style={styles.messageInput}
                    name="message"
                    aria-label="Message input"
                />
                <button
                    style={styles.inputIcon}
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    aria-label="Toggle emoji picker"
                >
                    <FaSmile />
                </button>
                <label style={{...styles.inputIcon, cursor: 'pointer'}} aria-label="Attach file">
                    <FaPaperclip />
                    <input
                        type="file"
                        multiple
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        onChange={handleFileChange}
                        accept="image/*"
                    />
                </label>
                <button
                    style={{
                        ...styles.sendBtn,
                        opacity: (message.trim() || selectedFiles.length > 0) ? 1 : 0.6
                    }}
                    onClick={onSend}
                    type="button"
                    aria-label="Send message"
                    disabled={!message.trim() && selectedFiles.length === 0}
                >
                    <FaPaperPlane /> Send
                </button>
            </div>

            {showEmojiPicker && (
                <div style={styles.emojiPicker}>
                    <Picker 
                        onEmojiClick={handleEmojiClick} 
                        height={380} 
                        width={320}
                        theme="light"
                        previewConfig={{
                            showPreview: false
                        }}
                    />
                </div>
            )}
        </div>
    );
};

const ChatPanel = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const socket = useRef(null);
  const partner = useSelector((state) => state.partner.data);
  const receiverId = useSelector((state) => state.messenger.activeReceiverId);
  const messages = useSelector((state) => state.messenger.messages);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (receiverId) {
      setIsLoading(true);
      const payload = {
        userId1: receiverId,
        userId2: userId,
      };
      dispatch(getMessages(payload)).finally(() => {
        setIsLoading(false);
      });
    }
  }, [receiverId, dispatch]);

  useEffect(() => {
    if (receiverId) {
      dispatch(getPartnerById(receiverId));
    }
  }, [receiverId, dispatch]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
      }
    }, 100);

    return () => clearTimeout(timeout);
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
    msg.content.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (!receiverId) {
    return (
      <div style={styles.chatArea}>
        <div style={styles.emptyState}>
          <div style={styles.emptyStateTitle}>Welcome to Messenger</div>
          <div style={styles.emptyStateText}>
            Select a conversation to start messaging
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.chatPanel}>
      <div style={styles.chatHeader}>
        <div style={styles.chatHeaderInfo}>
          <div style={styles.chatHeaderAvatar}>
            {partner?.name ? partner.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div style={styles.chatHeaderDetails}>
            <div style={styles.chatHeaderName}>
              {partner?.name === userName ? "You" : partner?.name || "User"}
            </div>
            {messages.length > 0 && (
              <div style={partner?.isOnline ? styles.activeStatus : styles.inactiveStatus}>
                {partner?.isOnline ? "Active now" : "Last seen recently"}
              </div>
            )}
          </div>
        </div>

        <div style={styles.chatIcons}>
          {/* 
          <button style={styles.iconBtn} title="Voice call">
            <FaPhone />
          </button>
          <button style={styles.iconBtn} title="Video call">
            <FaVideo />
          </button> 
          */}
          <button
            style={styles.iconBtn}
            onClick={() => setShowSearch(!showSearch)}
            title="Search messages"
          >
            <FaSearch />
          </button>
          {/* <button style={styles.iconBtn} title="More options">
            <FaEllipsisV />
          </button> */}
        </div>
      </div>

      {showSearch && (
        <div style={{ padding: '16px 28px', backgroundColor: '#f8fafc' }}>
          <input
            type="text"
            style={styles.searchInput}
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      <div style={styles.chatMessages}>
        {isLoading ? (
          <div style={styles.loading}>
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div style={styles.noMessagesContainer}>
            <img
              src="/assets/messenger.gif"
              style={styles.noMessagesImage}
              alt="No messages"
            />
            <div style={styles.emptyStateTitle}>No messages yet</div>
            <div style={styles.emptyStateText}>Start a conversation!</div>
          </div>
        ) : (
          <>
            {filteredMessages.map((msg, index) => {
              const senderId = msg.sender?.$oid || msg.sender;
              const isCurrentUser = senderId === userId;
              const isLastMessage = index === filteredMessages.length - 1;

              return (
                <div
                  key={msg._id?.$oid || index}
                  style={{
                    ...styles.message,
                    ...(isCurrentUser ? styles.messageRight : styles.messageLeft)
                  }}
                  ref={isLastMessage ? bottomRef : null}
                >
                  <div style={{
                    ...styles.bubble,
                    ...(isCurrentUser ? styles.bubbleRight : styles.bubbleLeft)
                  }}>
                    <div style={styles.senderName}>
                      {msg.sender === userId ? "You" : partner?.name || "User"}
                    </div>
                    {msg?.images?.length > 0 && (
                      <img
                        src={msg.images[0]}
                        style={styles.messageImage}
                        onError={(e) => (e.target.style.display = "none")}
                        alt="Message attachment"
                      />
                    )}
                    <div style={styles.messageText}>{msg.content}</div>
                  </div>
                  <div style={styles.timestamp}>
                    {formatTimestamp(msg.timestamp)}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};

const Sidebar = ({ activeTab, setActiveTab, searchQuery, setSearchQuery }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const dispatch = useDispatch();

  const contacts = useSelector((state) => state.messenger.contacts);
  const chats = useSelector((state) => state.messenger.chats);
  const activeReceiverId = useSelector((state) => state.messenger.activeReceiverId);

  useEffect(() => {
    if (userId) {
      dispatch(getContacts(userId));
      dispatch(getChats(userId));
    }
  }, [dispatch]);

  const filteredChats = chats.filter((chat) =>
    chat.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredContacts = contacts.filter((contact) =>
    contact.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderTickIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#667eea"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );

  const getAvatarGradient = (index) => {
    const gradients = [
      'linear-gradient(135deg, #667eea, #764ba2)',
      'linear-gradient(135deg, #f093fb, #f5576c)',
      'linear-gradient(135deg, #4facfe, #00f2fe)',
      'linear-gradient(135deg, #43e97b, #38f9d7)',
      'linear-gradient(135deg, #fa709a, #fee140)',
      'linear-gradient(135deg, #a8edea, #fed6e3)',
      'linear-gradient(135deg, #ff9a9e, #fecfef)',
      'linear-gradient(135deg, #a18cd1, #fbc2eb)'
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div style={styles.sidebar}>
      <div style={styles.profileSection}>
        <div style={styles.profileAvatar}>
          {userName ? userName.charAt(0).toUpperCase() : 'U'}
        </div>
        <div style={styles.profileInfo}>
          <div style={styles.profileName}>{userName || 'User'}</div>
          <div style={styles.status}>Active</div>
        </div>
        <FaBell
          style={{
            ...styles.bellIcon,
            backgroundColor: showNotifications ? 'rgba(255, 255, 255, 0.2)' : 'transparent'
          }}
          onClick={() => setShowNotifications(!showNotifications)}
        />
      </div>

      <div style={styles.searchBar}>
        <FaSearch style={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      <div style={styles.tabButtons}>
        {["Chat", "Contacts"].map((tab) => (
          <button
            key={tab}
            style={{
              ...styles.tabButton,
              ...(activeTab === tab ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Chat" && (
        <div style={styles.chatList}>
          {filteredChats.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyStateTitle}>No recent chats</div>
              <div style={styles.emptyStateText}>
                Start a new conversation from Contacts
              </div>
            </div>
          ) : (
            filteredChats.map((chat, index) => (
              <div
                key={chat.receiver || index}
                style={{
                  ...styles.chatItem,
                  ...(activeReceiverId === chat.receiverId ? styles.activeChatItem : {})
                }}
                onClick={() => dispatch(setActiveReceiverId(chat.receiverId))}
              >
                <div style={{
                  ...styles.avatar,
                  background: getAvatarGradient(index)
                }}>
                  {chat?.name ? chat.name.charAt(0).toUpperCase() : 'U'}
                </div>

                <div style={styles.chatInfo}>
                  <div style={styles.chatName}>
                    {chat.name === userName ? "You" : chat?.name || "User"}
                  </div>
                  <div style={styles.lastMessage}>
                    {chat.receiverId !== userId && renderTickIcon()}
                    <span style={{ marginLeft: chat.receiverId !== userId ? '8px' : '0' }}>
                      {chat.content.length > 32 ? chat.content.substring(0, 32) + '...' : chat.content}
                    </span>
                  </div>
                </div>

                <div style={styles.time}>
                  {new Date(chat.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "Contacts" && (
        <div style={styles.chatList}>
          {filteredContacts.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyStateTitle}>No contacts found</div>
              <div style={styles.emptyStateText}>
                {searchQuery ? 'Try a different search term' : 'Your contacts will appear here'}
              </div>
            </div>
          ) : (
            filteredContacts.map((contact, index) => (
              <div
                key={contact._id || index}
                style={styles.chatItem}
                onClick={() => dispatch(setActiveReceiverId(contact.userId))}
              >
                <div style={{
                  ...styles.avatar,
                  background: getAvatarGradient(index)
                }}>
                  {contact?.name ? contact.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div style={styles.chatInfo}>
                  <div style={styles.chatName}>{contact.name || 'User'}</div>
                  <div style={styles.lastMessage}>{contact.mobile || 'No phone'}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

const Messenger = () => {
    const [activeTab, setActiveTab] = useState("Contacts");
    const [searchQuery, setSearchQuery] = useState("");
    const [message, setMessage] = useState("");
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [filePreviews, setFilePreviews] = useState([]);
    const [isSending, setIsSending] = useState(false);

    const dispatch = useDispatch();
    const receiverId = useSelector((state) => state.messenger.activeReceiverId);
    const reduxMessages = useSelector((state) => state.messenger.messages);
    const senderId = userId;

    const socket = useRef(null);

    useEffect(() => {
        socket.current = window.io("https://hotel-backend-tge7.onrender.com");

        if (senderId) {
            socket.current.emit("registerUser", senderId);
            socket.current.emit("userStatus", { senderId, isOnline: true });
        }

        socket.current.on("newMessage", handleNewMessage);
        socket.current.on("messageDeleted", handleMessageDeleted);
        socket.current.on("userStatusUpdate", (statusUpdate) => {});
        socket.current.on("messageSeen", (seenInfo) => {});

        return () => {
            if (senderId) {
                socket.current.emit("userStatus", { senderId, isOnline: false });
            }
            socket.current.disconnect();
        };
    }, [senderId]);

    const handleSendMessage = async (event) => {
        event.preventDefault();

        if (!receiverId) return toast.error("No contact selected.");
        if (!message.trim() && selectedFiles.length === 0)
            return toast.error("Please enter a message or select a file.");

        setIsSending(true);

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
            toast.success("Message sent!");
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("Failed to send message.");
        } finally {
            setIsSending(false);
        }
    };

    const handleNewMessage = (newMsg) => {
        if (newMsg.senderId === receiverId || newMsg.receiverId === receiverId) {
            dispatch({ type: "messenger/addMessage", payload: newMsg });
        }
    };

    const handleMessageDeleted = (deletedId) => {
    };

    return (
        <div style={styles.messengerWrapper}>
            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
            />

            <div style={styles.chatArea}>
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