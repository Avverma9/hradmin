/* eslint-disable react/button-has-type */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import axios from 'axios';
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useState, useEffect, useCallback } from 'react';

import { localUrl } from 'src/utils/util';

import './ChatApp.css';

// Default avatar URL or CSS class
const DEFAULT_AVATAR = 'path/to/default-avatar.png'; // Update with the path to your default avatar

const ChatApp = () => {
  const [contacts, setContacts] = useState([]);
  const [chats, setChats] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [activeTab, setActiveTab] = useState('chats'); // Default to 'chats' tab
  const [messages, setMessages] = useState([]);

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
    if (selectedContact) {
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

      fetchMessages();
    }
  }, [selectedContact]); // Fetch messages whenever the selected contact changes

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
        id: messages.length + 1,
        content: input,
        timestamp: new Date().toISOString(),
        type: 'sent',
        seen: false,
      };
      setMessages([...messages, newMessage]);

      // Update the last message for the contact in the chats list
      setChats(
        chats.map((chat) =>
          chat._id === selectedContact._id ? { ...chat, lastMessage: input } : chat
        )
      );

      // Prepare data to send the message
      const senderId = localStorage.getItem('user_id'); // Fetch senderId from localStorage
      const receiverId = selectedContact._id; // Use the selected contact's _id as receiverId
      const content = input; // The message content

      try {
        // Call the API to send the message
        await axios.post(`${localUrl}/send-a-message/messenger`, {
          senderId,
          receiverId,
          content,
        });
      } catch (error) {
        console.error('Error sending message:', error);
      }

      event.target.reset();
    }
  };

  // Function to format timestamp to a readable format
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getHours()}:${date.getMinutes()}`;
  };

  // Function to get tick indicators based on seen status
  const getTickIndicators = (seen) => (seen ? 'Seen ✔✔' : ' Sent ✔️✔️'); // Use different indicators based on the 'seen' status
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
                  <h3>{chat.name}</h3>
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
                  <h3>{contact.name}</h3>
                  <span>{contact.mobile}</span>
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
                <h3>{selectedContact.name}</h3>
                <span>{selectedContact.mobile}</span>
              </div>
            </div>

            <div className="messages">
              {messages.map((msg) => (
                <div key={msg.id} className={`message ${msg.type}`}>
                  <p>{msg.content}</p>
                  <span className="timestamp">{formatTimestamp(msg.timestamp)}</span>
                  <span className="tick-indicators">{getTickIndicators(msg.seen)}</span>
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
