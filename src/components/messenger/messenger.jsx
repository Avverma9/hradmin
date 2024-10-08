import axios from 'axios';
import { toast } from 'react-toastify';
import { FiDelete } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import IconButton from '@mui/material/IconButton';
import { role, localUrl } from '../../../utils/util';
import { fDateTime } from '../../../utils/format-time';
import AlertDialog from '../../../utils/alertDialogue';
import './ChatApp.css';
import { LinearProgress } from '@mui/material';
import { FiPaperclip } from 'react-icons/fi';
import { useLoader } from '../../../utils/loader';
const DEFAULT_AVATAR =
  'https://t4.ftcdn.net/jpg/05/11/55/91/360_F_511559113_UTxNAE1EP40z1qZ8hIzGNrB0LwqwjruK.jpg';

const ChatApp = () => {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const { showLoader, hideLoader } = useLoader();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const socket = useRef(null);
  const messagesEndRef = useRef(null);
  const [filePreviews, setFilePreviews] = useState([]);
  const senderId = localStorage.getItem('user_id');
  const selectedReceiverId = localStorage.getItem('chat_receiver');
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);

    // Create object URLs for preview
    const previews = files.map((file) => URL.createObjectURL(file));
    setFilePreviews(previews);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    setFilePreviews((prevPreviews) => prevPreviews.filter((_, i) => i !== index));
  };

  // WebSocket setup
  useEffect(() => {
    socket.current = window.io('https://hotel-backend-tge7.onrender.com');

    if (senderId) {
      socket.current.emit('registerUser', senderId);
      socket.current.emit('userStatus', { senderId, isOnline: true });
    }

    socket.current.on('newMessage', handleNewMessage);
    socket.current.on('userStatusUpdate', handleUserStatusUpdate);
    socket.current.on('messageSeen', handleMessageSeen);

    return () => {
      if (senderId) {
        socket.current.emit('userStatus', { senderId, isOnline: false });
      }
      socket.current.disconnect();
    };
  }, [senderId]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Call scrollToBottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch contacts
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await axios.get(`${localUrl}/get-chat/contacts`);
        const filtered = filterContactsByRole(response.data);
        setContacts(filtered);
        setFilteredContacts(filtered);
      } catch (error) {
        console.error('Error fetching contacts:', error);
        toast.error('Failed to fetch contacts.');
      }
    };

    fetchContacts();
  }, []);

  // Filter contacts based on search term
  useEffect(() => {
    setFilteredContacts(
      contacts.filter((contact) => contact?.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, contacts]);

  // Fetch messages when contact is selected
  useEffect(() => {
    if (selectedContact) {
      fetchMessages(selectedContact._id);
    }
  }, [selectedContact]);

  const fetchMessages = async (receiverId) => {
    try {
      const userId1 = localStorage.getItem('user_id');
      const response = await axios.get(`${localUrl}/get-messages/of-chat/${userId1}/${receiverId}`);
      setMessages(response.data);
      await handleSeenMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to fetch messages.');
    }
  };

  const handleNewMessage = async (newMessage) => {
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    await handleSeenMessages([...messages, newMessage]);
  };

  const handleUserStatusUpdate = ({ senderId, isOnline }) => {
    setContacts((prevContacts) =>
      prevContacts.map((contact) => (contact._id === senderId ? { ...contact, isOnline } : contact))
    );
  };

  const handleMessageSeen = ({ messageId }) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) => (msg._id === messageId ? { ...msg, seen: true } : msg))
    );
  };
  const handleSeenMessages = useCallback(async (messagesToMark) => {
    const userId = localStorage.getItem('user_id');
    const selectedReceiverId = localStorage.getItem('chat_receiver');

    const unseenMessages = messagesToMark.filter((msg) => !msg.seen);

    if (unseenMessages.length > 0) {
      try {
        await Promise.all(
          unseenMessages.map((msg) =>
            axios.post(`${localUrl}/mark-as-seen`, {
              messageId: msg._id,
              receiverId: selectedReceiverId,
            })
          )
        );

        unseenMessages.forEach((msg) => {
          socket.current.emit('messageSeen', {
            messageId: msg._id,
            receiverId: selectedReceiverId,
          });
        });

        // Update state for seen messages
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            unseenMessages.some((um) => um._id === msg._id) ? { ...msg, seen: true } : msg
          )
        );
      } catch (error) {
        console.error('Error marking messages as seen:', error);
      }
    }
  }, []);

  const filterContactsByRole = (contacts) => {
    const localStorageRole = localStorage.getItem('user_role');
    return contacts.filter((contact) => {
      if (localStorageRole === 'PMS') {
        return contact.role !== 'PMS' && contact.role !== 'Developer';
      }
      return true; // Default: no filtering
    });
  };

  const handleDeleteButtonClick = (receiverId) => {
    setChatToDelete({ receiverId });
    setDialogOpen(true);
  };

  const handleDeleteChat = async () => {
    const selectedReceiverId = localStorage.getItem('chat_receiver');

    const userId = localStorage.getItem('user_id');

    if (!userId) {
      toast.error('User not found. Unable to delete chat.');
      return;
    }

    try {
      const response = await axios.delete(
        `${localUrl}/delete/added/chats/from/messenger-app/${userId}/${selectedReceiverId}`
      );
      if (response.status === 200) {
        toast.success('Chat deleted successfully');
        if (selectedContact?._id === selectedReceiverId) {
          setSelectedContact(null);
          setMessages([]);
        }
      } else {
        toast.error('Failed to delete chat. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast.error('An error occurred while deleting the chat. Please try again.');
    } finally {
      setDialogOpen(false);
      setChatToDelete(null);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setChatToDelete(null);
  };

  const handleSelectContact = useCallback((contact) => {
    setSelectedContact(contact);
  }, []);

  const handleSendMessage = async (event) => {
    event.preventDefault();
    const input = event.target.message.value.trim();

    // Check if there is content or selected files
    if ((input || selectedFiles.length > 0) && selectedContact) {
      const formData = new FormData();
      formData.append('senderId', senderId);
      formData.append('receiverId', selectedReceiverId);
      formData.append('content', input);
      formData.append('timestamp', new Date().toISOString());
      formData.append('seen', false);

      // Append each selected file to the FormData
      selectedFiles.forEach((file) => {
        formData.append('images', file); // 'images' is the key used on the server side
      });

      try {
        showLoader();
        await axios.post(`${localUrl}/send-a-message/messenger`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data', // Important for file uploads
          },
        });

        const response = await axios.get(
          `${localUrl}/get-messages/of-chat/${senderId}/${selectedReceiverId}`
        );
        setMessages(response.data);
        await handleSeenMessages(response.data);
        socket.current.emit('newMessage', {
          content: input,
          images: selectedFiles.map((file) => URL.createObjectURL(file)),
        });
      } catch (error) {
        console.error('Error sending message:', error);
        toast.error('Failed to send message.');
      } finally {
        event.target.reset();
        setSelectedFiles([]); // Reset selected files after sending
        setFilePreviews([]); // Clear file previews
        hideLoader();
      }
    } else {
      toast.error('Please enter a message or select a file to send.');
    }
  };

  const getTickIndicators = (seen) => (seen ? 'Seen ✔✔' : '✔️✔️');
  if (filteredContacts.length === 0) {
    return <LinearProgress />;
  }

  return (
    <div className="chat-app">
      <div className="sidebar">
        <div className="search-contact-input">
          {(role === 'Admin' || role === 'Developer') && (
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          )}
        </div>
        <div className="tab-content">
          {filteredContacts.map((contact) => (
            <div
              key={contact._id}
              className={`contact ${selectedContact?._id === contact._id ? 'active' : ''}`}
              onClick={() => handleSelectContact(contact)}
            >
              <img src={contact?.images || DEFAULT_AVATAR} alt={contact.name} />
              <div className="contact-info">
                <p style={{ fontSize: '12px' }}>
                  {contact?.name} ({contact?.role})
                </p>
                <span>{contact?.mobile}</span>
                <span className={`status ${contact.isOnline ? 'online' : 'offline'}`}>
                  {contact.isOnline ? 'Online' : `Last Seen: ${fDateTime(contact.lastSeen)}`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="chat-window">
        {selectedContact ? (
          <>
            <div className="header">
              <div className="header-left">
                <img
                  src={selectedContact.images || DEFAULT_AVATAR}
                  alt={selectedContact.name}
                  className="contact-avatar"
                />
                <div className="contact-info">
                  <p className="contact-name" style={{ fontSize: '12px' }}>
                    {selectedContact.name}
                  </p>
                  <span className="contact-mobile">{selectedContact.mobile}</span>
                  <span className={`status ${selectedContact.isOnline ? 'online' : 'offline'}`}>
                    {selectedContact.isOnline
                      ? 'Online'
                      : `Last Seen: ${fDateTime(selectedContact.lastSeen)}`}
                  </span>
                </div>
              </div>
              <div className="header-right">
                <IconButton
                  aria-label="delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteButtonClick(selectedContact._id);
                  }}
                >
                  <FiDelete />
                </IconButton>
              </div>
            </div>

            <div className="messages">
              {messages.map((msg) => (
                <div
                  key={`${msg._id}-${msg.timestamp}`}
                  className={`message ${msg.sender === senderId ? 'sent' : 'received'}`}
                >
                  <p className="message-content">{msg.content}</p>
                  {msg.images && msg.images.length > 0 && (
                    <div className="attachments">
                      {msg.images.map((image, index) => (
                        <a key={index} href={image} target="_blank" rel="noopener noreferrer">
                          <img
                            src={image}
                            alt={`attachment-${index}`}
                            className="attachment"
                            style={{ cursor: 'pointer' }} // Change cursor to indicate clickability
                          />
                        </a>
                      ))}
                    </div>
                  )}

                  <hr />
                  <span className="tick-indicators">
                    {fDateTime(msg.timestamp)} {getTickIndicators(msg.seen)}
                  </span>
                </div>
              ))}
              <div ref={messagesEndRef} /> {/* Empty div for scrolling */}
            </div>
            <form className="input-area" onSubmit={handleSendMessage}>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                style={{ display: 'none' }}
                id="file-input"
                onChange={handleFileChange}
              />
              <label htmlFor="file-input">
                <FiPaperclip style={{ cursor: 'pointer', marginRight: '8px' }} />
              </label>
              <input type="text" name="message" placeholder="Type your message..." />
              <button type="submit">Send</button>

              {/* File preview section */}
              <div className="file-previews">
                {filePreviews.map((preview, index) => (
                  <div key={index} className="file-preview">
                    <img src={preview} alt={`preview-${index}`} className="preview-image" />
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="remove-file-button"
                    >
                      &times; {/* Cross icon */}
                    </button>
                  </div>
                ))}
              </div>
            </form>
          </>
        ) : (
          <div className="no-chat-selected">
            <img
              src="https://i.pinimg.com/originals/e3/1b/75/e31b752875679b64fce009922f9f0dda.gif"
              alt=""
            />
          </div>
        )}
      </div>

      <AlertDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onConfirm={handleDeleteChat}
        title="Confirm Conversation Delete"
        message="This action will delete the entire conversation between you and the other party. Are you sure you want to delete this chat? This action cannot be undone."
      />
    </div>
  );
};

export default ChatApp;
