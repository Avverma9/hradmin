import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { FiDelete, FiPaperclip, FiMoreHorizontal } from 'react-icons/fi';
import { IconButton, Button, Menu, MenuItem } from '@mui/material';

const ChatWindow = ({
  selectedContact,
  messages,
  senderId,
  handleDeleteButtonClick,
  handleSendMessage,
  handleFileChange,
  filePreviews,
  handleRemoveFile,
  fDateTime,
  getTickIndicators,
  deleteAmessage, // Pass the function to delete a message
}) => {
  const messagesEndRef = useRef(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMessageId, setSelectedMessageId] = useState(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleMenuClick = (event, messageId) => {
    setAnchorEl(event.currentTarget);
    setSelectedMessageId(messageId);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleUnsendMessage = () => {
    if (selectedMessageId) {
      deleteAmessage(selectedMessageId); // Call the delete function
    }
    handleCloseMenu();
  };

  return (
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
                style={{ marginBottom: '25px', position: 'relative' }}
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
                          style={{ cursor: 'pointer' }}
                        />
                      </a>
                    ))}
                  </div>
                )}

                <hr />
                <span className="tick-indicators">
                  {fDateTime(msg.timestamp)} {getTickIndicators(msg.seen)}
                </span>

                {/* Three Dots Icon for Options */}
                <IconButton
                  onClick={(e) => handleMenuClick(e, msg._id)}
                  style={{ position: 'absolute', right: '10px', top: '10px' }}
                >
                  <FiMoreHorizontal />
                </IconButton>

                {/* Menu for Unsending */}
                <Menu
                  anchorEl={anchorEl}
                  keepMounted
                  open={Boolean(anchorEl) && selectedMessageId === msg._id}
                  onClose={handleCloseMenu}
                >
                  <MenuItem onClick={handleUnsendMessage}>Unsend</MenuItem>
                </Menu>
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
                  <Button
                    style={{ backgroundColor: 'transparent', color: 'black' }}
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="remove-file-button"
                  >
                    &times; {/* Cross icon */}
                  </Button>
                </div>
              ))}
            </div>
          </form>
        </>
      ) : (
        <div className="no-chat-selected">
          <img
            src="https://i.pinimg.com/originals/e3/1b/75/e31b752875679b64fce009922f9f0dda.gif"
            alt="No chat selected"
          />
        </div>
      )}
    </div>
  );
};

ChatWindow.propTypes = {
  selectedContact: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    mobile: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    images: PropTypes.arrayOf(PropTypes.string),
    isOnline: PropTypes.bool.isRequired,
    lastSeen: PropTypes.string,
  }),
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      sender: PropTypes.string.isRequired,
      content: PropTypes.string.isRequired,
      images: PropTypes.arrayOf(PropTypes.string),
      timestamp: PropTypes.string.isRequired,
      seen: PropTypes.bool.isRequired,
    })
  ).isRequired,
  senderId: PropTypes.string.isRequired,
  handleDeleteButtonClick: PropTypes.func.isRequired,
  handleSendMessage: PropTypes.func.isRequired,
  deleteAmessage: PropTypes.func.isRequired, // Function to delete a message
  handleFileChange: PropTypes.func.isRequired,
  filePreviews: PropTypes.arrayOf(PropTypes.string).isRequired,
  handleRemoveFile: PropTypes.func.isRequired,
  fDateTime: PropTypes.func.isRequired,
  getTickIndicators: PropTypes.func.isRequired,
};

export default ChatWindow;
