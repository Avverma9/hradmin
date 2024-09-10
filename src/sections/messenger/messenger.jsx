/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable no-shadow */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable consistent-return */
/* eslint-disable react/button-has-type */
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiDelete } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useRef, useState, useEffect, useCallback } from 'react';

import IconButton from '@mui/material/IconButton';

import { role, localUrl } from 'src/utils/util';
import { fDateTime } from 'src/utils/format-time';
import AlertDialog from 'src/utils/alertDialogue';

import './ChatApp.css';

const DEFAULT_AVATAR =
  'https://t4.ftcdn.net/jpg/05/11/55/91/360_F_511559113_UTxNAE1EP40z1qZ8hIzGNrB0LwqwjruK.jpg';

const ChatApp = () => {
  const [ws, setWs] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [maxReconnectAttempts] = useState(5);
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);
  const hasUpdatedStatus = useRef(false); // Ref to track status updates

  //= ============================WebSocket==============================//
  const connectWebSocket = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${new URL(localUrl).hostname}${
      window.location.port ? `:${window.location.port}` : ''
    }`;

    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log('WebSocket connected');
      const userId = localStorage.getItem('user_id');
      if (userId) {
        socket.send(JSON.stringify({ type: 'connect', userId }));
      }
      setWs(socket);
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('Received message:', message);

      if (message.type === 'status') {
        setContacts((prevContacts) =>
          prevContacts.map((contact) =>
            contact._id === message.userId ? { ...contact, online: message.online } : contact
          )
        );
      }
      // Handle additional message types here if necessary
    };

    socket.onclose = (event) => {
      console.log('WebSocket closed', event);
      if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
        setTimeout(() => {
          setReconnectAttempts((prev) => prev + 1);
          connectWebSocket();
        }, 3000);
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return socket;
  }, [reconnectAttempts, maxReconnectAttempts, localUrl]);

  useEffect(() => {
    const socket = connectWebSocket();
    return () => {
      if (socket) {
        const userId = localStorage.getItem('user_id');
        if (userId) {
          socket.send(JSON.stringify({ type: 'disconnect', userId }));
        }
        socket.close();
      }
    };
  }, [connectWebSocket]);

  //= ============================Fetch Contacts==============================//
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

          // Update online status for each contact
          await Promise.all(filteredContacts.map((contact) => updateOnlineStatus(contact._id)));

          // Set filtered contacts to state
          setContacts(filteredContacts);
          setFilteredContacts(filteredContacts);
        }
      } catch (error) {
        console.error('Error fetching contacts:', error);
      }
    };

    fetchContacts();
  }, [updateOnlineStatus]);

  //= ============================Search Contacts==============================//
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

  //= ============================Fetch Messages==============================//
  useEffect(() => {
    if (selectedContact && location.pathname === '/messenger') {
      const fetchMessages = async () => {
        try {
          const userId1 = localStorage.getItem('user_id');
          const userId2 = selectedContact._id;
          const response = await axios.get(
            `${localUrl}/get-messages/of-chat/${userId1}/${userId2}`
          );

          if (response.data) {
            setMessages(response.data);
            const markAsSeenPromises = response.data
              .filter((msg) => !msg.seen)
              .map((msg) =>
                axios.put(`${localUrl}/mark-as-seen/messages/`, {
                  messageId: msg._id,
                  receiverId: userId1,
                })
              );
            await Promise.all(markAsSeenPromises);
          }
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      };

      fetchMessages();
      const intervalId = setInterval(fetchMessages, 5000);
      setPollingInterval(intervalId);

      return () => {
        clearInterval(intervalId);
      };
    }
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
    console.log('here is sender and receiver id ', userId, receiverId);
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

  //= ============================Update Online Status==============================//
  const updateOnlineStatus = useCallback(async (userId) => {
    try {
      const response = await axios.get(`${localUrl}/update-status-of-a-user/messenger/${userId}`);
      if (response.status === 200) {
        const onlineStatus = response.data.online;
        setContacts((prevContacts) =>
          prevContacts.map((contact) =>
            contact._id === userId ? { ...contact, online: onlineStatus } : contact
          )
        );
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  }, []);

  useEffect(() => {
    if (!hasUpdatedStatus.current) {
      contacts.forEach((contact) => {
        updateOnlineStatus(contact._id);
      });
      hasUpdatedStatus.current = true; // Mark status as updated
    }
  }, [contacts, updateOnlineStatus]);

  useEffect(() => {
    if (selectedContact) {
      updateOnlineStatus(selectedContact._id);
    }
  }, [selectedContact, updateOnlineStatus]);

  const handleSelectContact = useCallback((contact) => {
    setSelectedContact(contact);
  }, []);

  //= ============================Handle Send Message==============================//
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

      setMessages([...messages, newMessage]);

      try {
        await axios.post(`${localUrl}/send-a-message/messenger`, newMessage);
      } catch (error) {
        console.error('Error sending message:', error);
      }

      event.target.reset();
    }
  };

  const getTickIndicators = (seen) => (seen ? 'Seen ✔✔' : 'Sent ✔️✔️');

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
                <span className={`status ${contact.online ? 'online' : 'offline'}`}>
                  {contact.online ? 'Online' : 'Offline'}
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
                  <span className={`status ${selectedContact.online ? 'online' : 'offline'}`}>
                    {selectedContact.online ? 'Online' : 'Offline'}
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
                    msg.sender === localStorage.getItem('user_id') ? 'sent' : 'received'
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
        message="This action will delete entire conversation between you and the other party make sure you want to delete this chat? This action cannot be undone."
      />
    </div>
  );
};

export default ChatApp;
