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
  const socket = useRef(null);
  const messagesEndRef = useRef(null);

  const senderId = localStorage.getItem('user_id');
  const selectedReceiverId = localStorage.getItem('chat_receiver');

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
      const recieverID = localStorage.setItem('chat_receiver', selectedContact._id);
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
        if (selectedContact?._id === receiverId) {
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

    if (input && selectedContact) {
      const newMessage = {
        senderId: localStorage.getItem('user_id'),
        receiverId: selectedContact._id,
        content: input,
        timestamp: new Date().toISOString(),
        seen: false,
      };

      try {
        await axios.post(`${localUrl}/send-a-message/messenger`, newMessage);
        socket.current.emit('newMessage', newMessage); // Emit new message to other clients
      } catch (error) {
        console.error('Error sending message:', error);
        toast.error('Failed to send message.');
      } finally {
        event.target.reset();
      }
    }
  };

  const getTickIndicators = (seen) => (seen ? 'Seen ✔✔' : 'Sent ✔️');
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
                  key={`${msg._id}-${msg.timestamp}`} // Unique key
                  className={`message ${msg.sender === senderId ? 'sent' : 'received'}`}
                >
                  <p className="message-content">{msg.content}</p>
                  <hr />
                  <span className="tick-indicators">
                    {fDateTime(msg.timestamp)} {getTickIndicators(msg.seen)}
                  </span>
                </div>
              ))}
              <div ref={messagesEndRef} /> {/* Empty div for scrolling */}
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
