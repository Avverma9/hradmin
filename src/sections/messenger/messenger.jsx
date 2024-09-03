/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable no-shadow */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable consistent-return */
/* eslint-disable react/button-has-type */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import { localUrl } from 'src/utils/util';
import { fDateTime } from 'src/utils/format-time';

import './ChatApp.css';

// Default avatar URL or CSS class
const DEFAULT_AVATAR =
  'https://t4.ftcdn.net/jpg/05/11/55/91/360_F_511559113_UTxNAE1EP40z1qZ8hIzGNrB0LwqwjruK.jpg';

const ChatApp = () => {
  const [ws, setWs] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [maxReconnectAttempts] = useState(5);
  const [contacts, setContacts] = useState([]);
  const [chats, setChats] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [activeTab, setActiveTab] = useState('chats'); // Default to 'chats' tab
  const [messages, setMessages] = useState([]);
  const [pollingInterval, setPollingInterval] = useState(null);
  const location = useLocation();
  const messagesEndRef = useRef(null); // Ref to scroll to the bottom

  // Establish WebSocket connection
  const connectWebSocket = useCallback(() => {
    const socket = new WebSocket('ws://localhost:5000'); // Replace with your WebSocket server URL

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

      // Handle status updates
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
    };

    socket.onclose = (event) => {
      console.log('WebSocket closed', event);
      // Try to reconnect if not manually closed and attempts are less than max
      if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
        setTimeout(() => {
          setReconnectAttempts((prev) => prev + 1);
          connectWebSocket();
        }, 3000); // Reconnect after 3 seconds
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return socket;
  }, [reconnectAttempts, maxReconnectAttempts]);

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

  // Fetch contacts from the API when the component mounts
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
  }, []); // Empty dependency array ensures this runs only once on mount

  // Fetch messages for the selected contact
  useEffect(() => {
    if (selectedContact && location.pathname === '/messenger') {
      const fetchMessages = async () => {
        try {
          const userId1 = localStorage.getItem('user_id'); // Fetch senderId from localStorage
          const userId2 = selectedContact._id;

          // Fetch messages between the current user and selected contact
          const response = await axios.get(
            `${localUrl}/get-messages/of-chat/${userId1}/${userId2}`
          );

          if (response.data) {
            setMessages(response.data);

            // Prepare an array of promises to mark messages as seen
            const markAsSeenPromises = response.data
              .filter((msg) => !msg.seen) // Only process messages that are not seen
              .map((msg) =>
                axios.put(
                  `${localUrl}/mark-as-seen/messages/`,
                  { messageId: msg._id, receiverId: userId1 } // Send data in the body
                )
              );

            // Await all promises to ensure all messages are marked as seen
            await Promise.all(markAsSeenPromises);
          }
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      };

      // Fetch messages immediately and set up polling
      fetchMessages();
      const intervalId = setInterval(fetchMessages, 5000); // Poll every 5 seconds
      setPollingInterval(intervalId); // Save the interval ID for cleanup

      // Cleanup function to clear the interval on unmount or path change
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [selectedContact, location.pathname]);

  // Load chats from localStorage
  useEffect(() => {
    const storedChats = localStorage.getItem('chats');
    if (storedChats) {
      setChats(JSON.parse(storedChats));
    }
  }, []);

  // Save chats to localStorage whenever chats change
  useEffect(() => {
    localStorage.setItem('chats', JSON.stringify(chats));
  }, [chats]);

  // Function to update online status for a specific contact
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

  // Update online status for all contacts
  useEffect(() => {
    contacts.forEach((contact) => {
      updateOnlineStatus(contact._id);
    });
  }, [contacts, updateOnlineStatus]);

  // Update online status when a chat is selected
  useEffect(() => {
    if (selectedContact) {
      updateOnlineStatus(selectedContact._id);
    }
  }, [selectedContact, updateOnlineStatus]);

  const handleSelectContact = useCallback(
    (contact) => {
      setSelectedContact(contact);

      // If the contact is not already in chats, add it
      if (!chats.find((chat) => chat._id === contact._id)) {
        setChats([...chats, { ...contact, lastMessage: '' }]);
      }
    },
    [chats]
  );

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

      // Update the last message for the contact in the chats list
      setChats(
        chats.map((chat) =>
          chat._id === selectedContact._id ? { ...chat, lastMessage: input } : chat
        )
      );

      try {
        // Call the API to send the message
        await axios.post(`${localUrl}/send-a-message/messenger`, newMessage);
      } catch (error) {
        console.error('Error sending message:', error);
      }

      event.target.reset();
    }
  };

  // Function to get tick indicators based on seen status
  const getTickIndicators = (seen) => (seen ? 'Seen ✔✔' : 'Sent ✔️✔️'); // Use different indicators based on the 'seen' status

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
                    msg.receiverId === localStorage.getItem('user_id') ? 'received' : 'sent'
                  }`}
                >
                  <p>{msg.content}</p>
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
    </div>
  );
};

export default ChatApp;
