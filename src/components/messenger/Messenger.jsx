import axios from 'axios';
import { toast } from 'react-toastify';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { role, localUrl } from '../../../utils/util';
import { fDateTime } from '../../../utils/format-time';
import AlertDialog from '../../../utils/alertDialogue';
import './ChatApp.css';
import { LinearProgress } from '@mui/material';
import { useLoader } from '../../../utils/loader';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';

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
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);

    // Create object URLs for preview
    const previews = files.map((file) => URL.createObjectURL(file));
    setFilePreviews(previews);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles((prevFiles) => prevFiles?.filter((_, i) => i !== index));
    setFilePreviews((prevPreviews) => prevPreviews?.filter((_, i) => i !== index));
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

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  useEffect(() => {
    setFilteredContacts(
      contacts?.filter((contact) => contact?.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, contacts]);

  useEffect(() => {
    if (selectedContact) {
      fetchMessages(selectedContact._id);
      localStorage.setItem('chat_receiver', selectedContact._id);
    }
  }, [selectedContact]);

  const fetchMessages = async (receiverId) => {
    try {
      showLoader();
      const userId1 = localStorage.getItem('user_id');
      const response = await axios.get(`${localUrl}/get-messages/of-chat/${userId1}/${receiverId}`);
      setMessages(response.data);
      await handleSeenMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to fetch messages.');
    } finally {
      hideLoader();
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
    const selectedReceiverId = localStorage.getItem('chat_receiver');

    const unseenMessages = messagesToMark?.filter((msg) => !msg.seen);

    if (unseenMessages?.length > 0) {
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
    return contacts?.filter((contact) => {
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

  const deleteAmessage = async (messageId) => {
    const selectedReceiverId = localStorage.getItem('chat_receiver');

    const userId = localStorage.getItem('user_id');

    if (!userId) {
      toast.error('User not found. Unable to delete chat.');
      return;
    }

    try {
      const response = await axios.delete(
        `${localUrl}/delete/a/chat-and-message/from/messenger-app/${messageId}/${userId}/${selectedReceiverId}`
      );
      if (response.status === 200) {
        toast.success('Unsent');
        socket.current.emit('messageDeleted', { messageId, receiverId: selectedReceiverId });
        await fetchMessages(selectedContact._id); // Update the message list for the sender
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
    if ((input || selectedFiles?.length > 0) && selectedContact) {
      const formData = new FormData();
      formData.append('senderId', senderId);
      formData.append('receiverId', selectedContact._id);
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

        await handleSeenMessages();
        await fetchMessages(selectedContact._id);
        socket.current.emit('newMessage', {
          content: input,
          images: selectedFiles.map((file) => URL.createObjectURL(file)),
        });
      } catch (error) {
        console.error('Error sending message:', error);
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

  const getTickIndicators = (seen) => (seen ? 'Sent' : 'Sending');
  if (filteredContacts?.length === 0) {
    return <LinearProgress />;
  }

  return (
    // <>
    //   <iframe
    //     src="https://dreamschat.dreamstechnologies.com/html/template/chat.html"
    //     frameborder="0"
    //     style={{ width: '100%', height: '80vh' }}
    //   ></iframe>
    // </>
    <div className="chat-app">
      <Sidebar
        role={role}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filteredContacts={filteredContacts}
        selectedContact={selectedContact}
        handleSelectContact={handleSelectContact}
      />

      <ChatWindow
        selectedContact={selectedContact}
        messages={messages}
        senderId={senderId}
        handleDeleteButtonClick={handleDeleteButtonClick}
        handleSendMessage={handleSendMessage}
        handleFileChange={handleFileChange}
        deleteAmessage={deleteAmessage}
        filePreviews={filePreviews}
        handleRemoveFile={handleRemoveFile}
        fDateTime={fDateTime}
        getTickIndicators={getTickIndicators}
      />

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
