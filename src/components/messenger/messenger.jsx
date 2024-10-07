import axios from 'axios';
import { toast } from 'react-toastify';
import { FiDelete } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import socketIOClient from 'socket.io-client';

import IconButton from '@mui/material/IconButton';
import { role, localUrl } from '../../../utils/util';
import { fDateTime } from '../../../utils/format-time';
import AlertDialog from '../../../utils/alertDialogue';

import './ChatApp.css';
import { LinearProgress } from '@mui/material';

const DEFAULT_AVATAR =
  'https://t4.ftcdn.net/jpg/05/11/55/91/360_F_511559113_UTxNAE1EP40z1qZ8hIzGNrB0LwqwjruK.jpg';

const ChatApp = () => {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const senderId = localStorage.getItem('user_id');
  const socket = socketIOClient('https://hotel-backend-tge7.onrender.com');
  // WebSocket useEffect
  useEffect(() => {
    socket.current = io('https://hotel-backend-tge7.onrender.com');

    // Emit user status on connect
    if (senderId) {
      socket.current.emit('registerUser', senderId);
      socket.current.emit('userStatus', { senderId, isOnline: true });
    }

    socket.current.on('newMessage', (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    socket.current.on('userStatusUpdate', ({ senderId, isOnline }) => {
      setContacts((prevContacts) =>
        prevContacts.map((contact) =>
          contact._id === senderId ? { ...contact, isOnline } : contact
        )
      );
    });

    socket.current.on('messageSeen', ({ messageId }) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) => (msg._id === messageId ? { ...msg, seen: true } : msg))
      );
    });

    return () => {
      if (senderId) {
        socket.current.emit('userStatus', { senderId, isOnline: false });
      }
      socket.current.disconnect(); // Disconnect when component unmounts
    };
  }, [senderId]);

  // Fetch Contacts
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await axios.get(`${localUrl}/get-chat/contacts`);
        if (response.data) {
          const allContacts = response.data;
          const localStorageRole = localStorage.getItem('user_role'); // Get role from localStorage

          let filteredContacts = allContacts; // Default to all contacts

          // Filter contacts based on localStorage role
          if (localStorageRole === 'PMS') {
            filteredContacts = allContacts.filter((contact) => contact.role !== localStorageRole);
            // Further filter if the role is not 'Developer'
            filteredContacts = filteredContacts.filter((item) => item.role !== 'Developer');
          }

          // Set filtered contacts to state
          setContacts(filteredContacts);
          setFilteredContacts(filteredContacts);
        }
      } catch (error) {
        console.error('Error fetching contacts:', error);
      }
    };

    fetchContacts();
  }, []);

  // Search Contacts
  useEffect(() => {
    if (searchTerm) {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      setFilteredContacts(
        contacts.filter((contact) => contact?.name.toLowerCase().includes(lowercasedSearchTerm))
      );
    } else {
      setFilteredContacts(contacts);
    }
  }, [searchTerm, contacts]);

  // Fetch Messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (selectedContact && location.pathname === '/messenger') {
        try {
          const userId1 = localStorage.getItem('user_id');
          const userId2 = selectedContact._id;

          const response = await axios.get(
            `${localUrl}/get-messages/of-chat/${userId1}/${userId2}`
          );

          if (response.data) {
            setMessages(response.data);

            // Filter unseen messages
            const unseenMessages = response.data.filter((msg) => !msg.seen);

            // Mark unseen messages as seen through API
            await Promise.all(
              unseenMessages.map((msg) =>
                axios.post(`${localUrl}/mark-as-seen`, {
                  messageId: msg._id,
                  receiverId: userId1,
                })
              )
            );

            // Emit 'messageSeen' for each unseen message through WebSocket
            unseenMessages.forEach((msg) => {
              socket.current.emit('messageSeen', {
                messageId: msg._id,
                receiverId: userId2,
              });
            });
          }
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      }
    };

    fetchMessages();
  }, [selectedContact, location.pathname]);

  const handleDeleteButtonClick = (receiverId) => {
    setChatToDelete({ receiverId });
    setDialogOpen(true);
  };

  const handleDeleteChat = async () => {
    const { receiverId } = chatToDelete || {};

    const userId = localStorage.getItem('user_id');
    if (!userId) {
      toast.error('User not found. Unable to delete chat.');
      return;
    }

    try {
      const response = await axios.delete(
        `${localUrl}/delete/added/chats/from/messenger-app/${userId}/${receiverId}`
      );

      if (response.status === 200) {
        toast.success('Chat deleted successfully');
        if (selectedContact && selectedContact._id === receiverId) {
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

  // Handle Send Message
  const handleSendMessage = async (event) => {
    event.preventDefault();
    const input = event.target.message.value;

    if (input.trim() && selectedContact) {
      const newMessage = {
        senderId: localStorage.getItem('user_id'),
        receiverId: selectedContact._id,
        content: input,
        timestamp: new Date().toISOString(),
        seen: false,
      };

      // Send the message through the API first
      try {
        const response = await axios.post(`${localUrl}/send-a-message/messenger`, newMessage);
      } catch (error) {
        console.error('Error sending message:', error);
      }

      event.target.reset();
    }
  };

  const getTickIndicators = (seen) => (seen ? 'Seen ✔✔' : 'Sent ✔️✔️');

  if (filteredContacts?.length === 0) {
    return (
      <div>
        <LinearProgress />
      </div>
    );
  }
  console.log('selected conta', selectedContact);

  return (
    <div className="chat-app">
      <div className="sidebar">
        <div className="search-contact-input">
          {role === 'Admin' ||
            (role === 'Developer' && (
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            ))}
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
                  {contact.isOnline ? 'Online' : 'Offline'}
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
                    {selectedContact.isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
              <div className="header-right">
                <IconButton
                  aria-label="delete"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent click event from bubbling up
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
                  key={msg.timestamp}
                  className={`message ${
                    msg.senderId === localStorage.getItem('user_id') ? 'sent' : 'received'
                  }`}
                >
                  <p className="message-content">{msg.content}</p>
                  <hr />
                  <span className="tick-indicators">
                    {fDateTime(msg.timestamp)} {getTickIndicators(msg.seen)}
                  </span>
                </div>
              ))}
            </div>
            <form className="input-area" onSubmit={handleSendMessage}>
              <input type="text" name="message" placeholder="Type your message..." />
              <button type="submit">Send</button>
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
