
import React, { useState, useEffect, useRef } from "react";
import { FaSmile, FaPaperclip, FaPaperPlane, FaSearch, FaBell, FaPhone, FaVideo, FaEllipsisV } from "react-icons/fa";
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

// Styles for the entire messenger app
const styles = {
messengerWrapper: {
  display: 'flex',
  position: 'fixed',
  width: '100%',      // ✅ Full available width
  height: '90vh',     // Use 100vh if you want full viewport height
  backgroundColor: '#f0f2f5',
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  overflow: 'hidden',
},


  // Sidebar Styles
  sidebar: {
    width: '340px',
    backgroundColor: '#ffffff',
    borderRight: '1px solid #e4e6ea',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '2px 0 10px rgba(0,0,0,0.08)'
  },

  profileSection: {
    padding: '20px',
    borderBottom: '1px solid #e4e6ea',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: '#fff'
  },

  profileAvatar: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '18px',
    fontWeight: '600'
  },

  profileInfo: {
    flex: 1
  },

  profileName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1c1e21',
    margin: 0
  },

  status: {
    fontSize: '12px',
    color: '#65676b',
    margin: '2px 0 0 0'
  },

  notificationContainer: {
    position: 'relative'
  },

  bellIcon: {
    fontSize: '18px',
    color: '#65676b',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '50%',
    transition: 'all 0.2s ease'
  },

  searchBar: {
    margin: '16px 20px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },

  searchInput: {
    width: '100%',
    padding: '12px 40px 12px 16px',
    border: '1px solid #e4e6ea',
    borderRadius: '20px',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: '#f0f2f5',
    transition: 'all 0.2s ease'
  },

  searchIcon: {
    position: 'absolute',
    right: '14px',
    color: '#65676b',
    fontSize: '14px'
  },

  tabButtons: {
    display: 'flex',
    margin: '0 20px',
    marginBottom: '16px'
  },

  tabButton: {
    flex: 1,
    padding: '10px',
    border: 'none',
    backgroundColor: 'transparent',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    color: '#65676b'
  },

  activeTab: {
    backgroundColor: '#e7f3ff',
    color: '#1877f2'
  },

  chatList: {
    flex: 1,
    overflowY: 'auto',
    padding: '0 8px'
  },

  chatItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    margin: '2px 0',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },

  activeChatItem: {
    backgroundColor: '#e7f3ff'
  },

  avatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '16px',
    fontWeight: '600',
    flexShrink: 0
  },

  chatInfo: {
    flex: 1,
    minWidth: 0
  },

  chatName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1c1e21',
    margin: '0 0 2px 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },

  lastMessage: {
    fontSize: '13px',
    color: '#65676b',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },

  time: {
    fontSize: '11px',
    color: '#65676b',
    flexShrink: 0
  },

  // Chat Area Styles
  chatArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    minHeight: 0 // Prevents flex child from overflowing parent
  },

  chatPanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden' // Prevents the panel from growing beyond its flex container
  },

  chatHeader: {
    padding: '16px 20px',
    borderBottom: '1px solid #e4e6ea',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
  },

  chatHeaderInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },

  chatHeaderAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '14px',
    fontWeight: '600'
  },

  chatHeaderDetails: {
    display: 'flex',
    flexDirection: 'column'
  },

  chatHeaderName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1c1e21',
    margin: 0
  },

  activeStatus: {
    fontSize: '12px',
    color: '#42b883',
    margin: '2px 0 0 0'
  },

  inactiveStatus: {
    fontSize: '12px',
    color: '#65676b',
    margin: '2px 0 0 0'
  },

  chatIcons: {
    display: 'flex',
    gap: '8px'
  },

  iconBtn: {
    padding: '8px',
    border: 'none',
    backgroundColor: 'transparent',
    borderRadius: '50%',
    cursor: 'pointer',
    color: '#65676b',
    fontSize: '16px',
    transition: 'all 0.2s ease'
  },

  chatMessages: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px 20px',
    backgroundColor: '#f8f9fa'
  },

  noMessagesContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#65676b'
  },

  noMessagesImage: {
    width: '120px',
    height: '120px',
    opacity: 0.6
  },

  message: {
    marginBottom: '16px',
    display: 'flex',
    flexDirection: 'column'
  },

  messageRight: {
    alignItems: 'flex-end'
  },

  messageLeft: {
    alignItems: 'flex-start'
  },

  bubble: {
    maxWidth: '70%',
    padding: '12px 16px',
    borderRadius: '18px',
    position: 'relative',
    wordWrap: 'break-word'
  },

  bubbleRight: {
    backgroundColor: '#0084ff',
    color: 'white',
    borderBottomRightRadius: '4px'
  },

  bubbleLeft: {
    backgroundColor: '#ffffff',
    color: '#1c1e21',
    border: '1px solid #e4e6ea',
    borderBottomLeftRadius: '4px'
  },

  senderName: {
    fontSize: '10px',
    marginBottom: '4px',
    opacity: 0.7
  },

  messageText: {
    fontSize: '14px',
    lineHeight: '1.4',
    margin: 0
  },

  messageImage: {
    maxWidth: '200px',
    borderRadius: '8px',
    marginBottom: '8px'
  },

  timestamp: {
    fontSize: '11px',
    color: '#65676b',
    margin: '4px 8px 0',
    alignSelf: 'flex-end'
  },

  // Chat Input Styles
  chatInputWrapper: {
    borderTop: '1px solid #e4e6ea',
    backgroundColor: '#ffffff',
    padding: '16px 20px'
  },

  previewContainer: {
    display: 'flex',
    gap: '8px',
    marginBottom: '12px',
    flexWrap: 'wrap'
  },

  previewWrapper: {
    position: 'relative',
    borderRadius: '8px',
    overflow: 'hidden'
  },

  previewImg: {
    width: '60px',
    height: '60px',
    objectFit: 'cover',
    borderRadius: '8px'
  },

  removeBtn: {
    position: 'absolute',
    top: '-6px',
    right: '-6px',
    width: '20px',
    height: '20px',
    border: 'none',
    borderRadius: '50%',
    backgroundColor: '#f02849',
    color: 'white',
    fontSize: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  chatInput: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 16px',
    border: '1px solid #e4e6ea',
    borderRadius: '20px',
    backgroundColor: '#f0f2f5'
  },

  messageInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    fontSize: '14px',
    padding: '8px 0'
  },

  inputIcon: {
    fontSize: '18px',
    color: '#65676b',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '50%',
    transition: 'all 0.2s ease'
  },

  sendBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    backgroundColor: '#0084ff',
    color: 'white',
    border: 'none',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },

  emojiPicker: {
    position: 'absolute',
    bottom: '80px',
    right: '20px',
    zIndex: 1000,
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
  },

  // Utility styles
  hide: {
    display: 'none'
  }
};

// ChatInput Component
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
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div style={styles.chatInput}>
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
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
                    />
                </label>
                <button
                    style={styles.sendBtn}
                    onClick={onSend}
                    type="button"
                    aria-label="Send message"
                >
                    <FaPaperPlane /> Send
                </button>
            </div>

            {showEmojiPicker && (
                <div style={styles.emojiPicker}>
                    <Picker onEmojiClick={handleEmojiClick} height={350} width={280} />
                </div>
            )}
        </div>
    );
};

// ChatPanel Component
const ChatPanel = () => {
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

  return (
    <div style={styles.chatPanel}>
      <div style={styles.chatHeader}>
        <div style={styles.chatHeaderInfo}>
          <div style={styles.chatHeaderAvatar}>
            {partner?.name ? partner.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div style={styles.chatHeaderDetails}>
            <div style={styles.chatHeaderName}>
              {partner?.name === userName ? "You" : partner?.name}
            </div>
            {messages.length > 0 && (
              <div style={partner?.isOnline ? styles.activeStatus : styles.inactiveStatus}>
                {partner?.isOnline ? "Active now" : "Last seen recently"}
              </div>
            )}
          </div>
        </div>

        <div style={styles.chatIcons}>
          <button style={styles.iconBtn}>
            <FaPhone />
          </button>
          <button style={styles.iconBtn}>
            <FaVideo />
          </button>
          <button
            style={styles.iconBtn}
            onClick={() => setShowSearch(!showSearch)}
            title="Search messages"
          >
            <FaSearch />
          </button>
          <button style={styles.iconBtn}>
            <FaEllipsisV />
          </button>
        </div>
      </div>

      {showSearch && (
        <input
          type="text"
          style={{
            ...styles.searchInput,
            margin: '12px 20px',
            display: showSearch ? 'block' : 'none'
          }}
          placeholder="Search messages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      )}

      <div style={styles.chatMessages}>
        {messages.length === 0 ? (
          <div style={styles.noMessagesContainer}>
            <img
              src="/assets/messenger.gif"
              style={styles.noMessagesImage}
              alt="No messages"
            />
            <p>No messages yet</p>
            <p>Start a conversation!</p>
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
                      {msg.sender === userId ? "You" : partner?.name}
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

// Sidebar Component
const Sidebar = ({ activeTab, setActiveTab, searchQuery, setSearchQuery }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const dispatch = useDispatch();

  const contacts = useSelector((state) => state.messenger.contacts);
  const chats = useSelector((state) => state.messenger.chats);
  const activeReceiverId = useSelector(
    (state) => state.messenger.activeReceiverId
  );

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
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#0084ff"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );

  return (
    <div style={styles.sidebar}>
      <div style={styles.profileSection}>
        <div style={styles.profileAvatar}>
          {userName ? userName.charAt(0).toUpperCase() : 'U'}
        </div>
        <div style={styles.profileInfo}>
          <div style={styles.profileName}>{userName}</div>
          <div style={styles.status}>Active</div>
        </div>
        <div style={styles.notificationContainer}>
          <FaBell
            style={{
              ...styles.bellIcon,
              backgroundColor: showNotifications ? '#e7f3ff' : 'transparent'
            }}
            onClick={() => setShowNotifications(!showNotifications)}
          />
        </div>
      </div>

      <div style={styles.searchBar}>
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
        <FaSearch style={styles.searchIcon} />
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
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#65676b' }}>
              <p>No recent chats</p>
              <p style={{ fontSize: '12px' }}>Start a new conversation from Contacts</p>
            </div>
          ) : (
            filteredChats.map((chat, index) => (
              <div key={chat.receiver}>
                <div
                  style={{
                    ...styles.chatItem,
                    ...(activeReceiverId === chat.receiverId ? styles.activeChatItem : {}),
                    ':hover': { backgroundColor: '#f2f3f5' }
                  }}
                  onClick={() => dispatch(setActiveReceiverId(chat.receiverId))}
                >
                  <div style={{
                    ...styles.avatar,
                    background: `linear-gradient(135deg, ${['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'][index % 5]}, ${['#ee5a24', '#00d2d3', '#3867d6', '#5f27cd', '#ff9ff3'][index % 5]})`
                  }}>
                    {chat?.name ? chat.name.charAt(0).toUpperCase() : 'U'}
                  </div>

                  <div style={styles.chatInfo}>
                    <div style={styles.chatName}>
                      {chat.name === userName ? "You" : chat?.name}
                    </div>
                    <div style={styles.lastMessage}>
                      {chat.receiverId !== userId && renderTickIcon()}
                      <span style={{ marginLeft: chat.receiverId !== userId ? '4px' : '0' }}>
                        {chat.content.length > 30 ? chat.content.substring(0, 30) + '...' : chat.content}
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

                {index < filteredChats.length - 1 && (
                  <div style={{ 
                    height: '1px', 
                    backgroundColor: '#f0f2f5', 
                    margin: '0 16px' 
                  }} />
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "Contacts" && (
        <div style={styles.chatList}>
          {filteredContacts.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#65676b' }}>
              <p>No contacts found</p>
            </div>
          ) : (
            filteredContacts.map((contact, index) => (
              <div
                key={contact._id}
                style={styles.chatItem}
                onClick={() => dispatch(setActiveReceiverId(contact.userId))}
              >
                <div style={{
                  ...styles.avatar,
                  background: `linear-gradient(135deg, ${['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a'][index % 5]}, ${['#764ba2', '#f093fb', '#00f2fe', '#0fa2e6', '#fee140'][index % 5]})`
                }}>
                  {contact?.name ? contact.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div style={styles.chatInfo}>
                  <div style={styles.chatName}>{contact.name}</div>
                  <div style={styles.lastMessage}>{contact.mobile}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// Main Messenger Component
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
        if (newMsg.senderId === receiverId || newMsg.receiverId === receiverId) {
            dispatch({ type: "messenger/addMessage", payload: newMsg });
        }
    };

    const handleMessageDeleted = (deletedId) => {
        // Optional future enhancement
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
