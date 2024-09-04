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

import { localUrl } from 'src/utils/util';
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
  const [chats, setChats] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [activeTab, setActiveTab] = useState('chats');
  const [messages, setMessages] = useState([]);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);
  const location = useLocation();
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
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat._id === message.userId ? { ...chat, online: message.online } : chat
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
          setContacts(response.data);
        }
      } catch (error) {
        console.error('Error fetching contacts:', error);
      }
    };

    fetchContacts();
  }, []);

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

  //= ============================Fetch Chats When Tab Changes==============================//
  useEffect(() => {
    if (activeTab === 'chats') {
      fetchChatsFromServer();
    }
  }, [activeTab]);

  const fetchChatsFromServer = async () => {
    try {
      const response = await axios.get(`${localUrl}/get/added/chats/from/messenger`);
      setChats(response.data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  const updateChatsOnServer = async () => {
    try {
      await axios.post(`${localUrl}/add/to/chat-messenger`, { chats });
    } catch (error) {
      console.error('Error updating chats on server:', error);
    }
  };

  const handleDeleteButtonClick = (chatId) => {
    setChatToDelete(chatId);
    setDialogOpen(true);
  };

  const handleDeleteChat = async () => {
    if (!chatToDelete) return;
    const userId = localStorage.getItem('user_id');
    try {
      const response = await axios.delete(
        `${localUrl}/delete/added/chats/from/messenger-app/${chatToDelete}/${userId}/${selectedContact._id}`
      );

      if (response.status === 200) {
        toast.success('Chat deleted successfully');

        // Refetch chats from the server to update the list
        fetchChatsFromServer();

        if (selectedContact && selectedContact._id === chatToDelete) {
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
        setChats((prevChats) =>
          prevChats.map((chat) => (chat._id === userId ? { ...chat, online: onlineStatus } : chat))
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

  const handleSelectContact = useCallback(
    (contact) => {
      setSelectedContact(contact);

      if (!chats.find((chat) => chat._id === contact._id)) {
        setChats([...chats, { ...contact, lastMessage: '' }]);
      }
    },
    [chats]
  );

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

      setChats(
        chats.map((chat) =>
          chat._id === selectedContact._id ? { ...chat, lastMessage: input } : chat
        )
      );

      try {
        await axios.post(`${localUrl}/send-a-message/messenger`, newMessage);
        updateChatsOnServer(
          chats.map((chat) =>
            chat._id === selectedContact._id ? { ...chat, lastMessage: input } : chat
          )
        );
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
        <div className="tab-menu">
          <button
            className={activeTab === 'chats' ? 'active' : ''}
            onClick={() => setActiveTab('chats')}
          >
            Chats
          </button>
          <button
            className={activeTab === 'contacts' ? 'active' : ''}
            onClick={() => setActiveTab('contacts')}
          >
            Contacts
          </button>
        </div>

        {activeTab === 'chats' && (
          <div className="tab-content">
            {chats.map((chat) => (
              <div
                key={chat._id}
                className={`contact ${selectedContact?._id === chat._id ? 'active' : ''}`}
                onClick={() => handleSelectContact(chat)}
              >
                <img src={chat.images || DEFAULT_AVATAR} alt={chat.name} />
                <div className="contact-info">
                  <p>{chat.name}</p>
                  <p>{chat.lastMessage}</p>
                </div>

                <IconButton
                  aria-label="delete"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent click event from bubbling up
                    handleDeleteButtonClick(chat._id);
                  }}
                >
                  <FiDelete />
                </IconButton>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'contacts' && (
          <div className="tab-content">
            {contacts.map((contact) => (
              <div
                key={contact._id}
                className={`contact ${selectedContact?._id === contact._id ? 'active' : ''}`}
                onClick={() => handleSelectContact(contact)}
              >
                <img src={contact.images || DEFAULT_AVATAR} alt={contact.name} />
                <div className="contact-info">
                  <p>{contact.name}</p>
                  <span>{contact.mobile}</span>
                  <span className={`status ${contact.online ? 'online' : 'offline'}`}>
                    {contact.online ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="chat-window">
        {selectedContact ? (
          <>
            <div className="header">
              <img src={selectedContact.images || DEFAULT_AVATAR} alt={selectedContact.name} />
              <div>
                <p>{selectedContact.name}</p>
                <span>{selectedContact.mobile}</span>
                <span className={`status ${selectedContact.online ? 'online' : 'offline'}`}>
                  {selectedContact.online ? 'Online' : 'Offline'}
                </span>
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
            <h2>Select a contact to start chatting</h2>
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
